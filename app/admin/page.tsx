import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import AdvancedDashboard from "@/components/admin/advanced-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  })

  if (!dbUser || dbUser.role !== "ADMIN") {
    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL
    if (user.email !== adminEmail) {
      redirect("/dashboard")
    }
  }

  const now = new Date()
  const todayStart = new Date(now.setHours(0, 0, 0, 0))
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Revenue & Sales Metrics
  const [totalRevenue, revenueThisMonth, revenueToday, revenueByTier, recentOrders, couponStats] = await Promise.all([
    // Total revenue (all-time)
    prisma.order.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
      _count: true,
    }),
    // Revenue this month
    prisma.order.aggregate({
      where: {
        status: "APPROVED",
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
      _count: true,
    }),
    // Revenue today
    prisma.order.aggregate({
      where: {
        status: "APPROVED",
        createdAt: { gte: todayStart },
      },
      _sum: { amount: true },
      _count: true,
    }),
    // Revenue by tier (from entitlements)
    prisma.entitlement.groupBy({
      by: ["tier"],
      where: { active: true },
      _count: true,
    }),
    // Recent orders (last 10)
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true } },
        coupon: { select: { code: true } },
      },
    }),
    // Coupon stats
    prisma.coupon.aggregate({
      _sum: { redeemedCount: true },
      _count: true,
    }),
  ])

  // User & Engagement Metrics
  const [totalUsers, activeUsers7d, activeUsers30d, newSignupsToday, newSignupsWeek, newSignupsMonth, quizCompletions, plansCreated, avgProgress] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: weekAgo } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: weekAgo } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: monthStart } },
    }),
    prisma.quizResponse.count(),
    prisma.plan.count(),
    // Average progress calculation
    prisma.lessonProgress.aggregate({
      where: { completed: true },
      _count: true,
    }).then(async (completed) => {
      const totalLessons = await prisma.lesson.count()
      const usersWithProgress = await prisma.user.count({
        where: {
          lessonProgress: {
            some: {},
          },
        },
      })
      if (usersWithProgress === 0 || totalLessons === 0) return 0
      return Math.round((completed._count / (usersWithProgress * totalLessons)) * 100)
    }),
  ])

  // Funnel Metrics (from quiz and plans)
  const [quizStarts, planViews, abandonedCarts] = await Promise.all([
    prisma.quizResponse.count(),
    prisma.plan.count(),
    prisma.abandonedCart.count({
      where: {
        createdAt: { gte: weekAgo },
      },
    }),
  ])

  // Alerts & Quick Actions
  const [pendingPayments, unapprovedTestimonials, pendingOrders] = await Promise.all([
    prisma.order.count({
      where: { status: "IN_PROCESS" },
    }),
    prisma.testimonial.count({
      where: { approved: false },
    }),
    prisma.order.count({
      where: { status: "PENDING" },
    }),
  ])

  // Calculate net revenue (MercadoPago fees ~5.99% + $3.50 MXN per transaction)
  const calculateNetRevenue = (gross: number) => {
    const feePercent = 0.0599
    const feeFixed = 350 // $3.50 MXN in cents
    return Math.round(gross * (1 - feePercent) - feeFixed)
  }

  const stats = {
    revenue: {
      total: {
        gross: totalRevenue._sum.amount || 0,
        net: calculateNetRevenue(totalRevenue._sum.amount || 0),
        count: totalRevenue._count,
      },
      thisMonth: {
        gross: revenueThisMonth._sum.amount || 0,
        net: calculateNetRevenue(revenueThisMonth._sum.amount || 0),
        count: revenueThisMonth._count,
      },
      today: {
        gross: revenueToday._sum.amount || 0,
        net: calculateNetRevenue(revenueToday._sum.amount || 0),
        count: revenueToday._count,
      },
      byTier: revenueByTier,
    },
    users: {
      total: totalUsers,
      active7d: activeUsers7d,
      active30d: activeUsers30d,
      newToday: newSignupsToday,
      newWeek: newSignupsWeek,
      newMonth: newSignupsMonth,
    },
    engagement: {
      quizCompletions,
      plansCreated,
      avgProgress,
    },
    funnel: {
      quizStarts,
      planViews,
      abandonedCarts,
    },
    orders: {
      recent: recentOrders,
      pending: pendingOrders,
    },
    coupons: {
      total: couponStats._count,
      redeemed: couponStats._sum.redeemedCount || 0,
    },
    alerts: {
      pendingPayments,
      unapprovedTestimonials,
      pendingOrders,
    },
    activeCourses: await prisma.course.count({ where: { published: true } }),
  }

  // Use the new advanced dashboard
  return <AdvancedDashboard />
}
