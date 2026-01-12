/**
 * Access Control Layer
 * Sistema reutilizable para verificar permisos de acceso a features
 */

import { PlanType, FeatureKey, PLAN_CONFIG, FEATURE_COPY, TIER_TO_PLAN, PLAN_LABELS } from "./config/plans"

// Re-export FeatureKey for convenience
export type { FeatureKey }

export interface User {
  tier: number // 0=gratis, 1=starter, 2=pro, 3=operator
  selectedPathId?: string | null // Para starter: ID del path elegido (deprecated)
  selectedCourseId?: string | null // Para starter: ID del curso elegido
  [key: string]: any
}

export interface LockedReason {
  title: string
  body: string
  ctaPlan: PlanType
  ctaText: string
}

/**
 * Verifica si el usuario tiene acceso a una feature
 */
export function canAccess(featureKey: FeatureKey, user: User): boolean {
  const userTier = user.tier || 0
  const userPlan = TIER_TO_PLAN[userTier]

  if (!userPlan) {
    return false // Usuario sin plan
  }

  const planConfig = PLAN_CONFIG[userPlan]

  // Verificar acceso básico
  if (!planConfig.features[featureKey]) {
    return false
  }

  // Casos especiales
  if (featureKey === "paths:single") {
    // Starter necesita tener un path seleccionado
    if (userPlan === "starter") {
      return !!user.selectedPathId
    }
    return true
  }

  if (featureKey === "paths:all") {
    // Solo pro y operator tienen acceso a todos los paths
    return userPlan === "pro" || userPlan === "operator"
  }

  return planConfig.features[featureKey]
}

/**
 * Obtiene la razón por la cual una feature está bloqueada
 * Calcula dinámicamente el tier a ofrecer basado en el tier actual del usuario
 */
export function getLockedReason(featureKey: FeatureKey, user: User): LockedReason | null {
  if (canAccess(featureKey, user)) {
    return null
  }

  const baseCopy = FEATURE_COPY[featureKey]
  const userTier = user.tier || 0
  const userPlan = TIER_TO_PLAN[userTier]
  
  // Caso especial: "paths:single" para usuarios Starter sin curso seleccionado
  // No deberían mejorar a Pro, sino seleccionar un curso
  if (featureKey === "paths:single" && userPlan === "starter" && !user.selectedPathId && !user.selectedCourseId) {
    return baseCopy // Devolver el copy original que dice "Elegir Camino"
  }
  
  // Determinar qué tier mínimo se necesita para esta feature
  let requiredTiers: string[] = []
  
  // Verificar en qué planes está disponible esta feature
  for (const [planType, config] of Object.entries(PLAN_CONFIG)) {
    if (config.features[featureKey]) {
      const tierNum = config.tier
      if (tierNum === 1) requiredTiers.push("STARTER")
      else if (tierNum === 2) requiredTiers.push("PRO")
      else if (tierNum === 3) requiredTiers.push("OPERATOR")
    }
  }
  
  // Si no hay tiers requeridos, usar el tier del baseCopy
  if (requiredTiers.length === 0) {
    const baseTier = baseCopy.ctaPlan.toUpperCase()
    if (baseTier === "STARTER") requiredTiers.push("STARTER")
    else if (baseTier === "PRO") requiredTiers.push("PRO")
    else if (baseTier === "OPERATOR") requiredTiers.push("OPERATOR")
  }
  
  // Obtener el siguiente tier disponible que sea mayor que el tier actual
  const nextTier = getNextAvailableTier(userTier, requiredTiers)
  
  if (!nextTier) {
    // Si no hay siguiente tier, devolver el baseCopy original
    return baseCopy
  }
  
  // Convertir el tier a PlanType
  const nextPlanType: PlanType = nextTier === "STARTER" ? "starter" : nextTier === "PRO" ? "pro" : "operator"
  
  // Actualizar el copy con el tier correcto
  return {
    ...baseCopy,
    ctaPlan: nextPlanType,
    ctaText: `Mejorar a ${PLAN_LABELS[nextPlanType]}`,
  }
}

/**
 * Obtiene el plan del usuario basado en su tier
 */
export function getUserPlan(user: User): PlanType | null {
  return TIER_TO_PLAN[user.tier || 0] || null
}

