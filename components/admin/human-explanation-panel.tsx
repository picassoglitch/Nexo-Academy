"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, CheckCircle2, Gift, ArrowRight } from "lucide-react"

interface HumanExplanationPanelProps {
  selectedPath: string | null
  quizResponses: any[]
}

const PATH_DETAILS: Record<string, {
  keyAnswers: string[]
  whatTheyGet: string[]
  suggestedAction: string
}> = {
  starter: {
    keyAnswers: [
      "Experiencia: Ninguna o básica",
      "Objetivo: Ingresos extra",
      "Tiempo: 5-10 horas/semana",
      "Intereses: Explorando opciones",
      "Nivel técnico: Principiante"
    ],
    whatTheyGet: [
      "1 camino completo de ingresos (su elección)",
      "Plantillas core descargables",
      "Scripts de WhatsApp básicos",
      "Acceso a comunidad privada",
      "Soporte por email"
    ],
    suggestedAction: "Mostrar plan Starter con enfoque en onboarding y guías paso a paso"
  },
  creator: {
    keyAnswers: [
      "Interés: Muy interesado en contenido",
      "Interés: Muy interesado en productos digitales",
      "Experiencia: Intermedia",
      "Objetivo: Monetizar creatividad",
      "Preferencias: Templates y recursos"
    ],
    whatTheyGet: [
      "Todos los caminos de contenido y productos digitales",
      "Pipeline completo de 12 reels",
      "Plantillas avanzadas de contenido",
      "Bases de datos de afiliados México",
      "Acceso a comunidad PRO",
      "Soporte prioritario"
    ],
    suggestedAction: "Mostrar plan Creator con templates, calendario de contenido y comunidad"
  },
  freelancer: {
    keyAnswers: [
      "Interés: Muy interesado en servicios",
      "Interés: Muy interesado en consultoría",
      "Experiencia: Intermedia-Avanzada",
      "Tipo: Trabajo con clientes",
      "Tiempo: 10+ horas/semana"
    ],
    whatTheyGet: [
      "Caminos de servicios locales y consultoría",
      "Scripts completos de WhatsApp",
      "Flujos de automatización IG DMs",
      "CRM de prospectos (CSV + Notion)",
      "Discovery call scripts",
      "Acceso a comunidad PRO"
    ],
    suggestedAction: "Mostrar plan Freelancer con scripts, CRM y herramientas de ventas"
  },
  scaler: {
    keyAnswers: [
      "Experiencia: Avanzada con IA",
      "Tiempo: 20+ horas/semana",
      "Objetivo: Ingresos principales",
      "Tipo: Sistemas automatizados",
      "Recursos: Presupuesto disponible"
    ],
    whatTheyGet: [
      "Todos los caminos (incluyendo SaaS)",
      "Workflows done-for-you",
      "Auditorías personalizadas de negocio",
      "Case studies reales y detallados",
      "Sesiones en vivo mensuales",
      "Acceso a comunidad OPERATOR",
      "Soporte VIP prioritario"
    ],
    suggestedAction: "Mostrar plan Scaler con workflows completos y mentoría"
  },
}

export default function HumanExplanationPanel({
  selectedPath,
  quizResponses,
}: HumanExplanationPanelProps) {
  const pathDetails = useMemo(() => {
    if (!selectedPath) return null
    
    let pathName = ""
    if (selectedPath.includes("starter")) pathName = "starter"
    else if (selectedPath.includes("creator")) pathName = "creator"
    else if (selectedPath.includes("freelancer")) pathName = "freelancer"
    else if (selectedPath.includes("scaler")) pathName = "scaler"
    else return null

    return PATH_DETAILS[pathName] || null
  }, [selectedPath])

  if (!pathDetails) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">
            Selecciona un camino para ver la explicación
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">
          ¿Por qué este usuario llegó aquí?
        </h3>
      </div>

      {/* Camino Final */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Camino Final Asignado</p>
              <h4 className="text-xl font-bold text-gray-900">
                {selectedPath?.replace("camino ", "").replace(/\b\w/g, l => l.toUpperCase()) || "N/A"}
              </h4>
            </div>
            <Badge className="text-lg px-4 py-2">
              {selectedPath?.toUpperCase().replace("CAMINO ", "") || ""}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Answers */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Qué respondió el usuario para llegar aquí
          </h4>
          <div className="space-y-2">
            {pathDetails.keyAnswers.map((answer, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">{answer}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What They Get */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Gift className="h-4 w-4 text-green-600" />
            Qué obtendrá el usuario
          </h4>
          <ul className="space-y-2">
            {pathDetails.whatTheyGet.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Suggested Action */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-blue-600" />
            Acción Sugerida
          </h4>
          <p className="text-sm text-gray-700">{pathDetails.suggestedAction}</p>
        </CardContent>
      </Card>
    </div>
  )
}



