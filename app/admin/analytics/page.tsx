import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminAnalyticsPage() {
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

  // Get basic stats from database
  const stats = {
    totalQuizResponses: await prisma.quizResponse.count(),
    totalPlans: await prisma.plan.count(),
    totalCompletedLessons: await prisma.lessonProgress.count({
      where: { completed: true },
    }),
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Analytics</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalQuizResponses}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planes Generados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalPlans}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lecciones Completadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalCompletedLessons}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>PostHog Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Para ver analytics detallados del funnel, accede a tu dashboard de PostHog.
            </p>
            <p className="text-sm text-gray-500">
              Eventos trackeados: quiz_started, quiz_email_captured, quiz_completed,
              checkout_started, lesson_completed
            </p>
            {process.env.NEXT_PUBLIC_POSTHOG_KEY ? (
              <a
                href="https://app.posthog.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mt-4 inline-block"
              >
                Abrir PostHog Dashboard
              </a>
            ) : (
              <p className="text-sm text-yellow-600 mt-4">
                PostHog no está configurado. Agrega NEXT_PUBLIC_POSTHOG_KEY a tus variables de entorno.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

