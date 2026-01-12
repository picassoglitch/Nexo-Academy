import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import CoursesList from "@/components/admin/courses-list"

export default async function AdminCursosPage() {
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

  const courses = await prisma.course.findMany({
    include: {
      modules: {
        include: {
          _count: {
            select: { lessons: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return <CoursesList courses={courses} />
}
