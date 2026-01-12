"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import posthog from "posthog-js"
import Link from "next/link"
import { PLANS_DATA } from "@/lib/plans-data"

type QuizOption = {
  value: string
  label: string
  description?: string
}

type QuizStep = {
  id: string
  section: string
  question: string
  description?: string
  options?: QuizOption[]
  type: "single" | "multiple" | "text" | "scale"
  placeholder?: string
  emoji?: string // Emoji related to the question
}

// Import quiz steps from previous structure
const SECTION_1: QuizStep[] = [
  {
    id: "main-goal",
    section: "Contexto",
    question: "¿Cuál es tu principal objetivo con la inteligencia artificial?",
    description: "Elige la opción que mejor describa tu motivación principal",
    emoji: "🎯",
    type: "single",
    options: [
      { value: "dinero", label: "Generar ingresos adicionales o principales" },
      { value: "habilidades", label: "Aprender nuevas habilidades profesionales" },
      { value: "negocio", label: "Hacer crecer o automatizar mi negocio" },
      { value: "curiosidad", label: "Satisfacer mi curiosidad y explorar posibilidades" },
    ],
  },
  {
    id: "time-horizon",
    section: "Contexto",
    question: "¿Cuándo quieres empezar a ver resultados?",
    emoji: "⏰",
    type: "single",
    options: [
      { value: "inmediato", label: "Lo antes posible (esta semana)" },
      { value: "1-mes", label: "En el próximo mes" },
      { value: "3-meses", label: "En los próximos 3 meses" },
      { value: "6-meses", label: "En los próximos 6 meses" },
      { value: "sin-prisa", label: "No tengo prisa, quiero aprender bien" },
    ],
  },
  {
    id: "experience-level",
    section: "Contexto",
    question: "¿Cuál es tu nivel de experiencia con inteligencia artificial?",
    emoji: "🧠",
    type: "single",
    options: [
      { value: "ninguna", label: "Ninguna, nunca he usado IA" },
      { value: "basica", label: "Básica, he usado ChatGPT o herramientas similares" },
      { value: "intermedia", label: "Intermedia, uso varias herramientas de IA regularmente" },
      { value: "avanzada", label: "Avanzada, creo prompts complejos o integro IA en mi trabajo" },
    ],
  },
  {
    id: "income-type",
    section: "Contexto",
    question: "¿Qué tipo de ingresos buscas generar?",
    emoji: "💰",
    type: "single",
    options: [
      { value: "ingresos-extra", label: "Ingresos extra mientras mantengo mi trabajo actual" },
      { value: "ingresos-principales", label: "Ingresos principales, quiero hacer esto mi trabajo" },
      { value: "ambos", label: "Empezar como extra y eventualmente hacerlo principal" },
      { value: "no-seguro", label: "Aún no estoy seguro, quiero explorar opciones" },
    ],
  },
  {
    id: "seriousness",
    section: "Contexto",
    question: "¿Qué tan serio estás sobre tomar acción y empezar?",
    emoji: "💪",
    type: "single",
    options: [
      { value: "muy-serio", label: "Muy serio, estoy listo para empezar ahora" },
      { value: "serio", label: "Serio, pero necesito ver el plan primero" },
      { value: "explorando", label: "Estoy explorando opciones" },
      { value: "solo-curioso", label: "Solo tengo curiosidad por ahora" },
    ],
  },
  {
    id: "name",
    section: "Contexto",
    question: "¿Cómo te llamas?",
    description: "Queremos personalizar tu experiencia",
    emoji: "👋",
    type: "text",
    placeholder: "Tu nombre",
  },
]

