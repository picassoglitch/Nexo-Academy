/**
 * Route Guard Utilities
 * Protege rutas basadas en acceso de usuario
 */

import { redirect } from "next/navigation"
import { canAccess, getUserPlan, type User } from "@/lib/access-control"
import { FeatureKey } from "@/lib/config/plans"

export interface RouteGuardConfig {
  featureKey: FeatureKey
  redirectTo?: string
  showToast?: boolean
}

/**
 * Verifica acceso a una ruta y redirige si no tiene permiso
 */
export async function requireAccess(
  user: User,
  featureKey: FeatureKey,
  redirectTo: string = "/dashboard"
) {
  if (!canAccess(featureKey, user)) {
    redirect(`${redirectTo}?locked=${featureKey}`)
  }
}

/**
 * Verifica si el usuario puede acceder a un path específico
 */
export function canAccessPathRoute(pathId: string, user: User): boolean {
  const userPlan = getUserPlan(user)

  if (!userPlan) {
    return false
  }

  // Pro y Operator tienen acceso a todos los paths
  if (userPlan === "pro" || userPlan === "operator") {
    return true
  }

  // Starter solo tiene acceso a su path seleccionado
  if (userPlan === "starter") {
    return user.selectedPathId === pathId
  }

  return false
}





