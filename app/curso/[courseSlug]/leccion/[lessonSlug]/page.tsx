import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import LessonPlayer from "@/components/lesson-player"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>
}) {
  const { courseSlug, lessonSlug } = await params
  
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
    },
  })

  if (!dbUser) {
    redirect("/login")
  }

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: {
        include: {
          lessons: {
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

  const lesson = course.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.slug === lessonSlug)

  if (!lesson) {
    redirect("/curso")
  }

  // Check access
  const userTiers = dbUser.entitlements.map((e) => e.tier)
  const highestTier = userTiers.length > 0
    ? userTiers.reduce((highest, current) => {
        const tierOrder = { STARTER: 1, PRO: 2, OPERATOR: 3 }
        return tierOrder[current] > tierOrder[highest] ? current : highest
      }, userTiers[0])
    : null

  const canAccess =
    lesson.isFreePreview ||
    (highestTier && (() => {
      const tierOrder = { STARTER: 1, PRO: 2, OPERATOR: 3 }
      return tierOrder[highestTier] >= tierOrder[lesson.requiredTier]
    })())

  if (!canAccess) {
    redirect("/pricing")
  }

  // Get progress
  const progress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: dbUser.id,
        lessonId: lesson.id,
      },
    },
  })

  // Get next lesson
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id)
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return (
    <LessonPlayer
      lesson={lesson}
      course={course}
      progress={progress}
      nextLesson={nextLesson}
      userId={dbUser.id}
    />
  )
}

