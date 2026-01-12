export const TIERS = {
  STARTER: {
    name: "Starter",
    price: 29900, // $299 MXN in centavos
    oldPrice: 59900, // $599 MXN (crossed out)
    description: "30 días de reto, 1 camino de ingresos, plantillas core",
  },
  PRO: {
    name: "Pro",
    price: 99900, // $999 MXN in centavos
    oldPrice: 499900, // $4,999 MXN (crossed out)
    description: "Todos los caminos, scripts de WhatsApp, outreach, comunidad",
    msiText: "Desde $166 MXN/mes (6 MSI)",
  },
  OPERATOR: {
    name: "Operator",
    price: 399900, // $3,999 MXN in centavos
    oldPrice: 799900, // $7,999 MXN (crossed out)
    description: "Workflows done-for-you, auditorías, casos reales, sesiones en vivo",
    msiText: "Desde $333 MXN/mes (12 MSI)",
  },
} as const

export const INCOME_PATHS = {
  PATH1: {
    name: "Servicios IA para Negocios Locales",
    description: "Chatbots de WhatsApp, automatización de DMs de Instagram, menús, contenido, anuncios",
    pricingRange: "$200 - $900 USD por cliente",
  },
  PATH2: {
    name: "Contenido IA para Creadores",
    description: "Reels/TikTok/Shorts, contenido en español, afiliados o generación de leads",
    pricingRange: "Variable según modelo de monetización",
  },
  PATH3: {
    name: "Productos Digitales IA",
    description: "Prompts en español, plantillas para negocios, dashboards de Notion",
    pricingRange: "$15 - $60 USD por producto",
  },
  PATH4: {
    name: "Consultoría IA / Freelancing",
    description: "Servicios de consultoría, implementación de IA, auditorías y proyectos personalizados",
    pricingRange: "$300 - $3,000 USD por proyecto",
  },
  PATH5: {
    name: "SaaS / Herramientas IA",
    description: "Micro-herramientas con IA, MVPs no-code, herramientas simples que resuelven problemas específicos",
    pricingRange: "$15 - $90 USD/mes por herramienta",
  },
} as const

export const DISCLAIMER_TEXT = "Tus resultados dependen de tu esfuerzo, habilidades y mercado. No garantizamos ingresos."

