"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, AlertCircle, Info, CheckCircle2 } from "lucide-react"

interface DecisionSummaryProps {
  selectedPath: string | null
  quizResponses: any[]
}

// Decision logic explanation in human language
const PATH_EXPLANATIONS: Record<string, {
  title: string
  explanation: string
  decisiveFactors: string[]
  adjustmentFactors: string[]
  infoFactors: string[]
}> = {
  STARTER: {
    title: "Camino Starter",
    explanation: "Este usuario fue dirigido a STARTER porque tiene poca o ninguna experiencia con IA, busca ingresos extra, y necesita más apoyo para empezar.",
    decisiveFactors: [
      "Experiencia: Ninguna o básica",
      "Objetivo: Ingresos extra (no principales)",
      "Nivel técnico: Principiante"
    ],
    adjustmentFactors: [
      "Tiempo disponible: 5-10 horas/semana",
      "Intereses: Aún explorando opciones"
    ],
    infoFactors: [
      "Herramientas usadas: Ninguna o básicas",
      "Estilo de aprendizaje: Prefiere guías paso a paso"
    ],
  },
  CREATOR: {
    title: "Camino Creator",
    explanation: "Este usuario fue dirigido a CREATOR porque quiere generar ingresos con contenido o productos digitales, tiene experiencia intermedia, y busca monetizar su creatividad.",
    decisiveFactors: [
      "Interés: Muy interesado en contenido o productos digitales",
      "Experiencia: Intermedia con IA",
      "Objetivo: Ingresos con contenido/creatividad"
    ],
    adjustmentFactors: [
      "Tiempo disponible: 5-20 horas/semana",
      "Preferencias: Templates y recursos descargables"
    ],
    infoFactors: [
      "Tipo de negocio: Contenido o productos digitales",
      "Audiencia: Tiene o quiere construir audiencia"
    ],
  },
  FREELANCER: {
    title: "Camino Freelancer",
    explanation: "Este usuario fue dirigido a FREELANCER porque quiere ofrecer servicios de IA a negocios, tiene experiencia intermedia-avanzada, y busca trabajar con clientes directamente.",
    decisiveFactors: [
      "Interés: Muy interesado en servicios o consultoría",
      "Experiencia: Intermedia a avanzada",
      "Tipo de negocio: Trabajo con clientes"
    ],
    adjustmentFactors: [
      "Tiempo disponible: 10+ horas/semana",
      "Recursos: Tiene acceso a herramientas profesionales"
    ],
    infoFactors: [
      "Objetivo: Servicios locales o consultoría",
      "Preferencias: Scripts y automatizaciones"
    ],
  },
  SCALER: {
    title: "Camino Scaler",
    explanation: "Este usuario fue dirigido a SCALER porque tiene experiencia avanzada con IA, busca ingresos principales, tiene mucho tiempo disponible, y quiere sistemas automatizados y escalables.",
    decisiveFactors: [
      "Experiencia: Avanzada con IA",
      "Tiempo disponible: 20+ horas/semana",
      "Objetivo: Ingresos principales (no solo extra)"
    ],
    adjustmentFactors: [
      "Interés: Todos los caminos o SaaS",
      "Recursos: Presupuesto para herramientas premium"
    ],
    infoFactors: [
      "Tipo de negocio: Automatizado y escalable",
      "Preferencias: Workflows done-for-you"
    ],
  },
}

export default function DecisionSummary({ selectedPath, quizResponses }: DecisionSummaryProps) {
  const pathData = useMemo(() => {
    if (!selectedPath) return null
    
    let pathName = ""
    if (selectedPath.includes("starter")) pathName = "STARTER"
    else if (selectedPath.includes("creator")) pathName = "CREATOR"
    else if (selectedPath.includes("freelancer")) pathName = "FREELANCER"
    else if (selectedPath.includes("scaler")) pathName = "SCALER"
    else return null

    return PATH_EXPLANATIONS[pathName] || null
  }, [selectedPath])

  if (!pathData) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
        <CardContent className="p-8 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            Selecciona un camino en el mapa para ver el resumen de decisión
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-lg">
      <CardContent className="p-6">
        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{pathData.title}</h2>
            <p className="text-sm text-gray-600">Resumen de Decisión</p>
          </div>
        </div>

        {/* Explanation in natural language */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-blue-100">
          <p className="text-base text-gray-800 leading-relaxed">
            {pathData.explanation}
          </p>
        </div>

        {/* Decisive Factors */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-sm text-gray-900">
              Factores Decisivos (definen el camino)
            </h3>
          </div>
          <div className="space-y-2">
            {pathData.decisiveFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-red-50 rounded border border-red-200">
                <div className="w-2 h-2 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-800">{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Adjustment Factors */}
        {pathData.adjustmentFactors.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-sm text-gray-900">
                Factores que Ajustan la Oferta
              </h3>
            </div>
            <div className="space-y-2">
              {pathData.adjustmentFactors.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <div className="w-2 h-2 rounded-full bg-yellow-600 mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-800">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Factors */}
        {pathData.infoFactors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-sm text-gray-700">
                Factores Informativos
              </h3>
            </div>
            <div className="space-y-2">
              {pathData.infoFactors.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



