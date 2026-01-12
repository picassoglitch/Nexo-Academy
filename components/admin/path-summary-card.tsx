"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Users, Clock, Target, TrendingUp, AlertCircle } from "lucide-react"

interface PathSummaryCardProps {
  nodeId: string
  quizResponses: any[]
  editMode: boolean
}

const NODE_PROFILES: Record<string, any> = {
  starter: {
    title: "Perfil Típico: Starter",
    description: "Usuarios que terminan en el camino Starter",
    characteristics: [
      "Principiante o nivel básico",
      "Buscando ingresos extra",
      "5-10 horas por semana",
      "Prefiere guías paso a paso",
    ],
    readiness: "Listo para empezar",
    suggestedAction: "Mostrar plan Starter con enfoque en onboarding",
  },
  creator: {
    title: "Perfil Típico: Creator",
    description: "Usuarios interesados en contenido y productos digitales",
    characteristics: [
      "Interesado en creación de contenido",
      "Quiere productos digitales",
      "Nivel intermedio de experiencia",
      "Tiene audiencia o quiere construirla",
    ],
    readiness: "Listo para crear",
    suggestedAction: "Mostrar plan Creator con templates y comunidad",
  },
  freelancer: {
    title: "Perfil Típico: Freelancer",
    description: "Usuarios que quieren ofrecer servicios",
    characteristics: [
      "Interesado en servicios locales",
      "Quiere trabajar con clientes",
      "Nivel intermedio-avanzado",
      "Tiene tiempo para dedicar",
    ],
    readiness: "Listo para clientes",
    suggestedAction: "Mostrar plan Freelancer con scripts y CRM",
  },
  scaler: {
    title: "Perfil Típico: Scaler",
    description: "Usuarios avanzados que buscan escalar",
    characteristics: [
      "Experiencia avanzada con IA",
      "Disposición a invertir $5,000+",
      "20+ horas por semana",
      "Quiere sistemas automatizados",
    ],
    readiness: "Listo para escalar",
    suggestedAction: "Mostrar plan Scaler con workflows done-for-you",
  },
}

export default function PathSummaryCard({
  nodeId,
  quizResponses,
  editMode,
}: PathSummaryCardProps) {
  const profile = useMemo(() => {
    // Extract node type from nodeId
    let nodeType = nodeId.toLowerCase()
    if (nodeType.includes("starter")) nodeType = "starter"
    else if (nodeType.includes("creator")) nodeType = "creator"
    else if (nodeType.includes("freelancer")) nodeType = "freelancer"
    else if (nodeType.includes("scaler")) nodeType = "scaler"
    
    return NODE_PROFILES[nodeType] || {
      title: "Información del Nodo",
      description: "Selecciona un nodo para ver detalles",
      characteristics: [],
      readiness: "N/A",
      suggestedAction: "N/A",
    }
  }, [nodeId])

  // Calculate stats for this path
  const pathStats = useMemo(() => {
    let pathName = ""
    if (nodeId.includes("starter")) pathName = "STARTER"
    else if (nodeId.includes("creator")) pathName = "CREATOR"
    else if (nodeId.includes("freelancer")) pathName = "FREELANCER"
    else if (nodeId.includes("scaler")) pathName = "SCALER"
    else return null
    const matchingResponses = quizResponses.filter((response) => {
      const answers = response.payload as any
      // Simplified matching logic
      const experience = answers["experience-level"]
      const timeAvailable = answers["time-available"]
      const interestServices = answers["interest-services"]
      const interestContent = answers["interest-content"]
      const incomeType = answers["income-type"]

      if (pathName === "STARTER") {
        return experience === "ninguna" || experience === "basica" || (!interestServices && !interestContent)
      }
      if (pathName === "SCALER") {
        return (experience === "avanzada" && timeAvailable === "20h+") || 
               (incomeType === "ingresos-principales" && experience === "avanzada")
      }
      if (pathName === "FREELANCER") {
        return interestServices === "muy-interesado" || interestServices === "interesado"
      }
      if (pathName === "CREATOR") {
        return interestContent === "muy-interesado" || interestContent === "interesado"
      }
      return false
    })

    return {
      count: matchingResponses.length,
      percentage: quizResponses.length > 0 ? (matchingResponses.length / quizResponses.length) * 100 : 0,
    }
  }, [nodeId, quizResponses])

  return (
    <div className="space-y-4">
      {/* Profile Summary */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="font-semibold text-lg mb-2">{profile.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{profile.description}</p>

        {pathStats && (
          <div className="flex items-center gap-4 mb-4 p-3 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{pathStats.count} usuarios</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">{pathStats.percentage.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Characteristics */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700 mb-2">Características típicas:</p>
          {profile.characteristics.map((char: string, idx: number) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
              <span className="text-gray-700">{char}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Answers */}
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Respuestas Clave que Llevan Aquí
        </h4>
        <div className="space-y-2">
          {nodeId === "starter" && (
            <>
              <Badge variant="outline">Inversión: Menos de $1,000</Badge>
              <Badge variant="outline">Experiencia: Principiante/Básica</Badge>
              <Badge variant="outline">Tiempo: 5-10 horas/semana</Badge>
            </>
          )}
          {nodeId === "creator" && (
            <>
              <Badge variant="outline">Interés: Contenido/Productos</Badge>
              <Badge variant="outline">Experiencia: Intermedia</Badge>
              <Badge variant="outline">Objetivo: Ingresos con contenido</Badge>
            </>
          )}
          {nodeId === "freelancer" && (
            <>
              <Badge variant="outline">Interés: Servicios/Consultoría</Badge>
              <Badge variant="outline">Experiencia: Intermedia-Avanzada</Badge>
              <Badge variant="outline">Tipo: Trabajo con clientes</Badge>
            </>
          )}
          {nodeId === "scaler" && (
            <>
              <Badge variant="outline">Inversión: $5,000+</Badge>
              <Badge variant="outline">Experiencia: Avanzada</Badge>
              <Badge variant="outline">Tiempo: 20+ horas/semana</Badge>
            </>
          )}
        </div>
      </Card>

      {/* Readiness & Action */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">Nivel de Preparación</h4>
            <p className="text-sm text-gray-700 mb-3">{profile.readiness}</p>
            <h4 className="font-semibold text-sm mb-1">Acción Sugerida</h4>
            <p className="text-sm text-gray-700">{profile.suggestedAction}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

