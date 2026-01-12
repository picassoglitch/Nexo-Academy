import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import CoursesCatalog from "@/components/courses-catalog"

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic"

export default async function CursoPage() {
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
        select: {
          lessonId: true,
          completed: true,
        },
      },
    },
  })

  if (!dbUser) {
    redirect("/login")
  }

  // Get all published courses (or all courses if user is admin for debugging)
  const isAdmin = dbUser.role === "ADMIN"

  const courses = await prisma.course.findMany({
    where: isAdmin ? {} : { published: true }, // Admins can see all courses for testing
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
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Filter courses based on requiredTiers and selectedCourseId
  const userTierName = dbUser.tier === 0 ? "FREE" : dbUser.tier === 1 ? "STARTER" : dbUser.tier === 2 ? "PRO" : "OPERATOR"
  
  // Separate accessible and locked courses
  let accessibleCourses = courses.filter((course) => {
    // Admins can see all courses
    if (isAdmin) return true
    
    // If user is Starter and has selectedCourseId, only show that course as accessible
    if (dbUser.tier === 1 && dbUser.selectedCourseId) {
      return course.id === dbUser.selectedCourseId
    }
    
    // For other tiers or Starter without selection, filter by requiredTiers
    // If course has no requiredTiers, allow access (backward compatibility)
    if (!course.requiredTiers) return true
    
    // Parse requiredTiers (it's stored as JSON)
    let courseTiers: string[] = []
    if (typeof course.requiredTiers === "string") {
      try {
        courseTiers = JSON.parse(course.requiredTiers)
      } catch {
        return true // If parsing fails, allow access
      }
    } else if (Array.isArray(course.requiredTiers)) {
      courseTiers = course.requiredTiers as string[]
    }
    
    // If "ALL" is in the list, everyone can access
    if (courseTiers.includes("ALL")) return true
    
    // Check if user's tier is in the allowed list
    return courseTiers.includes(userTierName)
  })

  // For Starter users with selectedCourseId, also get locked courses for upsell
  let lockedCourses: typeof courses = []
  if (dbUser.tier === 1 && dbUser.selectedCourseId) {
    lockedCourses = courses.filter((course) => {
      // Exclude the selected course
      if (course.id === dbUser.selectedCourseId) return false
      
      // Get courses that require PRO or higher
      if (!course.requiredTiers) return false // If no requiredTiers, it's probably accessible
      
      let courseTiers: string[] = []
      if (typeof course.requiredTiers === "string") {
        try {
          courseTiers = JSON.parse(course.requiredTiers)
        } catch {
          return false
        }
      } else if (Array.isArray(course.requiredTiers)) {
        courseTiers = course.requiredTiers as string[]
      }
      
      // Show courses that require PRO or OPERATOR (not ALL or STARTER)
      return courseTiers.length > 0 && !courseTiers.includes("ALL") && !courseTiers.includes("STARTER")
    })
  }

  if (accessibleCourses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 via-orange-50 to-white">
        <div className="text-center max-w-md px-4">
          <p className="text-xl font-semibold text-gray-800 mb-2">No hay cursos disponibles</p>
          {isAdmin ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Crea un curso en el panel de administración y márcalo como "Publicado" para que los usuarios lo vean.
              </p>
              <a
                href="/admin/cursos/nuevo"
                className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Crear Nuevo Curso
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Los cursos aparecerán aquí una vez que estén disponibles.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Combine all modules from accessible courses
  const allModules = accessibleCourses.flatMap((c) => 
    c.modules.map((m) => ({
      ...m,
      course: {
        id: c.id,
        title: c.title,
        slug: c.slug,
        requiredTiers: c.requiredTiers,
      },
    }))
  )

  // Combine all modules from locked courses (for upsell)
  const lockedModules = lockedCourses.flatMap((c) => 
    c.modules.map((m) => ({
      ...m,
      course: {
        id: c.id,
        title: c.title,
        slug: c.slug,
        requiredTiers: c.requiredTiers,
      },
    }))
  )

  // Filter out modules with no lessons (optional - you might want to show them anyway)
  const modulesWithLessons = allModules.filter((m) => m.lessons.length > 0)
  const lockedModulesWithLessons = lockedModules.filter((m) => m.lessons.length > 0)

  // If no modules with lessons, show all modules
  const modulesToShow = modulesWithLessons.length > 0 ? modulesWithLessons : allModules
  const lockedModulesToShow = lockedModulesWithLessons.length > 0 ? lockedModulesWithLessons : lockedModules

  return (
    <CoursesCatalog
      modules={modulesToShow}
      lockedModules={lockedModulesToShow}
      userTier={dbUser.tier}
      selectedPathId={dbUser.selectedPathId}
      selectedCourseId={dbUser.selectedCourseId}
      lessonProgress={dbUser.lessonProgress}
    />
  )
}
