import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // 1. RED FLAGS
    const totalEnrollments = await prisma.entitlement.count({ where: { active: true } })
    const totalCompletions = await prisma.lessonProgress.count({ where: { completed: true } })
    const completionRate = totalEnrollments > 0 ? (totalCompletions / (totalEnrollments * 10)) * 100 : 0 // Assuming ~10 lessons avg

    const refunds = await prisma.order.count({ where: { status: "CANCELLED" } })
    const totalOrders = await prisma.order.count({ where: { status: "APPROVED" } })
    const refundRate = totalOrders > 0 ? (refunds / totalOrders) * 100 : 0

    const totalUsers = await prisma.user.count()
    const totalRevenue = await prisma.order.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
    })
    const revenuePerUser = totalUsers > 0 ? (totalRevenue._sum.amount || 0) / totalUsers : 0

    // 2. USER & ENROLLMENT DATA
    const users = await prisma.user.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        entitlements: {
          where: { active: true },
        },
        lessonProgress: {
          include: { lesson: { include: { module: { include: { course: true } } } } },
          orderBy: { completedAt: "desc" },
          take: 1,
        },
        orders: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    })

    const userData = users.map((u) => {
      const progress = u.lessonProgress.filter((lp) => lp.completed).length
      const totalLessons = u.lessonProgress.length
      const progressPercent = totalLessons > 0 ? (progress / totalLessons) * 100 : 0

      const lastActivity = u.lessonProgress[0]?.completedAt || u.createdAt

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        signupDate: u.createdAt,
        coursesPurchased: u.entitlements.length,
        currentPath: u.entitlements[0]?.tier || "N/A",
        currentLesson: u.lessonProgress[0]?.lesson?.title || "N/A",
        progressPercent: Math.round(progressPercent),
        lastActivity,
      }
    })

    // 3. COURSE & LESSON PERFORMANCE
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                lessonProgress: true,
                _count: {
                  select: { lessonProgress: true },
                },
              },
            },
          },
        },
      },
    })

    // Reuse totalEnrollments calculated earlier (line 30)
    const coursePerformance = courses.map((course) => {
      const allLessons = course.modules.flatMap((m) => m.lessons)
      const completions = allLessons.reduce((acc, lesson) => {
        return acc + lesson.lessonProgress.filter((lp) => lp.completed).length
      }, 0)
      const completionRate = totalEnrollments > 0 ? (completions / (totalEnrollments * allLessons.length)) * 100 : 0

      const courseRevenue = course.modules.reduce((acc, module) => {
        return acc + module.lessons.reduce((acc2, lesson) => {
          // This is simplified - in reality you'd track revenue per course
          return acc2
        }, 0)
      }, 0)

      return {
        id: course.id,
        title: course.title,
        enrollments: totalEnrollments,
        completionRate: Math.round(completionRate),
        revenue: courseRevenue,
        lessons: allLessons.length,
      }
    })

    const lessonPerformance = await prisma.lesson.findMany({
      include: {
        lessonProgress: true,
        _count: {
          select: { lessonProgress: true },
        },
      },
    })

    const lessonData = lessonPerformance.map((lesson) => {
      const views = lesson._count.lessonProgress
      const completions = lesson.lessonProgress.filter((lp) => lp.completed).length
      const completionRate = views > 0 ? (completions / views) * 100 : 0

      return {
        id: lesson.id,
        title: lesson.title,
        views,
        completionRate: Math.round(completionRate),
        completions,
        skips: views - completions,
      }
    })

    // 4. PATH ANALYTICS
    const paths = ["PATH1", "PATH2", "PATH3", "PATH4", "PATH5"]
    const pathAnalytics = await Promise.all(
      paths.map(async (path) => {
        const plans = await prisma.plan.findMany({
          where: { recommendedPath: path as any },
          include: {
            quizResponse: {
              include: {
                user: true,
              },
            },
          },
        })
        const users = plans.map((p) => p.quizResponse?.user).filter(Boolean)

        return {
          path,
          usersStarted: plans.length,
          usersCompleted: 0, // Would need to track this
          revenue: 0, // Would need to track this
          avgTimeToMonetization: 0, // Would need to track this
        }
      })
    )

    // 5. REVENUE & PAYMENTS
    const revenue = {
      gross: totalRevenue._sum.amount || 0,
      net: Math.round((totalRevenue._sum.amount || 0) * 0.94 - 350), // MercadoPago fees
      refunds: refunds,
      refundAmount: 0, // Would need to track this
      byMethod: {
        mercadoPago: totalOrders,
      },
      byTier: await prisma.entitlement.groupBy({
        by: ["tier"],
        where: { active: true },
        _count: true,
      }),
    }

    // 6. ENGAGEMENT & BEHAVIOR
    const dau = await prisma.user.count({
      where: {
        lessonProgress: {
          some: {
            completedAt: {
              gte: todayStart,
            },
          },
        },
      },
    })

    const wau = await prisma.user.count({
      where: {
        lessonProgress: {
          some: {
            completedAt: {
              gte: weekAgo,
            },
          },
        },
      },
    })

    const inactive7d = await prisma.user.count({
      where: {
        lessonProgress: {
          none: {
            completedAt: {
              gte: weekAgo,
            },
          },
        },
        createdAt: {
          lt: weekAgo,
        },
      },
    })

    const inactive14d = await prisma.user.count({
      where: {
        lessonProgress: {
          none: {
            completedAt: {
              gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            },
          },
        },
        createdAt: {
          lt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        },
      },
    })

    // 7. SUPPORT & FEEDBACK
    const supportTickets = await prisma.supportTicket.count({
      where: { status: "open" },
    })

    // 8. CONVERSION FUNNEL
    const quizStarts = await prisma.quizResponse.count()
    const plansCreated = await prisma.plan.count()
    const purchases = await prisma.order.count({ where: { status: "APPROVED" } })
    const firstLessons = await prisma.lessonProgress.count({
      where: {
        lesson: {
          order: 1,
        },
      },
    })

    const funnel = {
      visits: 0, // Would need to track this
      signups: totalUsers,
      purchases,
      firstLesson: firstLessons,
      completions: totalCompletions,
      conversionRates: {
        signupToPurchase: totalUsers > 0 ? (purchases / totalUsers) * 100 : 0,
        purchaseToFirstLesson: purchases > 0 ? (firstLessons / purchases) * 100 : 0,
        firstLessonToCompletion: firstLessons > 0 ? (totalCompletions / firstLessons) * 100 : 0,
      },
    }

    // 9. ALERTS
    const alerts = []
    if (completionRate < 30) {
      alerts.push({
        type: "warning",
        message: `Completion rate is ${Math.round(completionRate)}% - Course quality problem`,
        severity: "high",
      })
    }
    if (refundRate > 5) {
      alerts.push({
        type: "error",
        message: `Refund rate is ${Math.round(refundRate)}% - Promise vs reality mismatch`,
        severity: "high",
      })
    }
    if (revenuePerUser < 1000) {
      alerts.push({
        type: "warning",
        message: `Revenue per user is low - Pricing or upsell issue`,
        severity: "medium",
      })
    }

    return NextResponse.json({
      redFlags: {
        highEnrollmentsLowCompletion: completionRate < 30,
        highRefunds: refundRate > 5,
        highUsersLowRevenue: revenuePerUser < 1000,
        completionRate: Math.round(completionRate),
        refundRate: Math.round(refundRate),
        revenuePerUser: Math.round(revenuePerUser),
      },
      users: userData,
      courses: coursePerformance,
      lessons: lessonData,
      paths: pathAnalytics,
      revenue,
      engagement: {
        dau,
        wau,
        inactive7d,
        inactive14d,
      },
      support: {
        openTickets: supportTickets,
      },
      funnel,
      alerts,
    })
  } catch (error: any) {
    console.error("Error fetching comprehensive analytics:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


