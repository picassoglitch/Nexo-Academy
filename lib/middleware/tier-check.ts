import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

/**
 * Verifica si el usuario tiene el tier requerido para acceder a un recurso
 * @param requiredTier - Tier requerido (0=gratis, 1=starter, 2=pro, 3=operator)
 * @returns true si tiene acceso, false si no
 */
export async function checkTierAccess(requiredTier: number): Promise<boolean> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    // Obtener tier del usuario desde Prisma
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { tier: true },
    })

    if (!dbUser) {
      return false
    }

    // El usuario tiene acceso si su tier es mayor o igual al requerido
    return dbUser.tier >= requiredTier
  } catch (error) {
    console.error("Error checking tier access:", error)
    return false
  }
}

/**
 * Middleware helper para proteger rutas basadas en tier
 * Redirige a /upgrade si no tiene acceso
 */
export async function requireTier(requiredTier: number) {
  const hasAccess = await checkTierAccess(requiredTier)

  if (!hasAccess) {
    redirect("/upgrade?required=" + requiredTier)
  }
}

/**
 * Mapea tier enum a número
 */
export function tierToNumber(tier: string): number {
  const tierMap: Record<string, number> = {
    FREE: 0,
    STARTER: 1,
    PRO: 2,
    OPERATOR: 3,
  }
  return tierMap[tier] || 0
}