const SECTION_2: QuizStep[] = [
  {
    id: "technical-level",
    section: "Habilidades",
    question: "¿Cómo describirías tu nivel técnico general?",
    emoji: "⚙️",
    type: "single",
    options: [
      { value: "principiante", label: "Principiante, necesito guía paso a paso" },
      { value: "basico", label: "Básico, me defiendo con tecnología común" },
      { value: "intermedio", label: "Intermedio, aprendo rápido nuevas herramientas" },
      { value: "avanzado", label: "Avanzado, me siento cómodo con tecnología compleja" },
    ],
  },
  {
    id: "tools-used",
    section: "Habilidades",
    question: "¿Qué herramientas de IA ya usas o has usado?",
    description: "Puedes seleccionar todas las que apliquen",
    emoji: "🛠️",
    type: "multiple",
    options: [
      { value: "chatgpt", label: "ChatGPT" },
      { value: "claude", label: "Claude" },
      { value: "midjourney", label: "Midjourney / DALL-E" },
      { value: "canva", label: "Canva (con IA)" },
      { value: "otras", label: "Otras herramientas de IA" },
      { value: "ninguna", label: "Ninguna, sería mi primera vez" },
    ],
  },
  {
    id: "time-available",
    section: "Habilidades",
    question: "¿Cuántas horas por semana puedes dedicar a aprender y ejecutar?",
    emoji: "📅",
    type: "single",
    options: [
      { value: "menos-2h", label: "Menos de 2 horas" },
      { value: "2-4h", label: "2-4 horas" },
      { value: "5-10h", label: "5-10 horas" },
      { value: "10-20h", label: "10-20 horas" },
      { value: "20h+", label: "Más de 20 horas" },
    ],
  },
  {
    id: "access-resources",
    section: "Habilidades",
    question: "¿Con qué recursos cuentas para trabajar?",
    description: "Selecciona todos los que tengas",
    emoji: "💻",
    type: "multiple",
    options: [
      { value: "computadora", label: "Computadora o laptop" },
      { value: "smartphone", label: "Smartphone" },
      { value: "internet", label: "Internet estable" },
      { value: "presupuesto-herramientas", label: "Presupuesto para herramientas premium" },
    ],
  },
  {
    id: "learning-comfort",
    section: "Habilidades",
    question: "¿Qué tan cómodo te sientes aprendiendo paso a paso?",
    emoji: "📚",
    type: "single",
    options: [
      { value: "muy-comodo", label: "Muy cómodo, prefiero instrucciones claras" },
      { value: "comodo", label: "Cómodo, pero también me gusta explorar" },
      { value: "poco-comodo", label: "Poco cómodo, prefiero más autonomía" },
      { value: "no-seguro", label: "No estoy seguro, depende del tema" },
    ],
  },
  {
    id: "past-attempts",
    section: "Habilidades",
    question: "¿Has intentado generar ingresos en línea antes?",
    emoji: "🔄",
    type: "single",
    options: [
      { value: "si-exitoso", label: "Sí, y he tenido éxito" },
      { value: "si-parcial", label: "Sí, con resultados parciales" },
      { value: "si-sin-resultados", label: "Sí, pero sin resultados" },
      { value: "no", label: "No, sería mi primera vez" },
    ],
  },
]

const SECTION_3: QuizStep[] = [
  {
    id: "interest-services",
    section: "Intereses",
    question: "¿Te interesa ofrecer servicios de IA a negocios locales?",
    description: "Por ejemplo: automatizar marketing, crear contenido, optimizar procesos",
    emoji: "🏢",
    type: "single",
    options: [
      { value: "muy-interesado", label: "Muy interesado" },
      { value: "interesado", label: "Interesado" },
      { value: "poco-interesado", label: "Poco interesado" },
      { value: "no-interesado", label: "No me interesa" },
    ],
  },
  {
    id: "interest-content",
    section: "Intereses",
    question: "¿Te interesa crear contenido usando IA?",
    description: "Videos, posts, artículos, imágenes para redes sociales o tu marca",
    emoji: "🎨",
    type: "single",
    options: [
      { value: "muy-interesado", label: "Muy interesado" },
      { value: "interesado", label: "Interesado" },
      { value: "poco-interesado", label: "Poco interesado" },
      { value: "no-interesado", label: "No me interesa" },
    ],
  },
  {
    id: "interest-products",
    section: "Intereses",
    question: "¿Te interesa crear y vender productos digitales con IA?",
    description: "Ebooks, cursos, plantillas, herramientas digitales",
    emoji: "📦",
    type: "single",
    options: [
      { value: "muy-interesado", label: "Muy interesado" },
      { value: "interesado", label: "Interesado" },
      { value: "poco-interesado", label: "Poco interesado" },
      { value: "no-interesado", label: "No me interesa" },
    ],
  },
  {
    id: "interest-freelance",
    section: "Intereses",
    question: "¿Te interesa trabajar como freelancer o consultor de IA?",
    description: "Ofrecer servicios de escritura, SEO, automatización a clientes",
    emoji: "💼",
    type: "single",
    options: [
      { value: "muy-interesado", label: "Muy interesado" },
      { value: "interesado", label: "Interesado" },
      { value: "poco-interesado", label: "Poco interesado" },
      { value: "no-interesado", label: "No me interesa" },
    ],
  },
  {
    id: "interest-saas",
    section: "Intereses",
    question: "¿Te interesa crear herramientas o SaaS con IA?",
    description: "Aplicaciones, software o plataformas que usen IA",
    emoji: "🚀",
    type: "single",
    options: [
      { value: "muy-interesado", label: "Muy interesado" },
      { value: "interesado", label: "Interesado" },
      { value: "poco-interesado", label: "Poco interesado" },
      { value: "no-interesado", label: "No me interesa" },
    ],
  },
  {
    id: "preference-templates",
    section: "Intereses",
    question: "¿Qué prefieres para aprender?",
    description: "Puedes seleccionar múltiples opciones",
    emoji: "📋",
    type: "multiple",
    options: [
      { value: "templates", label: "Plantillas listas para usar (done-for-you)" },
      { value: "guias", label: "Guías paso a paso detalladas" },
      { value: "comunidad", label: "Acceso a comunidad y soporte" },
      { value: "casos-estudio", label: "Casos de estudio y ejemplos reales" },
    ],
  },
  {
    id: "business-type",
    section: "Intereses",
    question: "¿Qué tipo de negocio prefieres construir?",
    emoji: "🏗️",
    type: "single",
    options: [
      { value: "solo", label: "Solo, trabajo independiente" },
      { value: "clientes", label: "Con clientes, servicios o consultoría" },
      { value: "automatizado", label: "Automatizado y escalable" },
      { value: "no-seguro", label: "Aún no estoy seguro" },
    ],
  },
]

