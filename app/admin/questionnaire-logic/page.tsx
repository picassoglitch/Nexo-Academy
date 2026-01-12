import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import QuestionnaireLogicDashboard from "@/components/admin/questionnaire-logic-dashboard"

export default async function QuestionnaireLogicPage() {
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

  // Get quiz response data for analytics
  const quizResponses = await prisma.quizResponse.findMany({
    take: 1000,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      payload: true,
      createdAt: true,
    },
  })

  // Get plans created from quiz
  const plans = await prisma.plan.findMany({
    include: {
      quizResponse: {
        select: {
          payload: true,
        },
      },
    },
  })

  return (
    <QuestionnaireLogicDashboard 
      quizResponses={quizResponses}
      plans={plans}
    />
  )
}



