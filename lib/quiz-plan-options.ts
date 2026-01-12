import { PlanOptionCardProps } from "@/components/plan-option-card"

export interface PlanFeature {
  text: string
  included: boolean
  badge?: string
}

export interface QuizPlanOption extends Omit<PlanOptionCardProps, "onClick" | "className" | "bullets"> {
  tierKey: "STARTER" | "FREELANCER" | "SCALER"
  checkoutTier: "STARTER" | "PRO" | "OPERATOR"
  features: PlanFeature[]
  oldPrice?: number
}

export const QUIZ_PLAN_OPTIONS: QuizPlanOption[] = [
  {
    tierKey: "STARTER",
    name: "Starter",
    icon: "🚀",
    tagline: "Ideal para empezar",
    price: 29900, // $299 MXN in centavos
    oldPrice: 59900, // $599 MXN in centavos
    currency: "MXN",
    features: [
      { text: "Reto de 30 días completo", included: true },
      { text: "1 camino a elección", included: true },
      { text: "Camino 0 Starter (onboarding)", included: true },
      { text: "Comunidad privada", included: false },
      { text: "Plantillas", included: false },
      { text: "Scripts", included: false },
      { text: "Recursos descargables", included: false },
    ],
    href: "/checkout?tier=STARTER",
    checkoutTier: "STARTER",
    variant: "secondary",
  },
  {
    tierKey: "FREELANCER",
    name: "Freelancer",
    icon: "💼",
    tagline: "Mejor valor para la mayoría",
    price: 99900, // $999 MXN in centavos
    oldPrice: 499900, // $4,999 MXN in centavos
    currency: "MXN",
    features: [
      { text: "Reto de 30 días completo", included: true },
      { text: "Todos los caminos de ingresos", included: true },
      { text: "Comunidad privada", included: true },
      { text: "Plantillas", included: false },
      { text: "Scripts", included: false },
      { text: "Recursos descargables", included: false },
    ],
    href: "/checkout?tier=PRO",
    checkoutTier: "PRO",
    variant: "secondary",
    msiText: "Desde $166 MXN/mes (6 MSI)",
  },
  {
    tierKey: "SCALER",
    name: "Scaler",
    icon: "⚡",
    tagline: "Para quienes ya están operando",
    price: 3999,
    oldPrice: 7999,
    currency: "MXN",
    features: [
      { text: "Todo lo del Pro", included: true },
      { text: "Plantillas profesionales", included: true },
      { text: "Scripts y automatizaciones", included: true },
      { text: "Recursos descargables", included: true },
      { text: "SOPs (Standard Operating Procedures)", included: true },
      { text: "Acceso a recursos nuevos futuros", included: true },
    ],
    href: "/checkout?tier=OPERATOR",
    checkoutTier: "OPERATOR",
    variant: "secondary",
    msiText: "Desde $333 MXN/mes (12 MSI)",
  },
]

/**
 * Maps quiz tier recommendation to plan option
 */
export function getRecommendedPlanOption(recommendedTier: string | null): QuizPlanOption | null {
  if (!recommendedTier) return null
  
  const option = QUIZ_PLAN_OPTIONS.find((opt) => opt.tierKey === recommendedTier)
  return option || null
}