const SECTION_4: QuizStep[] = [
  {
    id: "biggest-fear",
    section: "Barreras",
    question: "¿Cuál es tu mayor miedo o preocupación al empezar?",
    emoji: "😟",
    type: "single",
    options: [
      { value: "tiempo", label: "No tener suficiente tiempo" },
      { value: "dinero", label: "Invertir dinero sin resultados" },
      { value: "tecnologia", label: "No entender la tecnología" },
      { value: "fracaso", label: "Fracasar o no tener éxito" },
      { value: "competencia", label: "Hay mucha competencia" },
      { value: "ninguno", label: "No tengo miedos específicos" },
    ],
  },
  {
    id: "what-stopped",
    section: "Barreras",
    question: "Si has intentado esto antes, ¿qué te detuvo?",
    emoji: "🛑",
    type: "single",
    options: [
      { value: "no-empece", label: "Nunca empecé realmente" },
      { value: "falta-tiempo", label: "Falta de tiempo" },
      { value: "falta-dinero", label: "Falta de dinero o recursos" },
      { value: "falta-conocimiento", label: "Falta de conocimiento o guía" },
      { value: "desmotivacion", label: "Me desmotivé o perdí el enfoque" },
      { value: "no-intente", label: "Nunca lo he intentado" },
    ],
  },
  {
    id: "learning-style",
    section: "Barreras",
    question: "¿Cómo prefieres aprender?",
    emoji: "🎓",
    type: "single",
    options: [
      { value: "video", label: "Videos y tutoriales" },
      { value: "texto", label: "Texto y guías escritas" },
      { value: "interactivo", label: "Contenido interactivo" },
      { value: "combinado", label: "Combinación de formatos" },
      { value: "en-vivo", label: "Sesiones en vivo o mentoría" },
    ],
  },
  {
    id: "success-change",
    section: "Barreras",
    question: "Si tuvieras éxito con esto, ¿qué cambiaría en tu vida?",
    description: "Elige la opción más importante para ti",
    emoji: "✨",
    type: "single",
    options: [
      { value: "libertad-financiera", label: "Libertad financiera e independencia" },
      { value: "mas-tiempo", label: "Más tiempo para mi familia o pasatiempos" },
      { value: "trabajo-mejor", label: "Un trabajo mejor o cambiar de carrera" },
      { value: "crecer-negocio", label: "Hacer crecer mi negocio actual" },
      { value: "aprender", label: "Aprender algo nuevo y desafiante" },
    ],
  },
  {
    id: "accountability",
    section: "Barreras",
    question: "¿Qué nivel de apoyo y responsabilidad necesitas?",
    emoji: "🤝",
    type: "single",
    options: [
      { value: "mucho", label: "Mucho, quiero comunidad y seguimiento" },
      { value: "moderado", label: "Moderado, algunos recursos y comunidad" },
      { value: "poco", label: "Poco, prefiero trabajar solo" },
      { value: "no-seguro", label: "No estoy seguro" },
    ],
  },
]

