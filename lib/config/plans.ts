/**
 * Configuración central de planes, features y copy
 * Fuente de verdad para toda la aplicación
 */

export type PlanType = "starter" | "pro" | "operator"
export type FeatureKey = 
  | "paths:all" 
  | "paths:single" 
  | "community" 
  | "templates" 
  | "scripts" 
  | "downloads" 
  | "sops"

export interface PlanFeatures {
  [key: string]: boolean
}

export interface FeatureCopy {
  title: string
  body: string
  ctaPlan: PlanType
  ctaText: string
}

export interface PlanConfig {
  name: string
  label: string
  tier: number // 1=starter, 2=pro, 3=operator
  features: PlanFeatures
}

// Mapeo de tier número a plan type
export const TIER_TO_PLAN: Record<number, PlanType | null> = {
  0: null,
  1: "starter",
  2: "pro",
  3: "operator",
}

// Mapeo de plan type a tier número
export const PLAN_TO_TIER: Record<PlanType, number> = {
  starter: 1,
  pro: 2,
  operator: 3,
}

// Configuración de planes
export const PLAN_CONFIG: Record<PlanType, PlanConfig> = {
  starter: {
    name: "Starter",
    label: "Starter",
    tier: 1,
    features: {
      "paths:all": false,
      "paths:single": true,
      "community": false,
      "templates": false,
      "scripts": false,
      "downloads": false,
      "sops": false,
    },
  },
  pro: {
    name: "Pro",
    label: "Pro",
    tier: 2,
    features: {
      "paths:all": true,
      "paths:single": true,
      "community": true,
      "templates": false,
      "scripts": false,
      "downloads": false,
      "sops": false,
    },
  },
  operator: {
    name: "Operator",
    label: "Operator",
    tier: 3,
    features: {
      "paths:all": true,
      "paths:single": true,
      "community": true,
      "templates": true,
      "scripts": true,
      "downloads": true,
      "sops": true,
    },
  },
}

// Copy para features bloqueadas
export const FEATURE_COPY: Record<FeatureKey, FeatureCopy> = {
  "paths:all": {
    title: "Acceso a Todos los Caminos",
    body: "Con el plan Pro o Operator puedes acceder a todos los caminos de ingresos y maximizar tus oportunidades.",
    ctaPlan: "pro",
    ctaText: "Mejorar a Pro",
  },
  "paths:single": {
    title: "Elige tu Camino",
    body: "Como usuario Starter, puedes elegir un camino de ingresos para enfocarte durante 30 días.",
    ctaPlan: "starter",
    ctaText: "Elegir Camino",
  },
  community: {
    title: "Comunidad Privada",
    body: "Únete a la comunidad privada de estudiantes Pro y Operator. Accede a networking, soporte y recursos exclusivos.",
    ctaPlan: "pro",
    ctaText: "Mejorar a Pro",
  },
  templates: {
    title: "Plantillas y Recursos",
    body: "Accede a plantillas profesionales, scripts listos para usar y recursos descargables exclusivos para Operator.",
    ctaPlan: "operator",
    ctaText: "Mejorar a Operator",
  },
  scripts: {
    title: "Scripts y Automatizaciones",
    body: "Desbloquea scripts de WhatsApp, automatizaciones y flujos de trabajo probados. Disponible en Operator.",
    ctaPlan: "operator",
    ctaText: "Mejorar a Operator",
  },
  downloads: {
    title: "Recursos Descargables",
    body: "Descarga SOPs, checklists, bases de datos y recursos exclusivos. Solo disponible en Operator.",
    ctaPlan: "operator",
    ctaText: "Mejorar a Operator",
  },
  sops: {
    title: "SOPs y Procesos",
    body: "Accede a Standard Operating Procedures (SOPs) detallados y procesos probados. Exclusivo de Operator.",
    ctaPlan: "operator",
    ctaText: "Mejorar a Operator",
  },
}

// Labels de planes para UI
export const PLAN_LABELS: Record<PlanType, string> = {
  starter: "Starter",
  pro: "Pro",
  operator: "Operator",
}

// Descripciones de planes
export const PLAN_DESCRIPTIONS: Record<PlanType, string> = {
  starter: "1 camino a elección + Camino 0 Starter",
  pro: "Todos los caminos + Comunidad",
  operator: "Todo lo de Pro + Plantillas + Scripts + Recursos + SOPs",
}





