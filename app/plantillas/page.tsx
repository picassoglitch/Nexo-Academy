import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import TemplatesContent from "@/components/templates-content"
import { Tier } from "@/lib/types"

export default async function PlantillasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      entitlements: {
        where: { active: true },
      },
    },
  })

  if (!dbUser) {
    redirect("/login")
  }

  // Use user.tier directly instead of entitlements
  const userTier = dbUser.tier
  const tierMap: Record<number, Tier | null> = {
    0: null,
    1: Tier.STARTER,
    2: Tier.PRO,
    3: Tier.OPERATOR,
  }
  const highestTier = tierMap[userTier] || null

  const assets = await prisma.asset.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <TemplatesContent assets={assets} userTier={highestTier} />
}