const SECTION_5: QuizStep[] = [
  {
    id: "income-dream",
    section: "Compromiso",
    question: "¿Qué te emociona más sobre ganar dinero con IA?",
    description: "Escribe lo que más te motiva e ilusiona sobre las posibilidades con inteligencia artificial",
    emoji: "💫",
    type: "text",
    placeholder: "Ejemplo: Tener más tiempo libre, crear ingresos pasivos, ser mi propio jefe...",
  },
  {
    id: "success-visualization",
    section: "Compromiso",
    question: "Cuando tengas éxito con IA, ¿qué cambiarás primero en tu vida?",
    description: "Visualiza y escribe cómo transformarías tu vida con ingresos adicionales o principales",
    emoji: "🌟",
    type: "text",
    placeholder: "Ejemplo: Pagar mis deudas, mejorar mi calidad de vida, viajar más, ayudar a mi familia...",
  },
  {
    id: "readiness",
    section: "Compromiso",
    question: "¿Qué tan listo estás para empezar?",
    emoji: "✅",
    type: "single",
    options: [
      { value: "ahora", label: "Ahora mismo, estoy listo" },
      { value: "esta-semana", label: "Esta semana" },
      { value: "este-mes", label: "Este mes" },
      { value: "mas-adelante", label: "Más adelante, solo estoy explorando" },
    ],
  },
  {
    id: "decision-reinforcement",
    section: "Compromiso",
    question: "Si existiera un plan claro paso a paso para lograr tus objetivos, ¿lo seguirías?",
    emoji: "📝",
    type: "single",
    options: [
      { value: "definitivamente", label: "Definitivamente sí" },
      { value: "probablemente", label: "Probablemente sí" },
      { value: "tal-vez", label: "Tal vez, necesito ver más detalles" },
      { value: "no-seguro", label: "No estoy seguro" },
    ],
  },
  {
    id: "email",
    section: "Compromiso",
    question: "¿Cuál es tu email?",
    description: "Te enviaremos tu plan personalizado aquí",
    emoji: "📧",
    type: "text",
    placeholder: "tu@email.com",
  },
]

// Combine all sections
const QUIZ_STEPS: QuizStep[] = [
  ...SECTION_1,
  ...SECTION_2,
  ...SECTION_3,
  ...SECTION_4,
  ...SECTION_5,
]


// Tier definitions
const TIER_DEFINITIONS = {
  STARTER: {
    name: "STARTER",
    displayName: "Starter",
    checkoutTier: "STARTER",
    price: 29900,
    priceDisplay: "$299 MXN",
    incomeRange: "$5,000 - $15,000 MXN/mes",
    benefits: [
      "1 camino completo de ingresos (tu elección)",
      "Plantillas core descargables",
      "Scripts de WhatsApp básicos",
      "Acceso a comunidad privada",
      "Soporte por email",
    ],
    bonuses: [
      "Plantillas de propuestas",
      "Checklist de onboarding",
      "Guía de pricing México",
    ],
    icon: "🚀",
    color: "blue",
  },
  CREATOR: {
    name: "CREATOR",
    displayName: "Creator",
    checkoutTier: "PRO",
    price: 99900,
    priceDisplay: "$999 MXN",
    incomeRange: "$15,000 - $30,000 MXN/mes",
    benefits: [
      "Todos los caminos de contenido y productos digitales",
      "Pipeline completo de 12 reels",
      "Plantillas avanzadas de contenido",
      "Bases de datos de afiliados México",
      "Acceso a comunidad PRO",
      "Soporte prioritario",
    ],
    bonuses: [
      "Calendario de contenido 30 días",
      "Templates de lead magnets",
      "SOPs de monetización",
    ],
    icon: "✨",
    color: "purple",
  },
  FREELANCER: {
    name: "FREELANCER",
    displayName: "Freelancer",
    checkoutTier: "PRO",
    price: 99900,
    priceDisplay: "$999 MXN",
    incomeRange: "$15,000 - $50,000 MXN/mes",
    benefits: [
      "Caminos de servicios locales y consultoría",
      "Scripts completos de WhatsApp",
      "Flujos de automatización IG DMs",
      "CRM de prospectos (CSV + Notion)",
      "Discovery call scripts",
      "Acceso a comunidad PRO",
    ],
    bonuses: [
      "Pack completo de scripts WhatsApp",
      "SOP Hub Notion",
      "Templates de contratos",
    ],
    icon: "💼",
    color: "green",
  },
  SCALER: {
    name: "SCALER",
    displayName: "Scaler",
    checkoutTier: "OPERATOR",
    price: 399900,
    priceDisplay: "$3,999 MXN",
    incomeRange: "$30,000+ MXN/mes",
    benefits: [
      "Todos los caminos (incluyendo SaaS)",
      "Workflows done-for-you",
      "Auditorías personalizadas de negocio",
      "Case studies reales y detallados",
      "Sesiones en vivo mensuales",
      "Acceso a comunidad OPERATOR",
      "Soporte VIP prioritario",
    ],
    bonuses: [
      "Done-for-you workflows completos",
      "Live session workbook",
      "Quality control checklist",
      "Mentoría 1:1 (opcional)",
    ],
    icon: "⚡",
    color: "orange",
  },
} as const

