import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import QuizConfigAdmin from "@/components/admin/quiz-config-admin"

export default async function AdminQuizConfigPage() {
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

  // Get current config
  // Use $queryRaw as primary method since model might not be available in runtime
  let configObject: Record<string, any> = {}
  try {
    // Use raw SQL query - more reliable than accessing model directly
    const configs = await prisma.$queryRaw<Array<{ key: string; value: any }>>`
      SELECT key, value FROM "QuizConfig" ORDER BY "updatedAt" DESC
    `

    configs.forEach((config) => {
      // Parse JSON if it's a string, otherwise use as-is
      configObject[config.key] =
        typeof config.value === "string" ? JSON.parse(config.value) : config.value
    })
  } catch (error: any) {
    console.error("Error loading quiz config:", error)
    // If table doesn't exist yet or there's an error, use empty object
    // This allows the page to load and admin can create initial config
    configObject = {}
  }

  return <QuizConfigAdmin initialConfig={configObject} />
}

