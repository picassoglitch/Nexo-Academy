import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { Tier } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: { "Content-Type": "application/json" } })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: { "Content-Type": "application/json" } })
    }

    const results: any[] = []

    // Find or create the course
    let course = await prisma.course.findUnique({
      where: { slug: "ai-ingresos-30d" },
    })

    if (!course) {
      course = await prisma.course.create({
        data: {
          slug: "ai-ingresos-30d",
          title: "Nexo",
          description: "Reto de 30 días para construir sistemas de ingresos con IA en México (sin promesas, con ejecución).",
          published: true,
        },
      })
      results.push({ action: "created", item: "Curso Nexo" })
    }

    // MÓDULO 0 — FUNDAMENTOS (TODOS)
    let module0 = await prisma.module.findFirst({
      where: {
        courseId: course.id,
        title: { contains: "Módulo 0" },
      },
    })

    if (!module0) {
      module0 = await prisma.module.create({
        data: {
          courseId: course.id,
          order: 0,
          title: "Módulo 0: Fundamentos",
          description: "Fundamentos del sistema Nexo - Reglas, mentalidad y stack base",
        },
      })
      results.push({ module: "Módulo 0", action: "created" })
    }

    const module0Lessons = [
      {
        slug: "fundamentos-0-1-como-funciona",
        order: 1,
        title: "Lección 0.1: Cómo funciona Nexo",
        summary: "Nexo es un sistema de ejecución, no un curso teórico. Aprende las reglas no negociables.",
        transcriptMd: `# Cómo funciona AI Ingresos 30D

## Qué es

AI Ingresos 30D es un sistema de ejecución, no un curso teórico.

## Reglas no negociables

1. Eliges **1 path** durante 30 días
2. Ejecutas antes de optimizar
3. Cobras antes de perfeccionar
4. No cambias de path sin señales
5. WhatsApp es el canal principal

## Qué NO es

* No es "hazte rico rápido"
* No es ingreso pasivo inmediato
* No es teoría sin acción

## Objetivo

Este sistema está diseñado para que ejecutes, no para que aprendas teoría. Cada lección tiene una acción clara que debes completar antes de continuar.

## Checklist

- Entendí que debo elegir 1 path y ejecutarlo 30 días
- Acepto que debo cobrar antes de perfeccionar
- WhatsApp será mi canal principal
- No cambiaré de path sin señales claras`,
        actionChecklistMd: `- Entendí que debo elegir 1 path y ejecutarlo 30 días
- Acepto que debo cobrar antes de perfeccionar
- WhatsApp será mi canal principal
- No cambiaré de path sin señales claras`,
        requiredTier: Tier.STARTER,
        isFreePreview: true,
      },
      {
        slug: "fundamentos-0-2-mentalidad",
        order: 2,
        title: "Lección 0.2: Mentalidad Operativa (Beginner → Builder)",
        summary: "Principios clave para construir un negocio con IA: simplicidad, validación con cobro, uso real sobre likes.",
        transcriptMd: `# Mentalidad Operativa (Beginner → Builder)

## Principios clave

* Simplicidad vende
* Cobrar valida
* Uso > likes
* Una función > diez promesas

## Error común

Querer verse profesional antes de ser útil.

## Mentalidad correcta

1. **Simplicidad vende**: Lo simple que funciona vende más que lo complejo que promete
2. **Cobrar valida**: Un solo pago real vale más que 50 opiniones positivas
3. **Uso > likes**: Prefiero 10 usuarios que pagan que 1000 que dan like
4. **Una función > diez promesas**: Haz una cosa muy bien antes de agregar más

## Cómo pensar como builder

* Construye para resolver un problema real
* Valida con dinero, no con opiniones
* Itera basado en uso real
* Escala solo cuando algo funciona

## Checklist

- Acepto que la simplicidad vende más
- Entiendo que cobrar valida interés real
- Prefiero uso real sobre likes
- Me enfocaré en hacer una cosa muy bien`,
        actionChecklistMd: `- Acepto que la simplicidad vende más
- Entiendo que cobrar valida interés real
- Prefiero uso real sobre likes
- Me enfocaré en hacer una cosa muy bien`,
        requiredTier: Tier.STARTER,
        isFreePreview: true,
      },
      {
        slug: "fundamentos-0-3-stack-base",
        order: 3,
        title: "Lección 0.3: Stack Base (México)",
        summary: "Herramientas base que necesitas para empezar: ChatGPT, Canva, WhatsApp Business, MercadoPago.",
        transcriptMd: `# Stack Base (México)

## Herramientas base

* ChatGPT / Claude (texto)
* Canva / CapCut (visual)
* Google Docs / Notion (entrega)
* WhatsApp Business
* MercadoPago / SPEI

No necesitas más para empezar.

## Por herramienta

### ChatGPT / Claude
- Generar contenido
- Escribir scripts
- Crear respuestas automáticas
- Analizar datos

### Canva / CapCut
- Crear imágenes
- Editar videos
- Diseñar plantillas
- Generar contenido visual

### Google Docs / Notion
- Documentar procesos
- Crear plantillas
- Organizar información
- Entregar a clientes

### WhatsApp Business
- Canal principal de comunicación
- Automatización básica
- Atención al cliente
- Seguimiento de leads

### MercadoPago / SPEI
- Recibir pagos
- Facturación
- Cobros recurrentes
- Transferencias

## Setup inicial

1. Crea cuentas en todas las herramientas
2. Configura WhatsApp Business
3. Conecta MercadoPago
4. Prueba cada herramienta una vez

## Checklist

- Tengo cuenta en ChatGPT/Claude
- Tengo cuenta en Canva/CapCut
- Tengo Google Docs/Notion configurado
- Configuré WhatsApp Business
- Conecté MercadoPago/SPEI`,
        actionChecklistMd: `- Tengo cuenta en ChatGPT/Claude
- Tengo cuenta en Canva/CapCut
- Tengo Google Docs/Notion configurado
- Configuré WhatsApp Business
- Conecté MercadoPago/SPEI`,
        requiredTier: Tier.STARTER,
        isFreePreview: true,
      },
    ]

    // PATH 1 — SERVICIOS DE IA PARA NEGOCIOS LOCALES
    let path1Module = await prisma.module.findFirst({
      where: {
        courseId: course.id,
        title: { contains: "PATH 1" },
      },
    })

    if (!path1Module) {
      path1Module = await prisma.module.create({
        data: {
          courseId: course.id,
          order: 1,
          title: "PATH 1: Servicios de IA para Negocios Locales",
          description: "Cerrar 1–3 clientes reales cobrando $3,000 – $15,000 MXN por implementación",
        },
      })
      results.push({ module: "PATH 1", action: "created" })
    }

    const path1Lessons = [
      {
        slug: "path1-1-1-elegir-servicio",
        order: 1,
        title: "Lección 1.1: Elegir el servicio correcto",
        summary: "Identifica servicios válidos: WhatsApp chatbot, Instagram DM automation, contenido + menús + ads.",
        transcriptMd: `# Elegir el servicio correcto

## Servicios válidos

* WhatsApp chatbot (FAQs, citas, pedidos)
* Instagram DM automation
* Contenido + menús + ads

## Cómo elegir

Elige lo que:

* el negocio usa diario
* hoy hace manual
* duele repetir

## Proceso de decisión

1. **Identifica el dolor**: ¿Qué hace el negocio repetidamente que le duele?
2. **Valida frecuencia**: ¿Lo hace diario o semanal?
3. **Evalúa impacto**: ¿Ahorraría tiempo/errores significativos?
4. **Verifica pago**: ¿Pagaría por esto?

## Ejemplos reales

### WhatsApp Chatbot
- Negocios con muchas preguntas repetitivas
- Necesitan agendar citas constantemente
- Reciben pedidos por mensaje

### Instagram DM Automation
- Muchos mensajes sin responder
- Pierden leads por no contestar rápido
- Quieren convertir DMs en ventas

### Contenido + Menús + Ads
- Necesitan contenido constante
- No tienen tiempo para crear
- Quieren mantener presencia en redes

## Checklist

- Identifiqué 3 servicios potenciales
- Validé que el negocio los usa diario
- Confirmé que los hace manualmente
- Verifiqué que duele repetirlos`,
        actionChecklistMd: `- Identifiqué 3 servicios potenciales
- Validé que el negocio los usa diario
- Confirmé que los hace manualmente
- Verifiqué que duele repetirlos`,
        requiredTier: Tier.STARTER,
      },
      {
        slug: "path1-1-2-whatsapp-chatbot",
        order: 2,
        title: "Lección 1.2: WhatsApp Chatbot (Servicio Principal)",
        summary: "Automatización simple para responder, agendar y dar seguimiento. Setup paso a paso.",
        transcriptMd: `# WhatsApp Chatbot (Servicio Principal)

## Qué es

Automatización simple para responder, agendar y dar seguimiento.

## Implementación paso a paso

1. Identifica FAQs reales
2. Escribe respuestas claras
3. Define handoff humano
4. Prueba con mensajes reales

## Paso 1: Identifica FAQs reales

* Revisa mensajes anteriores
* Pregunta al cliente qué preguntan más
* Identifica 5-10 preguntas frecuentes
* Prioriza por frecuencia

## Paso 2: Escribe respuestas claras

* Lenguaje simple y directo
* Sin tecnicismos
* Incluye siguiente paso claro
* Máximo 3-4 líneas por respuesta

## Paso 3: Define handoff humano

* ¿Cuándo pasa a humano?
* ¿Qué palabras activan handoff?
* ¿Cómo se notifica al humano?
* ¿Cuál es el tiempo de respuesta?

## Paso 4: Prueba con mensajes reales

* Usa casos reales del cliente
* Verifica que las respuestas funcionen
* Ajusta según feedback
* Documenta el flujo

## Entregables

* Flujos de conversación
* Respuestas automáticas
* Guía de uso cliente

## Precio MX

* Setup: $3,000 – $10,000
* Mensual: $1,000 – $3,000

## Checklist

- Identifiqué 5-10 FAQs reales
- Escribí respuestas claras
- Definí handoff humano
- Probé con mensajes reales
- Documenté el flujo completo`,
        actionChecklistMd: `- Identifiqué 5-10 FAQs reales
- Escribí respuestas claras
- Definí handoff humano
- Probé con mensajes reales
- Documenté el flujo completo`,
        requiredTier: Tier.STARTER,
      },
      {
        slug: "path1-1-3-instagram-dm",
        order: 3,
        title: "Lección 1.3: Instagram DM Automation",
        summary: "Convierte mensajes en leads. Flujo: trigger, respuesta automática, CTA, seguimiento.",
        transcriptMd: `# Instagram DM Automation

## Qué hace

Convierte mensajes en leads.

## Flujo

* Trigger ("Hola")
* Respuesta automática
* CTA (agenda / WhatsApp)
* Seguimiento

## Paso 1: Configura triggers

* Palabras clave que activan respuesta
* "Hola", "Info", "Precio", etc.
* Máximo 5-7 triggers principales

## Paso 2: Crea respuesta automática

* Saludo personalizado
* Información clave
* CTA claro (agenda o WhatsApp)
* Máximo 3-4 líneas

## Paso 3: Define CTA

* ¿Qué quieres que haga?
* Agendar llamada
* Ir a WhatsApp
* Llenar formulario
* Link específico

## Paso 4: Configura seguimiento

* ¿Cuándo seguir?
* ¿Qué mensaje enviar?
* ¿Cuántas veces seguir?
* Automatiza el proceso

## Herramientas

* ManyChat
* Chatfuel
* Zapier + Instagram API
* Respuestas guardadas (manual)

## Precio MX

* Setup: $2,000 – $5,000
* Mensual: $500 – $1,500

## Checklist

- Configuré triggers principales
- Creé respuesta automática
- Definí CTA claro
- Configuré seguimiento
- Probé el flujo completo`,
        actionChecklistMd: `- Configuré triggers principales
- Creé respuesta automática
- Definí CTA claro
- Configuré seguimiento
- Probé el flujo completo`,
        requiredTier: Tier.STARTER,
      },
      {
        slug: "path1-1-4-oferta-que-se-vende",
        order: 4,
        title: "Lección 1.4: Oferta que se vende",
        summary: "Fórmula: Resultado + tiempo + claridad + bajo riesgo. Crea ofertas que convierten.",
        transcriptMd: `# Oferta que se vende

## Fórmula

Resultado + tiempo + claridad + bajo riesgo

## Componentes

### Resultado
* ¿Qué logra el cliente?
* Específico y medible
* Ejemplo: "Automatiza 50 mensajes diarios"

### Tiempo
* ¿Cuánto tarda?
* Realista y claro
* Ejemplo: "En 48 horas"

### Claridad
* ¿Qué incluye exactamente?
* Sin ambigüedades
* Ejemplo: "Chatbot con 10 respuestas automáticas"

### Bajo riesgo
* ¿Cómo reduce el riesgo?
* Garantía, piloto, prueba
* Ejemplo: "Prueba 7 días gratis"

## Ejemplo completo

> "Te automatizo WhatsApp para que tus clientes agenden sin que tú contestes todo el día. En 48 horas tendrás un chatbot funcionando con 10 respuestas automáticas. Si no funciona, te devuelvo el dinero."

## Estructura de oferta

1. **Problema**: Lo que duele hoy
2. **Solución**: Lo que haces
3. **Resultado**: Lo que logra
4. **Tiempo**: Cuándo lo logra
5. **Riesgo**: Cómo lo reduces

## Errores comunes

* Demasiado genérico
* Promesas vagas
* Sin tiempo definido
* Alto riesgo percibido

## Checklist

- Definí el resultado específico
- Establecí tiempo realista
- Aclaré qué incluye
- Reduje el riesgo percibido
- Probé la oferta con 3 personas`,
        actionChecklistMd: `- Definí el resultado específico
- Establecí tiempo realista
- Aclaré qué incluye
- Reduje el riesgo percibido
- Probé la oferta con 3 personas`,
        requiredTier: Tier.STARTER,
      },
      {
        slug: "path1-1-5-prospectar-sin-estafa",
        order: 5,
        title: "Lección 1.5: Prospectar sin parecer estafa",
        summary: "Método: Google Maps, Instagram, WhatsApp visible. Script inicial que funciona.",
        transcriptMd: `# Prospectar sin parecer estafa

## Método

* Google Maps
* Instagram
* WhatsApp visible

## Paso 1: Google Maps

* Busca negocios locales en tu nicho
* Revisa reseñas y actividad
* Identifica los que tienen WhatsApp visible
* Lista 20-30 prospectos

## Paso 2: Instagram

* Busca negocios activos en tu nicho
* Revisa stories y posts recientes
* Identifica los que responden DMs
* Lista 20-30 prospectos

## Paso 3: WhatsApp visible

* Busca negocios con WhatsApp público
* Verifica que estén activos
* Identifica los que responden rápido
* Lista 20-30 prospectos

## Script inicial

\`\`\`
Hola, vi que muchos clientes preguntan lo mismo en su WhatsApp.
Estoy ayudando a negocios similares a automatizar respuestas.
¿Te puedo mostrar un ejemplo rápido?
\`\`\`

## Por qué funciona

* Específico (vi su WhatsApp)
* Social proof (ayudo a similares)
* Bajo compromiso (ejemplo rápido)
* No vende directamente

## Seguimiento

Si no responde en 2 días:
"¿Te llegó mi mensaje? Tengo un ejemplo que puede ahorrarte tiempo."

## Errores comunes

* Mensaje genérico
* Vende inmediatamente
* Demasiado largo
* No menciona beneficio específico

## Checklist

- Listé 20-30 prospectos en Google Maps
- Listé 20-30 prospectos en Instagram
- Listé 20-30 prospectos con WhatsApp visible
- Escribí script personalizado
- Envié primeros 10 mensajes`,
        actionChecklistMd: `- Listé 20-30 prospectos en Google Maps
- Listé 20-30 prospectos en Instagram
- Listé 20-30 prospectos con WhatsApp visible
- Escribí script personalizado
- Envié primeros 10 mensajes`,
        requiredTier: Tier.STARTER,
      },
      {
        slug: "path1-1-6-cierre-rapido",
        order: 6,
        title: "Lección 1.6: Cierre rápido (15 minutos)",
        summary: "Estructura: Dolor, Ejemplo, Oferta, Precio, Siguiente paso. Cierra en 15 minutos.",
        transcriptMd: `# Cierre rápido (15 minutos)

## Estructura

1. Dolor
2. Ejemplo
3. Oferta
4. Precio
5. Siguiente paso

## Paso 1: Dolor

* Pregunta qué duele
* Escucha activamente
* Confirma el dolor
* Ejemplo: "¿Cuánto tiempo pasas respondiendo mensajes?"

## Paso 2: Ejemplo

* Muestra caso similar
* Demuestra que funciona
* Reduce riesgo
* Ejemplo: "Un negocio similar ahorró 3 horas diarias"

## Paso 3: Oferta

* Presenta solución específica
* Conecta con el dolor
* Muestra resultado claro
* Ejemplo: "Te automatizo WhatsApp para que no tengas que contestar"

## Paso 4: Precio

* Di el precio directamente
* Sin rodeos
* Justifica el valor
* Ejemplo: "$5,000 setup + $1,500 mensual"

## Paso 5: Siguiente paso

* Define acción clara
* Reduce fricción
* Crea urgencia si es necesario
* Ejemplo: "¿Empezamos mañana? Solo necesito acceso a tu WhatsApp"

## Timing

* Total: 15 minutos máximo
* Dolor: 2 minutos
* Ejemplo: 3 minutos
* Oferta: 5 minutos
* Precio: 2 minutos
* Siguiente paso: 3 minutos

## Objeciones comunes

* "Es muy caro" → Compara con tiempo ahorrado
* "No tengo tiempo" → Eso es exactamente lo que resuelve
* "Déjame pensarlo" → "¿Qué necesitas para decidir?"

## Checklist

- Practiqué la estructura 3 veces
- Preparé ejemplos de casos similares
- Definí precio claro
- Tengo siguiente paso definido
- Practiqué manejo de objeciones`,
        actionChecklistMd: `- Practiqué la estructura 3 veces
- Preparé ejemplos de casos similares
- Definí precio claro
- Tengo siguiente paso definido
- Practiqué manejo de objeciones`,
        requiredTier: Tier.STARTER,
      },
      {
        slug: "path1-1-7-entrega-retainer",
        order: 7,
        title: "Lección 1.7: Entrega + Retainer",
        summary: "Entrega simple, documentada y probada. Retainer: Mantenimiento y optimización mensual.",
        transcriptMd: `# Entrega + Retainer

## Entrega

* Simple
* Documentada
* Probada

## Qué incluye la entrega

* Herramienta funcionando
* Guía de uso (1 página)
* Soporte inicial (7 días)
* Ajustes menores (primer mes)

## Cómo entregar

1. **Funcional**: La herramienta funciona desde día 1
2. **Documentada**: Guía simple de 1 página
3. **Probada**: Probada con casos reales
4. **Soporte**: 7 días de soporte inicial

## Retainer

"Mantenimiento y optimización mensual"

## Qué incluye el retainer

* Monitoreo de funcionamiento
* Ajustes menores
* Optimizaciones basadas en uso
* Soporte continuo

## Precio retainer MX

* $1,000 – $3,000 mensual
* Depende de complejidad
* Incluye hasta 2 horas de trabajo

## Cómo vender el retainer

* "Para que siga funcionando óptimo"
* "Ajustes según cómo lo uses"
* "Soporte cuando lo necesites"
* "Optimizaciones continuas"

## Checklist entrega

- Herramienta funcionando 100%
- Guía de uso creada
- Probada con casos reales
- Soporte inicial configurado
- Cliente confirmó que funciona

## Checklist retainer

- Presenté opción de retainer
- Expliqué beneficios claros
- Definí precio mensual
- Acordé términos de servicio`,
        actionChecklistMd: `- Herramienta funcionando 100%
- Guía de uso creada
- Probada con casos reales
- Soporte inicial configurado
- Cliente confirmó que funciona
- Presenté opción de retainer
- Expliqué beneficios claros
- Definí precio mensual`,
        requiredTier: Tier.STARTER,
      },
    ]

    // PATH 2 — CONTENIDO IA PARA CREADORES
    let path2Module = await prisma.module.findFirst({
      where: {
        courseId: course.id,
        title: { contains: "PATH 2" },
      },
    })

    if (!path2Module) {
      path2Module = await prisma.module.create({
        data: {
          courseId: course.id,
          order: 2,
          title: "PATH 2: Contenido IA para Creadores",
          description: "Crear una máquina de contenido que genere afiliados, leads y productos",
        },
      })
      results.push({ module: "PATH 2", action: "created" })
    }

    const path2Lessons = [
      {
        slug: "path2-2-1-elegir-nicho",
        order: 1,
        title: "Lección 2.1: Elegir nicho rentable",
        summary: "Nichos que funcionan en MX: comida, fitness, tips diarios, educación corta, hacks prácticos.",
        transcriptMd: `# Elegir nicho rentable

## Nichos que funcionan en MX

* comida
* fitness
* tips diarios
* educación corta
* hacks prácticos

## Por qué estos nichos

### Comida
* Alto engagement
* Contenido visual
* Fácil de monetizar
* Audiencia amplia

### Fitness
* Contenido práctico
* Alto valor percibido
* Fácil de monetizar
* Comunidad activa

### Tips diarios
* Contenido rápido
* Alto consumo
* Fácil de crear
* Viral potencial

### Educación corta
* Alto valor
* Contenido útil
* Fácil de monetizar
* Audiencia comprometida

### Hacks prácticos
* Contenido útil
* Alto compartir
* Fácil de crear
* Viral potencial

## Cómo elegir tu nicho

1. **Interés personal**: ¿Te gusta el tema?
2. **Audiencia**: ¿Hay gente que consume esto?
3. **Monetización**: ¿Puedes ganar dinero?
4. **Competencia**: ¿Hay espacio para ti?

## Checklist

- Elegí 1 nicho principal
- Validé que hay audiencia
- Confirmé que puedo monetizar
- Verifiqué que hay espacio`,
        actionChecklistMd: `- Elegí 1 nicho principal
- Validé que hay audiencia
- Confirmé que puedo monetizar
- Verifiqué que hay espacio`,
        requiredTier: Tier.PRO,
      },
      {
        slug: "path2-2-2-maquina-contenido",
        order: 2,
        title: "Lección 2.2: Máquina de contenido IA",
        summary: "Flujo completo: Ideas (IA), Script (IA), Voz (IA), Visual (IA), Caption (IA). Tú solo publicas.",
        transcriptMd: `# Máquina de contenido IA

## Flujo

1. Ideas (IA)
2. Script (IA)
3. Voz (IA)
4. Visual (IA)
5. Caption (IA)

Tú solo publicas.

## Paso 1: Ideas (IA)

* Usa ChatGPT/Claude
* Prompt: "Dame 10 ideas de contenido para [nicho]"
* Filtra las mejores
* Lista 30 ideas

## Paso 2: Script (IA)

* Usa ChatGPT/Claude
* Prompt: "Escribe un script de 60 segundos para [idea]"
* Ajusta según tu estilo
* Guarda el script

## Paso 3: Voz (IA)

* Usa ElevenLabs / Murf
* Convierte script a voz
* Ajusta tono y velocidad
* Descarga el audio

## Paso 4: Visual (IA)

* Usa Canva / CapCut
* Crea visuales que acompañen
* Usa imágenes de stock o IA
* Sincroniza con audio

## Paso 5: Caption (IA)

* Usa ChatGPT/Claude
* Prompt: "Escribe un caption para Instagram/TikTok para [contenido]"
* Incluye hashtags relevantes
* Ajusta según plataforma

## Herramientas

* ChatGPT / Claude (ideas, scripts, captions)
* ElevenLabs / Murf (voz)
* Canva / CapCut (visual)
* Buffer / Hootsuite (publicación)

## Checklist

- Generé 30 ideas con IA
- Creé scripts para 10 videos
- Generé voces con IA
- Creé visuales
- Escribí captions
- Programé publicación`,
        actionChecklistMd: `- Generé 30 ideas con IA
- Creé scripts para 10 videos
- Generé voces con IA
- Creé visuales
- Escribí captions
- Programé publicación`,
        requiredTier: Tier.PRO,
      },
      {
        slug: "path2-2-3-hooks-espanol",
        order: 3,
        title: "Lección 2.3: Hooks en español (MX)",
        summary: "Estructura: Problema, Promesa clara, Curiosidad. Hooks que funcionan en México.",
        transcriptMd: `# Hooks en español (MX)

## Estructura

* Problema
* Promesa clara
* Curiosidad

## Componentes

### Problema
* Identifica dolor común
* Conecta con audiencia
* Ejemplo: "¿Cansado de no saber qué cocinar?"

### Promesa clara
* Qué van a aprender
* Resultado específico
* Ejemplo: "Te muestro 5 recetas en 5 minutos"

### Curiosidad
* Genera interés
* Crea necesidad de ver
* Ejemplo: "La #3 te va a sorprender"

## Ejemplos que funcionan

* "Esto es lo que nadie te dice sobre..."
* "3 errores que todos cometen..."
* "La forma más rápida de..."
* "Esto cambió mi vida..."

## Adaptación para MX

* Usa lenguaje mexicano
* Referencias locales
* Humor mexicano
* Situaciones cotidianas MX

## Checklist

- Escribí 10 hooks con la estructura
- Adapté lenguaje para MX
- Probé 3 hooks en contenido real
- Medí cuál funciona mejor`,
        actionChecklistMd: `- Escribí 10 hooks con la estructura
- Adapté lenguaje para MX
- Probé 3 hooks en contenido real
- Medí cuál funciona mejor`,
        requiredTier: Tier.PRO,
      },
      {
        slug: "path2-2-4-monetizacion",
        order: 4,
        title: "Lección 2.4: Monetización",
        summary: "Afiliados Amazon MX, Lead gen para servicios, Producto propio. Cómo monetizar contenido.",
        transcriptMd: `# Monetización

## Opciones

* Afiliados Amazon MX
* Lead gen para servicios
* Producto propio

## Afiliados Amazon MX

* Revisa productos relevantes
* Crea contenido sobre ellos
* Incluye link de afiliado
* Gana comisión por venta

## Lead gen para servicios

* Crea contenido valioso
* Ofrece lead magnet
* Captura leads
* Vende a servicios locales

## Producto propio

* Crea producto digital
* Promuévelo en contenido
* Vende directamente
* Mayor margen

## Cómo elegir

* **Afiliados**: Fácil empezar, menor margen
* **Lead gen**: Requiere red, mayor margen
* **Producto propio**: Más trabajo, mayor margen

## Checklist

- Elegí método de monetización
- Configuré sistema (afiliados/leads/producto)
- Creé contenido que promueve monetización
- Medí resultados iniciales`,
        actionChecklistMd: `- Elegí método de monetización
- Configuré sistema (afiliados/leads/producto)
- Creé contenido que promueve monetización
- Medí resultados iniciales`,
        requiredTier: Tier.PRO,
      },
    ]

    // PATH 3 — PRODUCTOS DIGITALES IA
    let path3Module = await prisma.module.findFirst({
      where: {
        courseId: course.id,
        title: { contains: "PATH 3" },
      },
    })

    if (!path3Module) {
      path3Module = await prisma.module.create({
        data: {
          courseId: course.id,
          order: 3,
          title: "PATH 3: Productos Digitales IA",
          description: "Vender 1 producto digital validado: Prompt Packs, Templates, Dashboards Notion",
        },
      })
      results.push({ module: "PATH 3", action: "created" })
    }

    const path3Lessons = [
      {
        slug: "path3-3-1-prompt-packs",
        order: 1,
        title: "Lección 3.1: Prompt Packs",
        summary: "Qué vender: Prompts específicos, Nicho MX, Resultado claro. Crea y vende packs de prompts.",
        transcriptMd: `# Prompt Packs

## Qué vender

* Prompts específicos
* Nicho MX
* Resultado claro

## Cómo crear

1. Identifica necesidad
2. Crea prompts que resuelven
3. Organiza por categoría
4. Prueba con usuarios reales

## Estructura del pack

* 10-20 prompts
* Organizados por categoría
* Ejemplos de uso
* Guía rápida

## Precio MX

* $199 – $499 por pack
* Depende de valor
* Puede ser recurrente

## Checklist

- Creé 10-20 prompts específicos
- Organicé por categoría
- Agregué ejemplos de uso
- Probé con usuarios reales
- Definí precio`,
        actionChecklistMd: `- Creé 10-20 prompts específicos
- Organicé por categoría
- Agregué ejemplos de uso
- Probé con usuarios reales
- Definí precio`,
        requiredTier: Tier.PRO,
      },
      {
        slug: "path3-3-2-templates-negocio",
        order: 2,
        title: "Lección 3.2: Templates Negocio MX",
        summary: "Menús, Ads, WhatsApp scripts. Templates específicos para negocios mexicanos.",
        transcriptMd: `# Templates Negocio MX

## Qué crear

* Menús
* Ads
* WhatsApp scripts

## Menús

* Plantillas de menú
* Diseños profesionales
* Fáciles de editar
* Específicos para MX

## Ads

* Plantillas de anuncios
* Copy pre-escrito
* Diseños listos
* Adaptables

## WhatsApp scripts

* Scripts de ventas
* Respuestas automáticas
* Flujos de conversación
* Adaptables por nicho

## Precio MX

* $299 – $799 por template
* Pack de 5: $999
* Recurrente si actualizas

## Checklist

- Creé 3-5 templates
- Los probé con usuarios reales
- Documenté cómo usarlos
- Definí precio
- Preparé para venta`,
        actionChecklistMd: `- Creé 3-5 templates
- Los probé con usuarios reales
- Documenté cómo usarlos
- Definí precio
- Preparé para venta`,
        requiredTier: Tier.PRO,
      },
      {
        slug: "path3-3-3-dashboards-notion",
        order: 3,
        title: "Lección 3.3: Dashboards Notion",
        summary: "CRM simple, Contenido, Finanzas. Dashboards de Notion para vender.",
        transcriptMd: `# Dashboards Notion

## Qué crear

* CRM simple
* Contenido
* Finanzas

## CRM simple

* Seguimiento de clientes
* Pipeline de ventas
* Tareas y recordatorios
* Simple y funcional

## Contenido

* Calendario editorial
* Ideas de contenido
* Banco de recursos
* Métricas

## Finanzas

* Ingresos y gastos
* Proyecciones
* Reportes simples
* Control básico

## Precio MX

* $499 – $1,499 por dashboard
* Pack de 3: $2,999
* Soporte inicial incluido

## Checklist

- Creé dashboard funcional
- Lo probé con usuarios reales
- Documenté cómo usarlo
- Definí precio
- Preparé para venta`,
        actionChecklistMd: `- Creé dashboard funcional
- Lo probé con usuarios reales
- Documenté cómo usarlo
- Definí precio
- Preparé para venta`,
        requiredTier: Tier.PRO,
      },
      {
        slug: "path3-3-4-venta-hotmart-gumroad",
        order: 4,
        title: "Lección 3.4: Venta en Hotmart / Gumroad",
        summary: "Flujo: Producto → Página → Pago → Entrega. Configura tu tienda de productos digitales.",
        transcriptMd: `# Venta en Hotmart / Gumroad

## Flujo

Producto → Página → Pago → Entrega

## Paso 1: Producto

* Crea el producto
* Prepara archivos
* Documenta uso
* Prepara preview

## Paso 2: Página

* Crea landing page
* Incluye beneficios
* Agrega testimonios
* Muestra preview

## Paso 3: Pago

* Configura método de pago
* Define precios
* Configura descuentos
* Prueba compra

## Paso 4: Entrega

* Automatiza entrega
* Envía acceso
* Confirma recepción
* Ofrece soporte

## Hotmart vs Gumroad

### Hotmart
* Popular en MX
* Comisiones altas
* Muchas funciones
* Soporte en español

### Gumroad
* Comisiones bajas
* Simple
* Menos funciones
* Soporte en inglés

## Checklist

- Creé producto completo
- Creé landing page
- Configuré método de pago
- Automaticé entrega
- Probé compra completa`,
        actionChecklistMd: `- Creé producto completo
- Creé landing page
- Configuré método de pago
- Automaticé entrega
- Probé compra completa`,
        requiredTier: Tier.PRO,
      },
    ]

    // PATH 4 — FREELANCE IA
    let path4Module = await prisma.module.findFirst({
      where: {
        courseId: course.id,
        title: { contains: "PATH 4" },
      },
    })

    if (!path4Module) {
      path4Module = await prisma.module.create({
        data: {
          courseId: course.id,
          order: 4,
          title: "PATH 4: Freelance IA",
          description: "Servicios de freelance con IA: Copywriting, SEO, Gestión de redes",
        },
      })
      results.push({ module: "PATH 4", action: "created" })
    }

    const path4Lessons = [
      {
        slug: "path4-4-1-servicios-freelance",
        order: 1,
        title: "Lección 4.1: Servicios válidos de Freelance IA",
        summary: "Copywriting IA, SEO con IA, Gestión redes. Servicios que puedes ofrecer como freelance.",
        transcriptMd: `# Servicios válidos de Freelance IA

## Servicios válidos

* Copywriting IA
* SEO con IA
* Gestión redes

## Copywriting IA

* Escribir con IA
* Optimizar copy
* Crear contenido
* Editar y mejorar

## SEO con IA

* Investigación keywords
* Optimización on-page
* Crear contenido SEO
* Análisis y reportes

## Gestión redes

* Crear contenido
* Programar publicaciones
* Responder comentarios
* Analizar métricas

## Precios

* Proyecto: $1,000 – $5,000
* Mensual: $5,000 – $20,000

## Checklist

- Elegí 1 servicio principal
- Definí qué incluye
- Establecí precio
- Creé portafolio básico`,
        actionChecklistMd: `- Elegí 1 servicio principal
- Definí qué incluye
- Establecí precio
- Creé portafolio básico`,
        requiredTier: Tier.PRO,
      },
    ]

    // PATH 5 — SaaS / HERRAMIENTAS IA (usar contenido del PDF existente)
    let path5Module = await prisma.module.findFirst({
      where: {
        courseId: course.id,
        title: { contains: "PATH 5" },
      },
    })

    if (!path5Module) {
      path5Module = await prisma.module.create({
        data: {
          courseId: course.id,
          order: 5,
          title: "PATH 5: SaaS / Herramientas IA",
          description: "Validar 1 micro-herramienta pagada. MVP, validación, cobros, onboarding.",
        },
      })
      results.push({ module: "PATH 5", action: "created" })
    }

    // Create/update all lessons
    const allLessons = [
      { module: module0, lessons: module0Lessons, path: "Módulo 0" },
      { module: path1Module, lessons: path1Lessons, path: "PATH 1" },
      { module: path2Module, lessons: path2Lessons, path: "PATH 2" },
      { module: path3Module, lessons: path3Lessons, path: "PATH 3" },
      { module: path4Module, lessons: path4Lessons, path: "PATH 4" },
    ]

    for (const { module: mod, lessons, path } of allLessons) {
      for (const lessonData of lessons) {
        const existing = await prisma.lesson.findFirst({
          where: {
            moduleId: mod.id,
            slug: lessonData.slug,
          },
        })

        if (existing) {
          await prisma.lesson.update({
            where: { id: existing.id },
            data: lessonData,
          })
          results.push({ path, action: "updated", lesson: lessonData.title })
        } else {
          await prisma.lesson.create({
            data: {
              ...lessonData,
              moduleId: mod.id,
            },
          })
          results.push({ path, action: "created", lesson: lessonData.title })
        }
      }
    }

    // PATH 5 usa el contenido del PDF que ya está en add-saas route
    // El usuario puede importarlo por separado si lo necesita

    return NextResponse.json(
      {
        success: true,
        message: "Curso completo importado correctamente",
        results,
        summary: {
          modules: 6,
          lessons: results.filter((r) => r.lesson).length,
        },
      },
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    console.error("Error importing full course:", error)
    return NextResponse.json(
      { error: "Error al importar curso completo", details: error.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