type TierKey = keyof typeof TIER_DEFINITIONS

export default function QuizPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [recommendedTier, setRecommendedTier] = useState<TierKey | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const totalSteps = QUIZ_STEPS.length
  const progress = ((currentStep + 1) / totalSteps) * 100
  const currentStepData = currentStep < QUIZ_STEPS.length ? QUIZ_STEPS[currentStep] : null


  const handleAnswer = (stepId: string, value: string, type: string) => {
    if (type === "multiple") {
      const currentAnswers = (answers[stepId] as string[]) || []
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((a) => a !== value)
        : [...currentAnswers, value]
      setAnswers({ ...answers, [stepId]: newAnswers })
    } else {
      // Single choice - just select, no auto advance
      setAnswers({ ...answers, [stepId]: value })
    }
  }

  const handleTextChange = (stepId: string, value: string) => {
    setAnswers({ ...answers, [stepId]: value })
  }

  const handleNext = () => {
    if (!currentStepData) return

    // Validation
    if (currentStepData.type === "single" && !answers[currentStepData.id]) {
      return
    }
    if (currentStepData.type === "multiple") {
      const selected = answers[currentStepData.id] as string[]
      if (!selected || selected.length === 0) {
        return
      }
    }
    if (currentStepData.type === "text" && !answers[currentStepData.id]) {
      return
    }

    // Check if we're on the last question
    if (currentStep < QUIZ_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Last question - calculate recommendation and show results
      calculateTier()
      if (typeof window !== "undefined") {
        localStorage.setItem("quiz_completed", "true")
      }
      setShowResults(true)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const calculateTier = (): TierKey => {
    const experience = answers["experience-level"] as string
    const timeAvailable = answers["time-available"] as string
    const incomeType = answers["income-type"] as string
    const interestServices = answers["interest-services"] as string
    const interestContent = answers["interest-content"] as string
    const interestProducts = answers["interest-products"] as string
    const interestFreelance = answers["interest-freelance"] as string

    // SCALER logic
    if (
      (experience === "avanzada" && timeAvailable === "20h+") ||
      (incomeType === "ingresos-principales" && experience === "avanzada") ||
      (incomeType === "ingresos-principales" && timeAvailable === "20h+")
    ) {
      setRecommendedTier("SCALER")
      return "SCALER"
    }

    // FREELANCER logic
    if (
      (interestServices === "muy-interesado" || interestServices === "interesado") ||
      (interestFreelance === "muy-interesado" || interestFreelance === "interesado")
    ) {
      setRecommendedTier("FREELANCER")
      return "FREELANCER"
    }

    // CREATOR logic
    if (
      (interestContent === "muy-interesado" || interestContent === "interesado") ||
      (interestProducts === "muy-interesado" || interestProducts === "interesado")
    ) {
      setRecommendedTier("CREATOR")
      return "CREATOR"
    }

    // Default: STARTER
    setRecommendedTier("STARTER")
    return "STARTER"
  }

  const handleCheckout = () => {
    if (!recommendedTier) return
    const tierDef = TIER_DEFINITIONS[recommendedTier]
    router.push(`/pricing?tier=${tierDef.checkoutTier}`)
  }

  // Save quiz response
  useEffect(() => {
    if (showResults && recommendedTier) {
      const finalAnswers = {
        ...answers,
        recommendedTier,
      }

      fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      }).catch((error) => {
        console.error("Error saving quiz response:", error)
      })
    }
  }, [showResults, recommendedTier, answers])

  const tierDef = recommendedTier ? TIER_DEFINITIONS[recommendedTier] : null
  const name = (answers["name"] as string) || ""

  // Get user profile summary with qualitative indicators
  const getUserProfile = () => {
    const experience = answers["experience-level"] as string
    const timeAvailable = answers["time-available"] as string
    const mainGoal = answers["main-goal"] as string
    const readiness = answers["readiness"] as string
    const decisionReinforcement = answers["decision-reinforcement"] as string
    const incomeType = answers["income-type"] as string

    // Map to qualitative labels
    const getSkillLevel = () => {
      if (experience === "avanzada") return "Alto"
      if (experience === "intermedia") return "Moderado"
      return "Principiante"
    }

    const getTimeLevel = () => {
      if (timeAvailable === "20h+") return "Alto"
      if (timeAvailable === "10-20h") return "Moderado"
      return "Limitado"
    }

    const getMotivationLevel = () => {
      if (readiness === "ahora") return "Alta"
      if (readiness === "esta-semana") return "Moderada"
      if (readiness === "este-mes") return "Moderada"
      return "Explorando"
    }

    const getReadinessLevel = () => {
      if (decisionReinforcement === "definitivamente") return "Alto"
      if (decisionReinforcement === "probablemente") return "Moderado"
      return "Bajo"
    }

    const getFocusLabel = () => {
      if (mainGoal === "dinero") return "Ingresos"
      if (mainGoal === "habilidades") return "Desarrollo"
      if (mainGoal === "negocio") return "Negocio"
      return "Exploración"
    }

    return {
      skill: getSkillLevel(),
      time: getTimeLevel(),
      motivation: getMotivationLevel(),
      readiness: getReadinessLevel(),
      focus: getFocusLabel(),
      commitment: incomeType === "ingresos-principales" ? "Alto" : "Moderado",
    }
  }

  // Generate positive insight based on answers
  const getPositiveInsight = () => {
    const profile = getUserProfile()
    const experience = answers["experience-level"] as string
    const timeAvailable = answers["time-available"] as string
    const mainGoal = answers["main-goal"] as string

    if (profile.skill === "Alto" && profile.time === "Alto") {
      return "Tienes una base sólida y tiempo disponible. Con un plan estructurado, puedes avanzar rápidamente."
    }
    if (profile.motivation === "Alta" && profile.readiness === "Alto") {
      return "Tu motivación y disposición son claras. Esto es un excelente punto de partida para construir resultados consistentes."
    }
    if (mainGoal === "dinero" && profile.commitment === "Alto") {
      return "Tu enfoque en generar ingresos, combinado con tu compromiso, te posiciona bien para resultados reales."
    }
    if (experience === "principiante" && profile.motivation === "Alta") {
      return "Comenzar desde cero con alta motivación es una ventaja. Un plan guiado te ayudará a evitar errores comunes."
    }
    return "Tienes un perfil equilibrado. Con el enfoque correcto y un plan claro, puedes lograr tus objetivos."
  }

  // Results screen
  if (showResults && tierDef) {
    const profile = getUserProfile()
    const insight = getPositiveInsight()
    // Map tier checkout code to plan name
    const getPlanNameFromTier = (checkoutTier: string) => {
      if (checkoutTier === "STARTER") return "Starter"
      if (checkoutTier === "PRO") return "PRO"
      if (checkoutTier === "OPERATOR") return "Operator"
      return "Starter"
    }
    
    const recommendedPlanName = getPlanNameFromTier(tierDef.checkoutTier)
    const recommendedPlan = PLANS_DATA.find(
      (plan) => plan.name === recommendedPlanName
    ) || PLANS_DATA[0]
    
    // Get recommendation explanation
    const getRecommendationExplanation = () => {
      if (recommendedPlanName === "Starter") {
        return "Te recomendamos Starter porque es el punto de partida perfecto para construir una base sólida con IA. Ideal si estás comenzando y quieres un enfoque guiado paso a paso."
      }
      if (recommendedPlanName === "PRO") {
        return "Te recomendamos PRO porque tienes la motivación y el tiempo para aprovechar todos los caminos de ingresos. Es el mejor valor para maximizar tus resultados con IA."
      }
      return "Te recomendamos Operator porque estás listo para escalar operaciones y automatizar procesos. Tienes la experiencia y el compromiso para construir sistemas que funcionen mientras duermes."
    }

    // Get all plans with recommended highlight
    const allPlans = PLANS_DATA.map((plan) => ({
      ...plan,
      isRecommended: plan.name === recommendedPlanName,
    }))

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Personalizado */}
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-block mb-4">
              <span className="text-6xl md:text-7xl">{tierDef.icon}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              ¡Felicidades! Tu perfil: {tierDef.displayName}
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Basado en tus respuestas, estás listo para{" "}
              {tierDef.displayName === "Starter" && "comenzar tu camino con IA desde cero."}
              {tierDef.displayName === "Creator" && "generar ingresos con contenido y productos digitales usando IA."}
              {tierDef.displayName === "Freelancer" && "ofrecer servicios locales y consultoría con herramientas de IA."}
              {tierDef.displayName === "Scaler" && "escalar operaciones y construir sistemas automatizados."}
            </p>
          </div>

          {/* Recap Visual de Indicadores */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 md:p-8 mb-8">
            <h3 className="text-lg font-semibold text-white mb-6 text-center">Tu perfil en resumen</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                <div className="text-xs font-medium text-slate-400 mb-2">Enfoque</div>
                <div className="text-base font-bold text-white">{profile.focus}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                <div className="text-xs font-medium text-slate-400 mb-2">Habilidad</div>
                <div className="text-base font-bold text-white">{profile.skill}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                <div className="text-xs font-medium text-slate-400 mb-2">Tiempo</div>
                <div className="text-base font-bold text-white">{profile.time}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                <div className="text-xs font-medium text-slate-400 mb-2">Motivación</div>
                <div className="text-base font-bold text-white">{profile.motivation}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                <div className="text-xs font-medium text-slate-400 mb-2">Preparación</div>
                <div className="text-base font-bold text-white">{profile.readiness}</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                <div className="text-xs font-medium text-slate-400 mb-2">Compromiso</div>
                <div className="text-base font-bold text-white">{profile.commitment}</div>
              </div>
            </div>
          </div>

          {/* Explicación de Recomendación con Urgencia */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl border-2 border-blue-500/30 p-6 md:p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                  {getRecommendationExplanation()}
                </h3>
                <div className="flex items-center gap-2 mt-4">
                  <span className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-full animate-pulse">
                    ⚡ Cupos limitados esta semana
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Planes - 3 Cards Horizontales */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
              Elige tu plan y comienza ahora
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {allPlans.map((plan) => {
                const isRecommended = plan.isRecommended
                return (
                  <div
                    key={plan.name}
                    className={`relative rounded-2xl p-6 md:p-8 transition-all duration-300 ${
                      isRecommended
                        ? "bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 border-4 border-amber-400 shadow-2xl shadow-amber-500/20 scale-105 md:scale-110 z-10"
                        : "bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    {/* Badge Recomendado */}
                    {isRecommended && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                          ¡Recomendado para ti!
                        </span>
                      </div>
                    )}

                    {/* Badge Popular para PRO */}
                    {plan.name === "PRO" && !isRecommended && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="inline-flex items-center px-6 py-2 bg-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                          Más popular
                        </span>
                      </div>
                    )}

                    {/* Header del Plan */}
                    <div className="text-center mb-6">
                      <h3 className={`text-2xl md:text-3xl font-bold mb-2 ${isRecommended ? "text-white" : "text-slate-200"}`}>
                        {plan.name}
                      </h3>
                      <p className="text-slate-400 text-sm mb-4">{plan.tagline}</p>
                      
                      {/* Precio */}
                      <div className="mb-4">
                        {plan.oldPrice && (
                          <div className="text-slate-500 line-through text-lg mb-1">
                            ${(plan.oldPrice / 100).toLocaleString("es-MX")} MXN
                          </div>
                        )}
                        <div className={`text-4xl md:text-5xl font-bold ${isRecommended ? "text-white" : "text-white"}`}>
                          ${(plan.price / 100).toLocaleString("es-MX")} MXN
                        </div>
                        {plan.msiText && (
                          <div className="text-slate-400 text-sm mt-2">{plan.msiText}</div>
                        )}
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-8 min-h-[280px]">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span className={`text-sm ${feature.included ? "text-slate-200" : "text-slate-500"}`}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => {
                        const email = answers["email"] as string
                        const name = answers["name"] as string
                        const checkoutUrl = `${plan.ctaHref}${email ? `&email=${encodeURIComponent(email)}` : ''}${name ? `&name=${encodeURIComponent(name)}` : ''}`
                        router.push(checkoutUrl)
                      }}
                      className={`w-full py-6 text-lg font-bold rounded-xl transition-all duration-200 ${
                        isRecommended
                          ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/50"
                          : "bg-slate-700 hover:bg-slate-600 text-white"
                      }`}
                      size="lg"
                    >
                      {isRecommended ? `¡Empezar con ${plan.name} ahora!` : plan.ctaText}
                    </Button>

                    {/* Pago Seguro */}
                    <div className="mt-4 text-center">
                      <p className="text-xs text-slate-400">
                        🔒 Pago seguro • Acceso inmediato
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Testimonios Rápidos */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 md:p-8 mb-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Lo que dicen nuestros estudiantes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-slate-300 text-sm mb-3">
                  "En 2 semanas ya tenía mi primer cliente pagando. El sistema funciona."
                </p>
                <p className="text-slate-400 text-xs">— María G., Freelancer</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-slate-300 text-sm mb-3">
                  "Las plantillas me ahorraron horas de trabajo. Vale cada peso."
                </p>
                <p className="text-slate-400 text-xs">— Carlos R., Creator</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-slate-300 text-sm mb-3">
                  "La comunidad es increíble. Siempre hay alguien dispuesto a ayudar."
                </p>
                <p className="text-slate-400 text-xs">— Ana L., Scaler</p>
              </div>
            </div>
          </div>

          {/* Garantía y Footer */}
          <div className="text-center space-y-4">
            <div className="bg-green-500/20 border-2 border-green-500/30 rounded-xl p-6 inline-block">
              <p className="text-green-300 font-semibold text-lg">
                ✅ Reto de 30 días completo garantizado
              </p>
            </div>
            <p className="text-slate-400 text-sm">
              Precio de lanzamiento por tiempo limitado • Acceso de por vida
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main quiz screen
  if (!currentStepData) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Minimal Header */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Nexo
          </Link>
          <span className="text-sm text-gray-600">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Question Screen */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <div>
          {/* Question */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3 leading-tight flex items-center gap-3">
              {currentStepData.emoji && <span className="text-4xl md:text-5xl">{currentStepData.emoji}</span>}
              <span>{currentStepData.question}</span>
            </h1>
            {currentStepData.description && (
              <p className="text-lg text-gray-600 mt-3">
                {currentStepData.description}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentStepData.type === "single" && currentStepData.options && (
              <>
                {currentStepData.options.map((option) => {
                  const isSelected = answers[currentStepData.id] === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(currentStepData.id, option.value, currentStepData.type)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-900 shadow-md"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="font-medium text-lg">{option.label}</div>
                    </button>
                  )
                })}
                {/* Continue button for single choice */}
                <Button
                  onClick={handleNext}
                  disabled={!answers[currentStepData.id]}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-xl font-medium mt-4"
                  size="lg"
                >
                  Continuar
                </Button>
              </>
            )}

            {currentStepData.type === "multiple" && currentStepData.options && (
              <>
                {currentStepData.options.map((option) => {
                  const isSelected = (answers[currentStepData.id] as string[])?.includes(option.value)
                  
                  // Get logo for AI tools
                  const getToolLogo = (value: string) => {
                    // Using simple emoji-based icons for reliability
                    const toolIcons: Record<string, string> = {
                      chatgpt: "🤖",
                      claude: "🧠",
                      midjourney: "🎨",
                      "dall-e": "🖼️",
                      canva: "✏️",
                    }
                    return toolIcons[value.toLowerCase()]
                  }
                  
                  const toolLogo = currentStepData.id === "tools-used" ? getToolLogo(option.value) : null
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(currentStepData.id, option.value, currentStepData.type)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-900 shadow-md"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <span className="text-white text-sm">✓</span>}
                        </div>
                        {toolLogo ? (
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-2xl">{toolLogo}</span>
                            <div className="font-medium text-lg">{option.label}</div>
                          </div>
                        ) : (
                          <div className="font-medium text-lg">{option.label}</div>
                        )}
                      </div>
                    </button>
                  )
                })}
                {/* Next button for multiple choice */}
                <Button
                  onClick={handleNext}
                  disabled={!answers[currentStepData.id] || (answers[currentStepData.id] as string[]).length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-xl font-medium mt-4"
                  size="lg"
                >
                  Continuar
                </Button>
              </>
            )}

            {currentStepData.type === "text" && (
              <div className="space-y-4">
                <Input
                  type={currentStepData.id === "email" ? "email" : "text"}
                  placeholder={currentStepData.placeholder || ""}
                  value={(answers[currentStepData.id] as string) || ""}
                  onChange={(e) => handleTextChange(currentStepData.id, e.target.value)}
                  className="w-full text-lg py-6 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-600"
                />
                <Button
                  onClick={handleNext}
                  disabled={!answers[currentStepData.id]}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-xl font-medium"
                  size="lg"
                >
                  Continuar
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
              variant="outline"
              className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 text-lg py-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              Atrás
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
