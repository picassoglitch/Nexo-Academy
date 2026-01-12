export const TIERS = {
  STARTER: {
    name: "Starter",
    price: 1799, // $17.99 USD in cents
    description: "30 días de reto, 1 camino de ingresos, plantillas core",
  },
  PRO: {
    name: "Pro",
    price: 5999, // $59.99 USD in cents
    description: "Todos los caminos, scripts de WhatsApp, outreach, comunidad",
  },
  OPERATOR: {
    name: "Operator",
    price: 23499, // $234.99 USD in cents
    description: "Workflows done-for-you, auditorías, casos reales, sesiones en vivo",
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

