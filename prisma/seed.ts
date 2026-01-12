import "dotenv/config"
import { PrismaClient, Tier, IncomePath } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  console.log("🌱 Starting seed...")

  // Create course
  const course = await prisma.course.upsert({
    where: { slug: "ai-ingresos-30d" },
    update: {},
    create: {
      slug: "ai-ingresos-30d",
      title: "AI Ingresos 30D",
      description:
        "Reto de 30 días para construir sistemas de ingresos con IA en México (sin promesas, con ejecución).",
      published: true,
    },
  })

  console.log("✅ Course created")

  // Create Module 0: Día 0 - Setup
  const module0 = await prisma.module.create({
    data: {
      courseId: course.id,
      order: 0,
      title: "Día 0: Setup",
      lessons: {
        create: [
          {
            slug: "herramientas",
            order: 1,
            title: "Herramientas Esenciales",
            summary: "Configura tus herramientas básicas para comenzar",
            transcriptMd: "<p>En esta lección aprenderás a configurar las herramientas esenciales...</p>",
            actionChecklistMd: "<ul><li>Crear cuenta en ChatGPT</li><li>Configurar WhatsApp Business</li><li>Instalar extensiones necesarias</li></ul>",
            isFreePreview: true,
            requiredTier: Tier.STARTER,
          },
          {
            slug: "cuentas",
            order: 2,
            title: "Creación de Cuentas Necesarias",
            summary: "Abre las cuentas que necesitarás para operar",
            transcriptMd: "<p>Configura tus cuentas en las plataformas necesarias...</p>",
            actionChecklistMd: "<ul><li>Cuenta de Instagram Business</li><li>Cuenta de MercadoPago</li><li>Cuenta de email profesional</li></ul>",
            isFreePreview: true,
            requiredTier: Tier.STARTER,
          },
          {
            slug: "etica-disclaimer",
            order: 3,
            title: "Ética y Disclaimers",
            summary: "Entiende las responsabilidades y límites",
            transcriptMd: "<p>Es importante entender que no garantizamos resultados...</p>",
            actionChecklistMd: "<ul><li>Leer términos y condiciones</li><li>Entender disclaimers</li><li>Preparar comunicación ética con clientes</li></ul>",
            isFreePreview: true,
            requiredTier: Tier.STARTER,
          },
          {
            slug: "evitar-bans",
            order: 4,
            title: "Cómo Evitar Bans",
            summary: "Mejores prácticas para evitar suspensiones",
            transcriptMd: "<p>Aprende a usar las herramientas de forma responsable...</p>",
            actionChecklistMd: "<ul><li>Límites de uso de APIs</li><li>Mejores prácticas de automatización</li><li>Respetar términos de servicio</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "paquete-plantillas",
            order: 5,
            title: "Paquete de Plantillas Inicial",
            summary: "Descarga tu kit de inicio rápido",
            transcriptMd: "<p>Accede a las plantillas básicas para comenzar...</p>",
            actionChecklistMd: "<ul><li>Descargar plantillas</li><li>Revisar estructura</li><li>Personalizar con tu información</li></ul>",
            requiredTier: Tier.STARTER,
          },
        ],
      },
    },
  })

  // Week 1: Oferta + Fundaciones
  const week1 = await prisma.module.create({
    data: {
      courseId: course.id,
      order: 1,
      title: "Semana 1: Oferta + Fundaciones",
      lessons: {
        create: [
          {
            slug: "dia-1-definir-nicho",
            order: 1,
            title: "Día 1: Definir tu Nicho",
            summary: "Identifica tu mercado objetivo en México",
            transcriptMd: "<p>El primer paso es definir claramente tu nicho...</p>",
            actionChecklistMd: "<ul><li>Listar 3 nichos potenciales</li><li>Investigar competencia</li><li>Elegir el nicho más prometedor</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "dia-2-crear-oferta",
            order: 2,
            title: "Día 2: Crear tu Oferta",
            summary: "Diseña una oferta irresistible para tu nicho",
            transcriptMd: "<p>Una buena oferta resuelve un problema específico...</p>",
            actionChecklistMd: "<ul><li>Definir problema a resolver</li><li>Crear propuesta de valor</li><li>Escribir descripción de oferta</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "dia-3-path1-whatsapp-basics",
            order: 3,
            title: "Día 3: WhatsApp Chatbot - Fundamentos",
            summary: "Aprende los conceptos básicos de chatbots de WhatsApp",
            transcriptMd: "<p>Los chatbots de WhatsApp pueden automatizar respuestas...</p>",
            actionChecklistMd: "<ul><li>Configurar flujo básico</li><li>Crear respuestas automáticas</li><li>Configurar handoff a humano</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "dia-4-path1-instagram-dm",
            order: 4,
            title: "Día 4: Automatización de DMs de Instagram",
            summary: "Automatiza respuestas en Instagram",
            transcriptMd: "<p>Puedes automatizar respuestas iniciales en Instagram...</p>",
            actionChecklistMd: "<ul><li>Crear scripts de respuesta</li><li>Configurar triggers</li><li>Probar automatización</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "dia-5-path1-pricing",
            order: 5,
            title: "Día 5: Guía de Pricing Realista",
            summary: "Aprende a fijar precios competitivos en México",
            transcriptMd: "<p>Los precios deben ser realistas para el mercado mexicano. Rango típico: $3,000 - $15,000 MXN por cliente. No garantizamos estos ingresos.</p>",
            actionChecklistMd: "<ul><li>Investigar precios del mercado</li><li>Calcular costos</li><li>Definir tu estructura de precios</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "dia-6-path2-content-machine",
            order: 6,
            title: "Día 6: Máquina de Contenido para Reels/TikTok",
            summary: "Crea contenido viral con IA",
            transcriptMd: "<p>Aprende a usar IA para generar ideas y scripts de contenido...</p>",
            actionChecklistMd: "<ul><li>Generar 10 ideas de contenido</li><li>Crear scripts con IA</li><li>Planificar calendario</li></ul>",
            requiredTier: Tier.PRO,
          },
          {
            slug: "dia-7-path3-prompt-packs",
            order: 7,
            title: "Día 7: Crear Packs de Prompts en Español",
            summary: "Desarrolla productos digitales de prompts",
            transcriptMd: "<p>Los prompts en español tienen alta demanda...</p>",
            actionChecklistMd: "<ul><li>Crear 20 prompts únicos</li><li>Organizar por categoría</li><li>Preparar para venta</li></ul>",
            requiredTier: Tier.PRO,
          },
        ],
      },
    },
  })

  // Week 2: Prospección + Cierres
  const week2 = await prisma.module.create({
    data: {
      courseId: course.id,
      order: 2,
      title: "Semana 2: Prospección + Cierres",
      lessons: {
        create: [
          {
            slug: "dia-8-outreach-basics",
            order: 1,
            title: "Día 8: Fundamentos de Outreach",
            summary: "Aprende a contactar clientes potenciales",
            transcriptMd: "<p>El outreach efectivo requiere personalización...</p>",
            actionChecklistMd: "<ul><li>Crear lista de prospectos</li><li>Personalizar mensajes</li><li>Enviar primeros contactos</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "dia-9-scripts-ventas",
            order: 2,
            title: "Día 9: Scripts de Ventas",
            summary: "Desarrolla scripts que convierten",
            transcriptMd: "<p>Los scripts de ventas deben ser naturales y efectivos...</p>",
            actionChecklistMd: "<ul><li>Crear script inicial</li><li>Desarrollar follow-ups</li><li>Practicar delivery</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "dia-10-path1-onboarding",
            order: 3,
            title: "Día 10: Checklist de Onboarding de Cliente",
            summary: "Proceso para incorporar nuevos clientes",
            transcriptMd: "<p>Un buen onboarding establece expectativas claras...</p>",
            actionChecklistMd: "<ul><li>Crear checklist de onboarding</li><li>Preparar materiales</li><li>Automatizar proceso</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "dia-11-cerrar-primer-cliente",
            order: 4,
            title: "Día 11: Cómo Cerrar tu Primer Cliente",
            summary: "Estrategias para conseguir tu primera venta",
            transcriptMd: "<p>El primer cliente es el más difícil pero también el más importante...</p>",
            actionChecklistMd: "<ul><li>Identificar 5 prospectos calientes</li><li>Enviar propuestas</li><li>Seguir proceso de cierre</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "dia-12-path2-affiliate-basics",
            order: 5,
            title: "Día 12: Fundamentos de Afiliados",
            summary: "Monetiza contenido con afiliados",
            transcriptMd: "<p>Los afiliados pueden generar ingresos pasivos...</p>",
            actionChecklistMd: "<ul><li>Identificar programas afiliados</li><li>Crear contenido de recomendación</li><li>Configurar tracking</li></ul>",
            requiredTier: Tier.PRO,
          },
          {
            slug: "dia-13-path2-lead-gen",
            order: 6,
            title: "Día 13: Generación de Leads Básica",
            summary: "Crea un embudo simple de captación",
            transcriptMd: "<p>Los embudos de leads requieren valor upfront...</p>",
            actionChecklistMd: "<ul><li>Crear lead magnet</li><li>Configurar landing page</li><li>Automatizar seguimiento</li></ul>",
            requiredTier: Tier.PRO,
          },
          {
            slug: "dia-14-path3-business-templates",
            order: 7,
            title: "Día 14: Plantillas para Negocios Mexicanos",
            summary: "Crea plantillas específicas para el mercado mexicano",
            transcriptMd: "<p>Las plantillas localizadas tienen mejor conversión...</p>",
            actionChecklistMd: "<ul><li>Crear 5 plantillas</li><li>Localizar contenido</li><li>Preparar para venta</li></ul>",
            requiredTier: Tier.PRO,
          },
        ],
      },
    },
  })

  // Week 3: Entrega con IA (SOPs)
  const week3 = await prisma.module.create({
    data: {
      courseId: course.id,
      order: 3,
      title: "Semana 3: Entrega con IA (SOPs)",
      lessons: {
        create: [
          {
            slug: "dia-15-path1-delivery-sop",
            order: 1,
            title: "Día 15: SOP de Entrega de Paquete de Contenido",
            summary: "Crea un proceso estandarizado de entrega",
            transcriptMd: "<p>Los SOPs aseguran calidad consistente...</p>",
            actionChecklistMd: "<ul><li>Documentar proceso</li><li>Crear checklist</li><li>Automatizar donde sea posible</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "dia-16-path1-reporting",
            order: 2,
            title: "Día 16: Reportes y Seguimiento",
            summary: "Comunica resultados a clientes",
            transcriptMd: "<p>Los reportes demuestran valor...</p>",
            actionChecklistMd: "<ul><li>Crear template de reporte</li><li>Automatizar generación</li><li>Establecer frecuencia</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "dia-17-path2-posting-schedule",
            order: 3,
            title: "Día 17: Calendario de Publicación e Iteración",
            summary: "Optimiza tu estrategia de contenido",
            transcriptMd: "<p>La consistencia es clave en contenido...</p>",
            actionChecklistMd: "<ul><li>Crear calendario</li><li>Automatizar publicaciones</li><li>Establecer métricas</li></ul>",
            requiredTier: Tier.PRO,
          },
          {
            slug: "dia-18-path3-notion-dashboards",
            order: 4,
            title: "Día 18: Crear Dashboards de Notion",
            summary: "Desarrolla productos de Notion para vender",
            transcriptMd: "<p>Los dashboards de Notion son productos populares...</p>",
            actionChecklistMd: "<ul><li>Diseñar dashboard</li><li>Crear templates</li><li>Documentar uso</li></ul>",
            requiredTier: Tier.PRO,
          },
          {
            slug: "dia-19-path3-gumroad-hotmart",
            order: 5,
            title: "Día 19: Vender en Gumroad/Hotmart",
            summary: "Configura tu tienda de productos digitales",
            transcriptMd: "<p>Gumroad y Hotmart son plataformas populares en México...</p>",
            actionChecklistMd: "<ul><li>Crear cuenta</li><li>Subir productos</li><li>Configurar precios</li></ul>",
            requiredTier: Tier.PRO,
          },
          {
            slug: "dia-20-path3-customer-support",
            order: 6,
            title: "Día 20: Soporte al Cliente y Reembolsos",
            summary: "Gestiona soporte y políticas de reembolso",
            transcriptMd: "<p>El buen soporte reduce reembolsos...</p>",
            actionChecklistMd: "<ul><li>Crear FAQ</li><li>Establecer política de reembolsos</li><li>Automatizar respuestas comunes</li></ul>",
            requiredTier: Tier.PRO,
          },
          {
            slug: "dia-21-automation-advanced",
            order: 7,
            title: "Día 21: Automatización Avanzada",
            summary: "Lleva tu operación al siguiente nivel",
            transcriptMd: "<p>La automatización te permite escalar...</p>",
            actionChecklistMd: "<ul><li>Identificar procesos repetitivos</li><li>Implementar automatizaciones</li><li>Medir impacto</li></ul>",
            requiredTier: Tier.PRO,
          },
        ],
      },
    },
  })

  // Week 4: Retainers + Escala
  const week4 = await prisma.module.create({
    data: {
      courseId: course.id,
      order: 4,
      title: "Semana 4: Retainers + Escala",
      lessons: {
        create: [
          {
            slug: "dia-22-retainers",
            order: 1,
            title: "Día 22: Convertir Clientes en Retainers",
            summary: "Crea ingresos recurrentes",
            transcriptMd: "<p>Los retainers proporcionan estabilidad...</p>",
            actionChecklistMd: "<ul><li>Identificar servicios recurrentes</li><li>Crear oferta de retainer</li><li>Proponer a clientes existentes</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "dia-23-escalar-operacion",
            order: 2,
            title: "Día 23: Escalar tu Operación",
            summary: "Crecimiento sostenible",
            transcriptMd: "<p>Escalar requiere sistemas y procesos...</p>",
            actionChecklistMd: "<ul><li>Documentar todos los procesos</li><li>Identificar cuellos de botella</li><li>Planificar crecimiento</li></ul>",
            requiredTier: Tier.STARTER,
          },
          {
            slug: "dia-24-path1-whatsapp-scripts-pack",
            order: 3,
            title: "Día 24: Pack Completo de Scripts de WhatsApp",
            summary: "Biblioteca de scripts para diferentes situaciones",
            transcriptMd: "<p>Los scripts bien escritos ahorran tiempo...</p>",
            actionChecklistMd: "<ul><li>Crear 10 scripts diferentes</li><li>Organizar por categoría</li><li>Probar y refinar</li></ul>",
            requiredTier: Tier.PRO,
          },
          {
            slug: "dia-25-path1-ig-automation",
            order: 4,
            title: "Día 25: Flujos de Automatización de IG DM",
            summary: "Templates avanzados de automatización",
            transcriptMd: "<p>La automatización avanzada puede manejar más casos...</p>",
            actionChecklistMd: "<ul><li>Crear flujos complejos</li><li>Configurar triggers</li><li>Probar exhaustivamente</li></ul>",
            requiredTier: Tier.PRO,
          },
          {
            slug: "dia-26-path2-spanish-hooks",
            order: 5,
            title: "Día 26: Hooks y Scripts en Español",
            summary: "Contenido optimizado para audiencia mexicana",
            transcriptMd: "<p>El contenido en español tiene sus propias características...</p>",
            actionChecklistMd: "<ul><li>Crear 20 hooks</li><li>Desarrollar scripts</li><li>Probar con audiencia</li></ul>",
            requiredTier: Tier.PRO,
          },
          {
            slug: "dia-27-path3-case-studies",
            order: 6,
            title: "Día 27: Crear Casos de Estudio Reales",
            summary: "Documenta resultados para marketing",
            transcriptMd: "<p>Los casos de estudio demuestran valor...</p>",
            actionChecklistMd: "<ul><li>Seleccionar casos exitosos</li><li>Documentar proceso</li><li>Crear presentación</li></ul>",
            requiredTier: Tier.OPERATOR,
          },
          {
            slug: "dia-28-done-for-you",
            order: 7,
            title: "Día 28: Workflows Done-for-You",
            summary: "Crea sistemas completos para clientes",
            transcriptMd: "<p>Los workflows completos tienen mayor valor...</p>",
            actionChecklistMd: "<ul><li>Documentar workflow completo</li><li>Crear SOP detallado</li><li>Preparar para entrega</li></ul>",
            requiredTier: Tier.OPERATOR,
          },
          {
            slug: "dia-29-audits",
            order: 8,
            title: "Día 29: Auditorías de Negocio",
            summary: "Ofrece auditorías como servicio premium",
            transcriptMd: "<p>Las auditorías identifican oportunidades...</p>",
            actionChecklistMd: "<ul><li>Crear checklist de auditoría</li><li>Desarrollar proceso</li><li>Establecer pricing</li></ul>",
            requiredTier: Tier.OPERATOR,
          },
          {
            slug: "dia-30-next-steps",
            order: 9,
            title: "Día 30: Próximos Pasos y Continuidad",
            summary: "Planifica tu crecimiento continuo",
            transcriptMd: "<p>El día 30 es solo el comienzo...</p>",
            actionChecklistMd: "<ul><li>Revisar progreso</li><li>Identificar áreas de mejora</li><li>Planificar próximos 30 días</li></ul>",
            requiredTier: Tier.STARTER,
          },
        ],
      },
    },
  })

  console.log("✅ Modules and lessons created")

  // Create Assets/Templates
  const assets = [
    // Starter assets
    {
      title: "Oferta 1-pager (Servicios)",
      description: "Plantilla para crear tu oferta de servicios en una página",
      category: "Oferta",
      requiredTier: Tier.STARTER,
      fileUrl: "/templates/oferta-servicios.pdf",
    },
    {
      title: "Script de DM Inicial + 3 Follow-ups",
      description: "Scripts listos para usar en Instagram DMs",
      category: "Scripts",
      requiredTier: Tier.STARTER,
      fileUrl: "/templates/scripts-dm.pdf",
    },
    {
      title: "Checklist Onboarding Cliente",
      description: "Lista completa para incorporar nuevos clientes",
      category: "Procesos",
      requiredTier: Tier.STARTER,
      fileUrl: "/templates/onboarding-checklist.pdf",
    },
    {
      title: "Brief Creativo para Contenido",
      description: "Template para recopilar información de clientes",
      category: "Briefs",
      requiredTier: Tier.STARTER,
      fileUrl: "/templates/brief-creativo.pdf",
    },
    {
      title: "Plantilla Propuesta PDF",
      description: "Template profesional para propuestas de servicios",
      category: "Propuestas",
      requiredTier: Tier.STARTER,
      fileUrl: "/templates/propuesta.pdf",
    },
    {
      title: "Plantilla Contrato Básico",
      description: "Template educativo de contrato (sugerir revisión legal)",
      category: "Legal",
      requiredTier: Tier.STARTER,
      fileUrl: "/templates/contrato-basico.pdf",
    },
    {
      title: "SOP Entrega de Paquete de Contenido",
      description: "Proceso estandarizado para entregar contenido",
      category: "SOPs",
      requiredTier: Tier.STARTER,
      fileUrl: "/templates/sop-entrega.pdf",
    },
    {
      title: "Guía de Pricing MXN",
      description: "Guía completa de precios para el mercado mexicano",
      category: "Pricing",
      requiredTier: Tier.STARTER,
      fileUrl: "/templates/guia-pricing.pdf",
    },
    // Pro assets
    {
      title: "WhatsApp Scripts Pack",
      description: "Pack completo de scripts para WhatsApp (FAQs, objeciones, ventas)",
      category: "Scripts",
      requiredTier: Tier.PRO,
      fileUrl: "/templates/whatsapp-scripts-pack.pdf",
    },
    {
      title: "IG DM Automation Flow Templates",
      description: "Templates de flujos de automatización para Instagram",
      category: "Automatización",
      requiredTier: Tier.PRO,
      fileUrl: "/templates/ig-automation-flows.pdf",
    },
    {
      title: "Outreach Tracker",
      description: "Template CSV/Notion para rastrear outreach",
      category: "Tracking",
      requiredTier: Tier.PRO,
      fileUrl: "/templates/outreach-tracker.csv",
    },
    {
      title: "Discovery Call Script",
      description: "Script completo para llamadas de descubrimiento",
      category: "Scripts",
      requiredTier: Tier.PRO,
      fileUrl: "/templates/discovery-call-script.pdf",
    },
    {
      title: "Objection Handling Script Pack",
      description: "Scripts para manejar objeciones comunes",
      category: "Scripts",
      requiredTier: Tier.PRO,
      fileUrl: "/templates/objection-handling.pdf",
    },
    {
      title: "Weekly Reporting Template",
      description: "Template para reportes semanales a clientes",
      category: "Reportes",
      requiredTier: Tier.PRO,
      fileUrl: "/templates/reporte-semanal.pdf",
    },
    // Operator assets
    {
      title: "Done-for-You Workflows (Notion SOP Hub)",
      description: "Sistema completo de workflows en Notion",
      category: "Workflows",
      requiredTier: Tier.OPERATOR,
      fileUrl: "/templates/dfy-workflows.notion",
    },
    {
      title: "Audit Checklist",
      description: "Checklist completo para auditorías de negocio + oportunidades IA",
      category: "Auditorías",
      requiredTier: Tier.OPERATOR,
      fileUrl: "/templates/audit-checklist.pdf",
    },
    {
      title: "Case Study Template",
      description: "Template para crear casos de estudio realistas",
      category: "Marketing",
      requiredTier: Tier.OPERATOR,
      fileUrl: "/templates/case-study-template.pdf",
    },
    {
      title: "Live Session Prep Worksheet",
      description: "Worksheet para preparar sesiones en vivo",
      category: "Sesiones",
      requiredTier: Tier.OPERATOR,
      fileUrl: "/templates/live-session-prep.pdf",
    },
    // Bonus for all tiers
    {
      title: "Fast-Start Kit",
      description: "Kit de inicio rápido con prompts y plantillas esenciales",
      category: "Bonus",
      requiredTier: Tier.STARTER,
      fileUrl: "/templates/fast-start-kit.zip",
    },
  ]

  for (const asset of assets) {
    await prisma.asset.create({
      data: asset,
    })
  }

  console.log("✅ Assets created")

  // Create testimonials
  const testimonials = [
    {
      content:
        "Logré mi primer cliente gracias al reto, pero depende del esfuerzo. El sistema funciona si lo ejecutas.",
      approved: true,
    },
    {
      content:
        "Las plantillas me ahorraron semanas. Ya tengo mi primer chatbot funcionando para un restaurante local.",
      approved: true,
    },
    {
      content:
        "El enfoque de ejecución es lo que necesitaba. No promesas, solo pasos claros día a día.",
      approved: true,
    },
    {
      content:
        "Los scripts de WhatsApp fueron un game-changer. Ahora puedo responder a múltiples clientes simultáneamente.",
      approved: true,
    },
    {
      content:
        "El reto me dio la estructura que necesitaba. Aunque los resultados varían, el proceso es sólido.",
      approved: true,
    },
  ]

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    })
  }

  console.log("✅ Testimonials created")
  console.log("🎉 Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

