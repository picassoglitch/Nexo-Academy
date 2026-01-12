import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import AssetsAdmin from "@/components/admin/assets-admin"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default async function AdminActivosPage() {
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

  const assets = await prisma.asset.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <Suspense fallback={<div className="text-center py-12">Cargando...</div>}>
      <AssetsAdmin assets={assets} />
    </Suspense>
  )
}

