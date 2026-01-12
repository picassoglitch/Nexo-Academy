import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminModulosPage() {
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

  const modules = await prisma.module.findMany({
    include: {
      course: true,
      _count: {
        select: { lessons: true },
      },
    },
    orderBy: { order: "asc" },
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestión de Módulos</h1>
          <Button asChild>
            <Link href="/admin/cursos">Ver Cursos</Link>
          </Button>
        </div>

        <div className="space-y-4">
          {modules.map((module) => (
            <Card key={module.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{module.title}</h3>
                    <p className="text-sm text-gray-600">Curso: {module.course.title}</p>
                    <p className="text-sm text-gray-500">Orden: {module.order} | {module._count.lessons} lecciones</p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/admin/lecciones?moduleId=${module.id}`}>
                      Ver Lecciones
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

