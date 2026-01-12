import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import CourseDetail from "@/components/course-detail"
import { canAccessPath, getUserPlan, type User as AccessUser } from "@/lib/access-control"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseSlug: string; moduleId: string }>
}) {
  const { courseSlug, moduleId } = await params
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

  // Convertir user a AccessUser
  const accessUser: AccessUser = {
    tier: dbUser.tier !== undefined ? dbUser.tier : 0,
    selectedPathId: dbUser.selectedPathId || null,
    selectedCourseId: dbUser.selectedCourseId || null,
  }

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: {
        include: {
          lessons: {
            select: {
              id: true,
              slug: true,
              title: true,
              summary: true,
              lessonType: true,
              estimatedDuration: true,
              requiredTier: true,
              isFreePreview: true,
              order: true,
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!course) {
    redirect("/curso")
  }

  // If user is Starter and has selectedCourseId, verify they can only access that course
  if (dbUser.tier === 1 && dbUser.selectedCourseId && course.id !== dbUser.selectedCourseId) {
    redirect("/pricing")
  }

  const module = course.modules.find((m) => m.id === moduleId)

  if (!module) {
    redirect("/curso")
  }

  // Check access
  if (!canAccessPath(moduleId, accessUser)) {
    redirect("/pricing")
  }

  // Add course info to module
  const moduleWithCourse = {
    ...module,
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
    },
  }

  return (
    <CourseDetail
      module={moduleWithCourse}
      userTier={accessUser.tier}
      lessonProgress={dbUser.lessonProgress}
    />
  )
}

