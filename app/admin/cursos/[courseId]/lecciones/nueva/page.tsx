import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import LessonEdit from "@/components/admin/lesson-edit"

export default async function NuevaLeccionPage({
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
        orderBy: { order: "asc" },
      },
    },
  })

  if (!course) {
    redirect("/admin/cursos")
  }

  return <LessonEdit courseId={courseId} modules={course.modules} />
}



