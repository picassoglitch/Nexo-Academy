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

    // Find or create the course
    let course = await prisma.course.findUnique({
      where: { slug: "ai-ingresos-30d" },
    })

    if (!course) {
      // Create the course if it doesn't exist
      course = await prisma.course.create({
        data: {
          slug: "ai-ingresos-30d",
          title: "Nexo",
          description: "Reto de 30 días para construir sistemas de ingresos con IA en México (sin promesas, con ejecución).",
          published: true,
        },
      })
    }

    const results: any[] = []

    // PATH5: SaaS / Herramientas IA (from PDF)
    let path5Module = await prisma.module.findFirst({
      where: {
        courseId: course.id,
        title: { contains: "Camino 5" },
      },
    })

    if (!path5Module) {
      const lastModule = await prisma.module.findFirst({
        where: { courseId: course.id },
        orderBy: { order: "desc" },
      })
      const nextOrder = lastModule ? lastModule.order + 1 : 5

      path5Module = await prisma.module.create({
        data: {
          courseId: course.id,
          order: nextOrder,
          title: "Camino 5: SaaS / Herramientas IA",
          description: "Aprende a crear y vender herramientas simples con IA que los clientes sí pagan",
        },
      })
      results.push({ path: "PATH5", action: "created", module: path5Module.title })
    }

    // PATH5 Lessons from PDF
    const path5Lessons = [
      {
        slug: "saas-1-ideas-herramientas",
        order: 1,
        title: "Lección 1: Ideas de herramientas con IA simples que sí pagan los clientes",
        summary: "Identifica herramientas con IA pequeñas, específicas y útiles que los clientes sí pagan porque resuelven un problema operativo claro.",
        transcriptMd: `# Ideas de herramientas con IA simples que sí pagan los clientes

## Qué es esto y por qué alguien pagaría por ello

Esta lección te ayuda a identificar herramientas con IA pequeñas, específicas y útiles que los clientes sí pagan porque resuelven un problema operativo claro.

No hablamos de "el próximo gran SaaS", sino de micro-herramientas que ahorran tiempo, reducen errores o generan orden.

La gente paga porque:
- Le quitas trabajo repetitivo
- La herramienta hace una cosa muy bien
- No requiere aprendizaje complejo
- Funciona desde WhatsApp o web simple

> Lo simple que funciona vende más que lo complejo que promete.

## Qué problema resuelve para el cliente

Dolores reales en México:
- Procesos manuales
- Información desordenada
- Falta de seguimiento
- Atención al cliente lenta
- Reportes hechos a mano

Dolores del creador:
- Cree que necesita programar mucho
- Piensa que SaaS = meses de desarrollo
- No sabe qué construir primero

Este enfoque:
- Reduce tiempo de desarrollo
- Permite vender rápido
- Valida con clientes reales

## Paso a paso de implementación

1. Elige un problema repetitivo
   - Algo que el cliente hace diario o semanal
   - Algo que hoy hace en Excel, WhatsApp o papel

2. Define una sola función
   - No más de 1–2 acciones clave
   - Regla: si necesitas tutorial largo, es demasiado

3. Ejemplos de ideas que sí pagan
   - Respuestas automáticas de WhatsApp por negocio
   - Generador de cotizaciones
   - Resumen automático de ventas diarias
   - Clasificador de leads
   - Generador de reportes simples
   - FAQ dinámico para clientes
   - Seguimiento de prospectos
   - Generador de contenido interno (respuestas, mensajes)

4. Define el input y el output
   - Input: texto, formulario, mensaje
   - Output: respuesta, PDF, resumen, mensaje

5. Construye con herramientas no-code / low-code
   - Formularios
   - APIs de IA
   - Automatizadores
   - Web simple o WhatsApp

6. Prueba con un cliente real
   - Demo funcional
   - Ajustes rápidos
   - Lenguaje mexicano

7. Cobra desde el inicio
   - No esperes "terminarla perfecta"

## Qué entregar al cliente

Una herramienta simple debe incluir:
- ☑ Acceso funcional (web o WhatsApp)
- ☑ Una función clara
- ☑ Instrucciones básicas
- ☑ Soporte mínimo
- ☑ Actualizaciones simples

No entregues:
- ☐ Roadmaps largos
- ☐ Promesas futuras
- ☐ Funciones no usadas

## Cómo cobrar en México

Rangos realistas (MXN):
- Setup inicial: $1,500 – $5,000
- Mensualidad:
  - Básico: $199 – $499
  - Pro: $499 – $1,500
- Licencias por usuario (opcional)

Tip: Precio bajo + utilidad clara = retención.

## Errores comunes (y cómo evitarlos)

- ☐ Querer hacer un SaaS grande → ☑ Micro-herramienta primero
- ☐ Construir sin cliente → ☑ Demo + feedback real
- ☐ Demasiadas funciones → ☑ Una función clave
- ☐ No cobrar al inicio → ☑ Cobrar valida interés
- ☐ Ignorar WhatsApp → ☑ Canal clave en México

## Checklist final (para ejecutar hoy)

- Elegí un problema repetitivo
- Definí una función única
- Escribí input y output
- Construí demo simple
- Probé con un usuario
- Definí precio
- Ofrecí la herramienta hoy

## Nota legal

Los resultados dependen de la ejecución, habilidades y mercado. No garantizamos ingresos.`,
        actionChecklistMd: `- Elegí un problema repetitivo
- Definí una función única
- Escribí input y output
- Construí demo simple
- Probé con un usuario
- Definí precio
- Ofrecí la herramienta hoy`,
        requiredTier: Tier.PRO,
      },
      {
        slug: "saas-2-validar-idea",
        order: 2,
        title: "Lección 2: Cómo validar una idea de herramienta antes de construirla",
        summary: "Validar una herramienta con IA significa confirmar que alguien la quiere y pagaría por usarla antes de invertir tiempo y dinero en desarrollarla.",
        transcriptMd: `# Cómo validar una idea de herramienta antes de construirla

## Qué es esto y por qué alguien pagaría por ello

Validar una herramienta con IA significa confirmar que alguien la quiere y pagaría por usarla antes de invertir tiempo y dinero en desarrollarla. Este método evita construir "herramientas bonitas" que nadie usa y te enfoca en problemas reales con intención de pago.

La gente paga por aprender esto porque:
- Ahorra meses de desarrollo innecesario
- Reduce riesgo financiero
- Da claridad para decidir qué sí construir
- Permite vender antes de programar

> En SaaS, validar es más valioso que construir.

## Qué problema resuelve para el cliente

Dolores reales en México:
- Construyen herramientas que nadie compra
- Se enamoran de la idea, no del problema
- Gastan tiempo/dinero sin feedback real
- Confunden "me gusta" con "pago"

Dolor clave: "No sé si vale la pena hacer esta herramienta."

Este sistema:
- Usa señales reales (mensajes, dinero, uso)
- Aprovecha WhatsApp como canal principal
- Permite decidir rápido: seguir o descartar

## Paso a paso de implementación

1. Define el problema en una frase
   - Debe ser algo repetitivo y molesto
   - Ejemplo: "Pierdo tiempo respondiendo las mismas preguntas"

2. Describe la solución sin tecnología
   - Qué hace, no cómo
   - Ejemplo: "Te entrega un resumen diario automático"

3. Identifica a quién le duele
   - Tipo de negocio
   - Tamaño
   - Canal que usa (WhatsApp, Excel, correo)

4. Crea una oferta mínima
   - Nombre simple de la herramienta
   - 3–5 bullets de beneficios
   - Precio tentativo mensual
   - CTA: WhatsApp

5. Sal a hablar con usuarios reales
   - Contacta 10–20 negocios
   - Mensaje directo y humano
   - Objetivo: conversación, no venta dura

6. Mide señales correctas

Señales fuertes:
- Preguntan precio
- Piden demo
- Aceptan pagar prueba
- Quieren usarlo ya

7. Valida con intención de pago
- Preventa
- Reserva
- Piloto pagado
- Mensualidad inicial

8. Decide
- Hay pagos/interés real → construir
- Hay dudas → ajustar
- Hay silencio → descartar

## Qué entregar al cliente

Si este método es parte de tu oferta o proceso, debes tener:
- ☑ Descripción clara del problema
- ☑ Propuesta de la herramienta
- ☑ Mensajes de validación
- ☑ Lista de interesados
- ☑ Evidencia de intención de pago
- ☑ Decisión clara (sí/no)

## Cómo cobrar en México

Formas realistas de validar con dinero (MXN):
- Preventa mensual: $199 – $499
- Piloto de prueba: $300 – $1,000
- Setup inicial simbólico: $500 – $1,500

Tip: Un solo pago real vale más que 50 opiniones positivas.

## Errores comunes (y cómo evitarlos)

- ☐ Validar con encuestas → ☑ Validar con conversaciones
- ☐ Confundir interés con pago → ☑ El dinero manda
- ☐ Explicar tecnología → ☑ Hablar de problemas y resultados
- ☐ Esperar "estar listo" → ☑ Validar con idea básica
- ☐ Construir primero → ☑ Vender primero

## Checklist final (para ejecutar hoy)

- Definí el problema en una frase
- Escribí la solución sin tecnicismos
- Identifiqué a quién le duele
- Creé oferta mínima
- Contacté 10 usuarios
- Pedí intención de pago
- Decidí construir o descartar

## Nota legal

Los resultados dependen de la ejecución, habilidades y mercado. No garantizamos ingresos.`,
        actionChecklistMd: `- Definí el problema en una frase
- Escribí la solución sin tecnicismos
- Identifiqué a quién le duele
- Creé oferta mínima
- Contacté 10 usuarios
- Pedí intención de pago
- Decidí construir o descartar`,
        requiredTier: Tier.PRO,
      },
      {
        slug: "saas-3-mvp-no-code",
        order: 3,
        title: "Lección 3: Cómo crear un MVP con herramientas no-code y IA",
        summary: "Aprende a construir un MVP funcional usando herramientas no-code y IA, sin necesidad de programar desde cero.",
        transcriptMd: `# Cómo crear un MVP con herramientas no-code y IA

## Qué es esto y por qué alguien pagaría por ello

Esta lección te enseña a construir un MVP (Producto Mínimo Viable) funcional usando herramientas no-code y IA, sin necesidad de programar desde cero.

La gente paga porque:
- Reduce tiempo de desarrollo de meses a días
- Permite validar ideas rápido
- No requiere conocimientos técnicos avanzados
- Permite iterar rápido con feedback real

> Un MVP no-code puede estar listo en días, no meses.

## Qué problema resuelve para el cliente

Dolores reales:
- Cree que necesita programar mucho
- No sabe por dónde empezar
- Piensa que MVP = meses de trabajo
- No tiene presupuesto para desarrolladores

Este sistema:
- Usa herramientas visuales
- Conecta APIs de IA
- Permite prototipar rápido
- Valida con usuarios reales

## Paso a paso de implementación

1. Define la función core
   - Una sola acción principal
   - Input claro
   - Output claro

2. Elige herramientas no-code
   - Formularios: Google Forms, Typeform
   - Automatización: Zapier, Make
   - Bases de datos: Airtable, Notion
   - Web simple: Carrd, Webflow
   - WhatsApp: Twilio, ChatAPI

3. Conecta APIs de IA
   - OpenAI API
   - Anthropic Claude
   - Google Gemini
   - APIs específicas según necesidad

4. Construye el flujo básico
   - Usuario ingresa input
   - Sistema procesa con IA
   - Sistema entrega output
   - Feedback loop

5. Prueba internamente
   - Usa casos reales
   - Verifica calidad
   - Ajusta prompts

6. Lanza con usuarios beta
   - 5-10 usuarios
   - Feedback directo
   - Iteraciones rápidas

7. Mejora basado en uso real
   - Escucha feedback
   - Prioriza mejoras
   - Mantén simple

## Qué entregar al cliente

Un MVP funcional debe incluir:
- ☑ Función core funcionando
- ☑ Interfaz simple
- ☑ Instrucciones básicas
- ☑ Canal de soporte
- ☑ Feedback loop

## Cómo cobrar en México

Rangos realistas (MXN):
- MVP básico: $1,500 – $3,000
- MVP con integraciones: $3,000 – $8,000
- Setup inicial: $500 – $2,000 (opcional)
- Pago por uso: desde $50 – $200 por acción

Tip: Empieza simple; escala después.

## Errores comunes (y cómo evitarlos)

- ☐ Ofrecer todo gratis → ☑ Cobro desde el inicio
- ☐ Esconder precios → ☑ Precio visible
- ☐ Procesos largos → ☑ Pago en 2–3 pasos
- ☐ No definir límites → ☑ Límites claros por plan
- ☐ No dar soporte → ☑ Canal activo (WhatsApp)

## Checklist final (para ejecutar hoy)

- Definí función core
- Elegí herramientas no-code
- Conecté APIs de IA
- Construí flujo básico
- Probé internamente
- Lancé con usuarios beta
- Mejoré basado en feedback

## Nota legal

Los resultados dependen de la ejecución, habilidades y mercado. No garantizamos ingresos.`,
        actionChecklistMd: `- Definí función core
- Elegí herramientas no-code
- Conecté APIs de IA
- Construí flujo básico
- Probé internamente
- Lancé con usuarios beta
- Mejoré basado en feedback`,
        requiredTier: Tier.PRO,
      },
      {
        slug: "saas-4-cobrar-mexico",
        order: 4,
        title: "Lección 4: Cómo cobrar en México",
        summary: "Aprende a configurar métodos de pago y estructurar precios para herramientas SaaS en el mercado mexicano.",
        transcriptMd: `# Cómo cobrar en México

## Qué es esto y por qué alguien pagaría por ello

Esta lección te enseña a configurar métodos de pago y estructurar precios para herramientas SaaS en el mercado mexicano.

La gente paga porque:
- No sabe qué métodos de pago usar
- No conoce las opciones en México
- No sabe cómo estructurar precios
- Quiere evitar complicaciones legales

> Cobrar bien es tan importante como construir bien.

## Qué problema resuelve para el cliente

Dolores reales:
- No sabe cómo recibir pagos
- Confusión con métodos disponibles
- Preocupaciones legales/fiscales
- No sabe qué precio poner

Este sistema:
- Usa métodos probados en México
- Simplifica el proceso
- Estructura precios claros
- Evita complicaciones

## Paso a paso de implementación

1. Elige método de pago
   - MercadoPago (tarjetas, OXXO, SPEI)
   - Stripe (si tienes cuenta)
   - PayPal (menos común en México)
   - Transferencias directas

2. Configura cuenta
   - Verifica identidad
   - Conecta cuenta bancaria
   - Configura webhooks
   - Prueba transacciones

3. Estructura precios
   - Plan básico: $199 – $499/mes
   - Plan pro: $499 – $1,500/mes
   - Setup inicial: $500 – $2,000 (opcional)
   - Pago único: según valor

4. Define límites por plan
   - Usuarios
   - Acciones/mes
   - Funciones
   - Soporte

5. Configura facturación
   - Facturación automática
   - Recordatorios
   - Renovación automática
   - Cancelación fácil

6. Prueba el flujo completo
   - Pago de prueba
   - Verifica recepción
   - Confirma acceso
   - Prueba cancelación

7. Documenta proceso
   - Cómo pagar
   - Qué incluye cada plan
   - Política de reembolsos
   - Soporte

## Qué entregar al cliente

Sistema de cobro debe incluir:
- ☑ Método de pago configurado
- ☑ Precios claros y visibles
- ☑ Proceso de pago simple
- ☑ Facturación automática
- ☑ Soporte para dudas

## Cómo cobrar en México

Rangos realistas (MXN):
- Setup inicial: $500 – $2,000 (opcional)
- Mensualidad básica: $199 – $499
- Mensualidad pro: $499 – $1,500
- Pago único: $1,500 – $3,000 (opcional)
- Pago por uso: desde $50 – $200 por acción

Tip: Empieza simple; escala después.

## Errores comunes (y cómo evitarlos)

- ☐ Ofrecer todo gratis → ☑ Cobro desde el inicio
- ☐ Esconder precios → ☑ Precio visible
- ☐ Procesos largos → ☑ Pago en 2–3 pasos
- ☐ No definir límites → ☑ Límites claros por plan
- ☐ No dar soporte → ☑ Canal activo (WhatsApp)

## Checklist final (para ejecutar hoy)

- Definí modelo de cobro
- Elegí precio inicial
- Configuré método de pago
- Definí qué incluye
- Conecté pago con acceso
- Hice el precio visible
- Cobré hoy

## Nota legal

Los resultados dependen de la ejecución, habilidades y mercado. No garantizamos ingresos.`,
        actionChecklistMd: `- Definí modelo de cobro
- Elegí precio inicial
- Configuré método de pago
- Definí qué incluye
- Conecté pago con acceso
- Hice el precio visible
- Cobré hoy`,
        requiredTier: Tier.PRO,
      },
      {
        slug: "saas-5-onboarding",
        order: 5,
        title: "Lección 5: Cómo hacer onboarding simple para clientes no técnicos",
        summary: "El onboarding es el proceso para que un cliente empiece a usar tu herramienta rápido y sin frustración.",
        transcriptMd: `# Cómo hacer onboarding simple para clientes no técnicos

## Qué es esto y por qué alguien pagaría por ello

El onboarding es el proceso para que un cliente empiece a usar tu herramienta rápido y sin frustración.

Para clientes no técnicos, un onboarding claro vale tanto como la herramienta misma.

Las empresas pagan y se quedan cuando:
- Entienden cómo usarla en minutos
- Ven valor rápido
- No necesitan "soporte técnico"
- Sienten acompañamiento humano

> Si el cliente no entiende la herramienta, no la paga.

## Qué problema resuelve para el cliente

Dolores reales en México:
- Herramientas complicadas
- Instrucciones técnicas
- Falta de acompañamiento
- Miedo a "romper algo"

Dolores del creador:
- Usuarios que no usan la herramienta
- Soporte saturado
- Cancelaciones tempranas
- Mala reputación

Este sistema:
- Reduce churn
- Aumenta uso
- Mejora percepción
- Ahorra tiempo de soporte

## Paso a paso de implementación

1. Define el "primer éxito"
   - ¿Qué debe lograr el cliente en 5–10 minutos?
   - Ejemplo: Enviar su primer mensaje, Generar su primer reporte

2. Reduce a 3 pasos máximo
   - Paso 1: acceder
   - Paso 2: ingresar datos
   - Paso 3: ver resultado

3. Usa lenguaje no técnico
   - Nada de "API", "prompt", "configuración"
   - Usa verbos simples: escribir, enviar, recibir

4. Crea una guía visual corta
   - Video de 2–5 minutos
   - O capturas con flechas
   - Una sola guía

5. Usa WhatsApp como apoyo
   - Mensaje de bienvenida
   - Respuesta rápida
   - Audio corto si hace falta

6. Confirma que lo logró
   - Pregunta directa: "¿Ya te funcionó?"
   - Ajusta si algo falla

7. Documenta solo lo esencial
   - Qué hace
   - Qué no hace
   - Cuándo pedir ayuda

## Qué entregar al cliente

Onboarding mínimo efectivo incluye:
- ☑ Mensaje de bienvenida
- ☑ Acceso a la herramienta
- ☑ Guía corta (video o PDF)
- ☑ Ejemplo real
- ☑ Canal de soporte (WhatsApp)
- ☑ Confirmación de éxito

## Cómo cobrar en México

Un buen onboarding justifica el cobro (MXN):
- Incluido en la mensualidad
- Setup inicial: $500 – $2,000 (opcional)
- Onboarding premium (1–1): extra

Tip: Mejor onboarding = menos cancelaciones.

## Errores comunes (y cómo evitarlos)

- ☐ Tutoriales largos → ☑ Guía corta y directa
- ☐ Lenguaje técnico → ☑ Lenguaje cotidiano
- ☐ No dar seguimiento → ☑ Confirmar primer uso
- ☐ Demasiados pasos → ☑ 3 pasos máximo
- ☐ Soporte invisible → ☑ WhatsApp visible

## Checklist final (para ejecutar hoy)

- Definí primer éxito
- Reduje a 3 pasos
- Creé guía corta
- Usé lenguaje simple
- Activé WhatsApp de soporte
- Confirmé primer uso
- Ajusté lo necesario

## Nota legal

Los resultados dependen de la ejecución, habilidades y mercado. No garantizamos ingresos.`,
        actionChecklistMd: `- Definí primer éxito
- Reduje a 3 pasos
- Creé guía corta
- Usé lenguaje simple
- Activé WhatsApp de soporte
- Confirmé primer uso
- Ajusté lo necesario`,
        requiredTier: Tier.PRO,
      },
      {
        slug: "saas-6-errores-comunes",
        order: 6,
        title: "Lección 6: Errores comunes que hacen fracasar herramientas pequeñas",
        summary: "Identifica los errores más frecuentes que provocan que herramientas pequeñas no se vendan, no se usen o se cancelen rápido.",
        transcriptMd: `# Errores comunes que hacen fracasar herramientas pequeñas

## Qué es esto y por qué alguien pagaría por ello

Esta lección identifica los errores más frecuentes que provocan que herramientas pequeñas (micro-SaaS o utilidades con IA) no se vendan, no se usen o se cancelen rápido, y muestra cómo evitarlos con acciones concretas.

La gente paga por este conocimiento porque evita perder meses construyendo algo que nadie adopta.

> La mayoría de herramientas no fracasan por tecnología, sino por decisiones de negocio.

## Qué problema resuelve para el cliente

Dolores reales en México:
- "La herramienta funciona, pero nadie paga"
- Usuarios se registran y no regresan
- Soporte constante por confusión
- Cancelaciones tempranas
- Mucho esfuerzo, poco uso real

Dolor clave: "No entiendo por qué no despega."

Esta lección:
- Detecta fallas estructurales
- Alinea producto con uso real
- Corrige antes de escalar

## Paso a paso de implementación

1. Haz una auditoría rápida de tu herramienta
   - ¿Qué problema resuelve en una frase?
   - ¿Quién la usa exactamente?
   - ¿Qué hace en el primer uso?

2. Contrasta contra errores comunes
   - Revisa la lista de errores abajo
   - Marca los que aplican a tu caso

3. Corrige uno por uno
   - No intentes arreglar todo a la vez
   - Prioriza adopción y claridad

4. Simplifica la propuesta
   - Menos funciones
   - Un beneficio principal
   - Lenguaje simple

5. Ajusta onboarding y cobro
   - Onboarding en 5–10 minutos
   - Precio visible
   - Pago simple

6. Valida con usuarios reales
   - Conversaciones
   - Uso real
   - Feedback directo

7. Itera en ciclos cortos
   - Ajustes semanales
   - Cambios pequeños

## Qué entregar al cliente

Si esta lección se convierte en producto/servicio, entrega:
- ☑ Lista clara de errores críticos
- ☑ Diagnóstico rápido de la herramienta
- ☑ Recomendaciones accionables
- ☑ Prioridades de corrección
- ☑ Checklist de relanzamiento

## Cómo cobrar en México

Formas realistas de monetizar este conocimiento (MXN):
- Auditoría de herramienta: $500 – $2,000
- Sesión 1–1 de corrección: $800 – $3,000
- Guía / checklist: $199 – $499
- Acompañamiento corto: $3,000 – $8,000

Tip: La gente paga por evitar errores, no por teoría.

## Errores comunes (y cómo evitarlos)

- ☐ Querer resolver demasiadas cosas → ☑ Una función clave que haga bien su trabajo
- ☐ Construir sin validar pago → ☑ Cobrar desde el inicio, aunque sea poco
- ☐ Lenguaje técnico → ☑ Lenguaje cotidiano orientado a negocio
- ☐ Onboarding largo o confuso → ☑ 3 pasos máximos para el primer éxito
- ☐ No usar WhatsApp como soporte → ☑ Canal humano visible en México
- ☐ Precios ocultos o confusos → ☑ Precio claro y simple
- ☐ Ignorar feedback real → ☑ Escuchar a quien paga, no a quien opina
- ☐ Esperar a "estar listo" → ☑ Lanzar, medir, ajustar

## Checklist final (para ejecutar hoy)

- Puedo explicar mi herramienta en una frase
- Tiene una función principal clara
- El onboarding toma menos de 10 minutos
- El precio es visible
- Puedo cobrar hoy
- Uso WhatsApp como apoyo
- Escucho feedback real
- Ajusté algo esta semana

## Nota legal

Los resultados dependen de la ejecución, habilidades y mercado. No garantizamos ingresos.`,
        actionChecklistMd: `- Puedo explicar mi herramienta en una frase
- Tiene una función principal clara
- El onboarding toma menos de 10 minutos
- El precio es visible
- Puedo cobrar hoy
- Uso WhatsApp como apoyo
- Escucho feedback real
- Ajusté algo esta semana`,
        requiredTier: Tier.PRO,
      },
    ]

    // Create or update PATH5 lessons
    for (const lessonData of path5Lessons) {
      const existing = await prisma.lesson.findFirst({
        where: {
          moduleId: path5Module.id,
          slug: lessonData.slug,
        },
      })

      if (existing) {
        await prisma.lesson.update({
          where: { id: existing.id },
          data: lessonData,
        })
        results.push({ path: "PATH5", action: "updated", lesson: lessonData.title })
      } else {
        await prisma.lesson.create({
          data: {
            ...lessonData,
            moduleId: path5Module.id,
          },
        })
        results.push({ path: "PATH5", action: "created", lesson: lessonData.title })
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lecciones importadas correctamente",
        results,
      },
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    console.error("Error importing lessons:", error)
    return NextResponse.json(
      { error: "Error al importar lecciones", details: error.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

