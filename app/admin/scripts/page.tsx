import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import ScriptsAdmin from "@/components/admin/scripts-admin"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default async function AdminScriptsPage() {
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

  // Get only scripts (assets with category "Scripts")
  const scripts = await prisma.asset.findMany({
    where: {
      category: "Scripts",
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <Suspense fallback={<div className="text-center py-12">Cargando...</div>}>
      <ScriptsAdmin scripts={scripts} />
    </Suspense>
  )
}



