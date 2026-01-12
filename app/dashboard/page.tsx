import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import DashboardContent from "@/components/dashboard-content"

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      entitlements: {
        where: { active: true },
      },
      lessonProgress: {
        include: {
          lesson: {
            include: {
              module: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
        where: { completed: true },
      },
    },
  })

  // If user doesn't exist in Prisma, redirect to login with error
  if (!dbUser) {
    redirect("/login?error=account_not_created")
  }

  // Redirect admins to admin dashboard
  if (dbUser.role === "ADMIN") {
    redirect("/admin")
  }

  // Get all published courses with their modules and lessons
  // For Starter users without selectedCourseId, we need ALL courses (including locked ones) for selection
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      modules: {
        include: {
          lessons: {
            select: {
              id: true,
              title: true,
              requiredTier: true,
              isFreePreview: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Filter courses based on user tier and selectedCourseId
  const userTierName = dbUser.tier === 0 ? "FREE" : dbUser.tier === 1 ? "STARTER" : dbUser.tier === 2 ? "PRO" : "OPERATOR"
  
  // If Starter user has selectedCourseId, only show that course
  // Otherwise, show all courses (for selection screen) or filter by requiredTiers (for other tiers)
  let accessibleCourses: typeof courses
  let lockedCourses: typeof courses = []
  
  if (dbUser.tier === 1 && dbUser.selectedCourseId) {
    // Starter with selected course: only show that course
    accessibleCourses = courses.filter((course) => course.id === dbUser.selectedCourseId)
    
    // Also get locked courses for upsell (other courses they could have chosen or need PRO for)
    lockedCourses = courses.filter((course) => {
      // Exclude the selected course
      if (course.id === dbUser.selectedCourseId) return false
      
      // Get courses that require PRO or higher, or other Starter-accessible courses they didn't choose
      if (!course.requiredTiers) return true // If no requiredTiers, it's probably accessible to Starter
      
      let courseTiers: string[] = []
      if (typeof course.requiredTiers === "string") {
        try {
          courseTiers = JSON.parse(course.requiredTiers)
        } catch {
          return true
        }
      } else if (Array.isArray(course.requiredTiers)) {
        courseTiers = course.requiredTiers as string[]
      }
      
      // Show courses that require PRO/OPERATOR OR other Starter-accessible courses
      return courseTiers.includes("ALL") || courseTiers.includes("STARTER") || 
             (courseTiers.length > 0 && !courseTiers.includes("ALL") && !courseTiers.includes("STARTER"))
    })
  } else if (dbUser.tier === 1 && !dbUser.selectedCourseId) {
    // Starter without selection: show ALL courses for selection (including locked ones)
    accessibleCourses = courses
  } else {
    // Other tiers: filter by requiredTiers
    accessibleCourses = courses.filter((course) => {
      if (!course.requiredTiers) return true // Backward compatibility
      
      let courseTiers: string[] = []
      if (typeof course.requiredTiers === "string") {
        try {
          courseTiers = JSON.parse(course.requiredTiers)
        } catch {
          return true
        }
      } else if (Array.isArray(course.requiredTiers)) {
        courseTiers = course.requiredTiers as string[]
      }
      
      if (courseTiers.includes("ALL")) return true
      return courseTiers.includes(userTierName)
    })
  }

  // Calculate progress based on all accessible courses
  const allLessons = accessibleCourses.flatMap((c) =>
    c.modules.flatMap((m) => m.lessons)
  )
  
  const totalLessons = allLessons.length
  const completedLessonIds = new Set(
    dbUser.lessonProgress.map((lp) => lp.lessonId)
  )
  const completedLessons = allLessons.filter((l) => completedLessonIds.has(l.id)).length
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Use first course for backward compatibility (or combine all)
  const course = accessibleCourses[0] || null

  // Calculate accurate streak (consecutive days with completed lessons)
  const calculateStreak = () => {
    if (dbUser.lessonProgress.length === 0) return 0

    // Get all completion dates, sorted by date
    const completionDates = dbUser.lessonProgress
      .filter((lp) => lp.completedAt)
      .map((lp) => {
        const date = new Date(lp.completedAt!)
        // Normalize to midnight for date comparison
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      })
      .filter((date, index, self) => self.indexOf(date) === index) // Remove duplicates
      .sort((a, b) => b - a) // Sort descending (most recent first)

    if (completionDates.length === 0) return 0

    // Check if today or yesterday has a completion
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTime = today.getTime()

    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const yesterdayTime = yesterday.getTime()

    // If most recent completion is not today or yesterday, streak is 0
    const mostRecent = completionDates[0]
    if (mostRecent !== todayTime && mostRecent !== yesterdayTime) {
      return 0
    }

    // Count consecutive days
    let streak = 1
    let expectedDate = mostRecent === todayTime ? todayTime : yesterdayTime

    for (let i = 1; i < completionDates.length; i++) {
      expectedDate -= 24 * 60 * 60 * 1000 // Subtract one day
      if (completionDates[i] === expectedDate) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const streak = calculateStreak()

  return (
    <DashboardContent
      user={dbUser}
      course={course}
      progress={{
        totalLessons,
        completedLessons,
        progressPercentage,
        streak,
      }}
      modules={accessibleCourses.flatMap((c) => 
        c.modules.map((m) => ({
          ...m,
          course: {
            id: c.id,
            title: c.title,
            slug: c.slug,
            requiredTiers: c.requiredTiers,
          },
        }))
      ) || []}
      lockedCourses={lockedCourses}
    />
  )
}