/**
 * Verifica si el usuario puede acceder a un path específico
 */
export function canAccessPath(pathId: string, user: User): boolean {
  const userPlan = getUserPlan(user)

  if (!userPlan) {
    return false
  }

  // Pro y Operator tienen acceso a todos los paths
  if (userPlan === "pro" || userPlan === "operator") {
    return true
  }

  // Starter solo tiene acceso a su curso seleccionado
  if (userPlan === "starter") {
    // Si tiene selectedCourseId, verificar que el módulo pertenece a ese curso
    if (user.selectedCourseId) {
      // Esto se verificará en el componente que llama a esta función
      // pasando información del curso del módulo
      return true // Se verificará a nivel de curso
    }
    // Fallback a selectedPathId para compatibilidad
    return user.selectedPathId === pathId
  }

  return false
}

/**
 * Verifica si el usuario puede acceder a un curso específico
 */
export function canAccessCourse(courseId: string, user: User): boolean {
  const userPlan = getUserPlan(user)

  if (!userPlan) {
    return false
  }

  // Pro y Operator tienen acceso a todos los cursos
  if (userPlan === "pro" || userPlan === "operator") {
    return true
  }

  // Starter solo tiene acceso a su curso seleccionado
  if (userPlan === "starter") {
    return user.selectedCourseId === courseId
  }

  return false
}

/**
 * Obtiene el siguiente tier disponible para upgrade desde el tier actual del usuario
 * Siempre devuelve un tier mayor que el actual, nunca el mismo o menor
 */
export function getNextAvailableTier(userTier: number, requiredTiers?: string[] | string | null): string | null {
  const tierOrder: Record<string, number> = { FREE: 0, STARTER: 1, PRO: 2, OPERATOR: 3 }
  const userTierName = userTier === 0 ? "FREE" : userTier === 1 ? "STARTER" : userTier === 2 ? "PRO" : "OPERATOR"
  const userTierNum = tierOrder[userTierName] || 0

  // Si no hay requiredTiers, el siguiente tier es el inmediato superior
  if (!requiredTiers) {
    if (userTierNum < 1) return "STARTER"
    if (userTierNum < 2) return "PRO"
    if (userTierNum < 3) return "OPERATOR"
    return null // Ya está en el tier más alto
  }

  // Parse requiredTiers
  let courseTiers: string[] = []
  if (typeof requiredTiers === "string") {
    try {
      courseTiers = JSON.parse(requiredTiers)
    } catch {
      // If parsing fails, return next tier
      if (userTierNum < 1) return "STARTER"
      if (userTierNum < 2) return "PRO"
      if (userTierNum < 3) return "OPERATOR"
      return null
    }
  } else if (Array.isArray(requiredTiers)) {
    courseTiers = requiredTiers
  }

  // Si incluye "ALL", el siguiente tier es el inmediato superior
  if (courseTiers.includes("ALL")) {
    if (userTierNum < 1) return "STARTER"
    if (userTierNum < 2) return "PRO"
    if (userTierNum < 3) return "OPERATOR"
    return null
  }

  // Encontrar el tier más bajo que sea mayor que el tier actual del usuario
  const higherTiers = courseTiers
    .map((t) => ({ name: t, order: tierOrder[t] || 0 }))
    .filter((t) => t.order > userTierNum)
    .sort((a, b) => a.order - b.order)

  if (higherTiers.length > 0) {
    return higherTiers[0].name
  }

  // Si no hay tiers mayores en la lista, devolver el siguiente tier disponible
  if (userTierNum < 1) return "STARTER"
  if (userTierNum < 2) return "PRO"
  if (userTierNum < 3) return "OPERATOR"
  return null
}

/**
 * Obtiene todos los paths a los que el usuario tiene acceso
 */
export function getAccessiblePaths(allPaths: Array<{ id: string; [key: string]: any }>, user: User): string[] {
  const userPlan = getUserPlan(user)

  if (!userPlan) {
    return []
  }

  if (userPlan === "pro" || userPlan === "operator") {
    return allPaths.map((p) => p.id)
  }

  if (userPlan === "starter" && user.selectedPathId) {
    return [user.selectedPathId]
  }

  return []
}

