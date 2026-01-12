import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import LessonEdit from "@/components/admin/lesson-edit"

export default async function EditarLeccionPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
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
        orderBy: { order: "asc" },
      },
    },
  })

  if (!course) {
    redirect("/admin/cursos")
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  })

  if (!lesson) {
    redirect(`/admin/cursos/${courseId}/lecciones`)
  }

  return <LessonEdit lesson={lesson} courseId={courseId} modules={course.modules} />
}



