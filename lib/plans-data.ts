import { PlanCardProps } from "@/components/plan-card"

export const PLANS_DATA: Omit<PlanCardProps, "className">[] = [
  {
    name: "Starter",
    price: 29900, // $299 MXN in centavos
    oldPrice: 59900, // $599 MXN in centavos
    tagline: "Ideal para empezar",
    features: [
      { text: "Reto de 30 días completo", included: true },
      { text: "1 camino a elección", included: true },
      { text: "Camino 0 Starter (onboarding)", included: true },
      { text: "Comunidad privada", included: false },
      { text: "Plantillas", included: false },
      { text: "Scripts", included: false },
      { text: "Recursos descargables", included: false },
    ],
    isPopular: false,
    ctaText: "Elegir Starter",
    ctaHref: "/checkout?tier=STARTER",
    ctaVariant: "secondary",
    msiText: undefined,
  },
  {
    name: "PRO",
    price: 99900, // $999 MXN in centavos
    oldPrice: 499900, // $4,999 MXN in centavos
    tagline: "Mejor valor para la mayoría",
    features: [
      { text: "Reto de 30 días completo", included: true },
      { text: "Todos los caminos de ingresos", included: true },
      { text: "Comunidad privada", included: true },
      { text: "Plantillas", included: false },
      { text: "Scripts", included: false },
      { text: "Recursos descargables", included: false },
    ],
    isPopular: true,
    ctaText: "Acceder a todo",
    ctaHref: "/checkout?tier=PRO",
    ctaVariant: "primary",
    msiText: "Desde $166 MXN/mes (6 MSI)",
  },
  {
    name: "Operator",
    price: 399900, // $3,999 MXN in centavos
    oldPrice: 799900, // $7,999 MXN in centavos
    tagline: "Para quienes ya están operando",
    features: [
      { text: "Todo lo del Pro", included: true },
      { text: "Plantillas profesionales", included: true },
      { text: "Scripts y automatizaciones", included: true },
      { text: "Recursos descargables", included: true },
      { text: "SOPs (Standard Operating Procedures)", included: true },
      { text: "Acceso a recursos nuevos futuros", included: true },
    ],
    isPopular: false,
    ctaText: "Elegir Operator",
    ctaHref: "/checkout?tier=OPERATOR",
    ctaVariant: "secondary",
    msiText: "Desde $333 MXN/mes (12 MSI)",
  },
]

