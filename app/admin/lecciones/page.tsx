import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import LessonsAdmin from "@/components/admin/lessons-admin"

export default async function AdminLeccionesPage({
  searchParams,
}: {
  searchParams: { moduleId?: string; courseId?: string }
}) {
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

  if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
    redirect("/dashboard")
  }

  // Build where clause for lessons
  const lessonWhere: any = {}
  if (searchParams.courseId) {
    lessonWhere.module = { courseId: searchParams.courseId }
  }

  const [lessons, courses] = await Promise.all([
    prisma.lesson.findMany({
      where: Object.keys(lessonWhere).length > 0 ? lessonWhere : undefined,
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { order: "asc" },
    }),
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ])

  return <LessonsAdmin lessons={lessons} courses={courses} initialCourseId={searchParams.courseId} />
}

