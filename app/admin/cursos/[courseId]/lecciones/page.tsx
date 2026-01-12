import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import LessonsList from "@/components/admin/lessons-list"

export default async function LeccionesCursoPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
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

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              module: {
                include: {
                  course: true,
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  })

  if (!course) {
    redirect("/admin/cursos")
  }

  // Flatten lessons from all modules
  const lessons = course.modules.flatMap((module) => module.lessons)

  return <LessonsList lessons={lessons} courseId={courseId} courseTitle={course.title} />
}



