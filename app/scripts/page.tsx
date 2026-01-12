import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import ScriptsContent from "@/components/scripts-content"
import { Tier } from "@/lib/types"

export default async function ScriptsPage() {
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

  // Get only scripts (assets with category "Scripts")
  const scripts = await prisma.asset.findMany({
    where: {
      category: "Scripts",
    },
    orderBy: { createdAt: "desc" },
  })

  return <ScriptsContent scripts={scripts} userTier={highestTier} />
}



