"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, ArrowRight, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimplifiedDecisionMapProps {
  selectedPath: string | null
  onPathSelect: (pathId: string) => void
}

// Stages that influence the final decision
const DECISION_STAGES = [
  {
    id: "context",
    label: "Contexto e Intención",
    isDecisive: false,
    description: "6 preguntas sobre objetivos y motivación",
    questions: ["Objetivo principal", "Horizonte temporal", "Experiencia", "Tipo de ingresos", "Seriedad"],
  },
  {
    id: "skills",
    label: "Habilidades y Recursos",
    isDecisive: true,
    description: "6 preguntas sobre capacidades",
    questions: ["Nivel técnico", "Herramientas usadas", "Tiempo disponible", "Recursos"],
  },
  {
    id: "interests",
    label: "Intereses y Caminos",
    isDecisive: true,
    description: "7 preguntas sobre preferencias",
    questions: ["Servicios", "Contenido", "Productos", "Freelance", "SaaS"],
  },
  {
    id: "barriers",
    label: "Barreras y Motivación",
    isDecisive: false,
    description: "5 preguntas sobre obstáculos",
    questions: ["Mayor miedo", "Qué los detuvo", "Estilo de aprendizaje"],
  },
  {
    id: "commitment",
    label: "Compromiso",
    isDecisive: false,
    description: "5 preguntas finales",
    questions: ["Disposición a invertir", "Estilo de pago", "Preparación"],
  },
]

const OUTCOME_PATHS = [
  { id: "starter", label: "Starter", color: "blue", icon: "🚀" },
  { id: "creator", label: "Creator", color: "purple", icon: "✨" },
  { id: "freelancer", label: "Freelancer", color: "green", icon: "💼" },
  { id: "scaler", label: "Scaler", color: "orange", icon: "⚡" },
]

export default function SimplifiedDecisionMap({
  selectedPath,
  onPathSelect,
}: SimplifiedDecisionMapProps) {
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())

  const toggleStage = (stageId: string) => {
    const newExpanded = new Set(expandedStages)
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId)
    } else {
      newExpanded.add(stageId)
    }
    setExpandedStages(newExpanded)
  }

  return (
    <div className="space-y-6">
      {/* Entry Point */}
      <div className="flex justify-center">
        <Card className="px-6 py-3 bg-blue-50 border-blue-200">
          <div className="text-center">
            <p className="text-sm font-medium text-blue-900">Inicio del Cuestionario</p>
          </div>
        </Card>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <ArrowRight className="h-5 w-5 text-gray-400 rotate-90" />
      </div>

      {/* Stages */}
      <div className="space-y-3">
        {DECISION_STAGES.map((stage) => {
          const isExpanded = expandedStages.has(stage.id)
          const isDecisive = stage.isDecisive

          return (
            <Card
              key={stage.id}
              className={cn(
                "cursor-pointer transition-all",
                isDecisive
                  ? "border-2 border-red-300 bg-red-50"
                  : "border border-gray-200 bg-white"
              )}
              onClick={() => toggleStage(stage.id)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-gray-900">{stage.label}</h3>
                        {isDecisive && (
                          <Badge variant="destructive" className="text-xs">
                            Define camino
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{stage.description}</p>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Preguntas incluidas:</p>
                    <div className="flex flex-wrap gap-2">
                      {stage.questions.map((q, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {q}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <ArrowRight className="h-5 w-5 text-gray-400 rotate-90" />
      </div>

      {/* Outcome Paths */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {OUTCOME_PATHS.map((path) => {
          const isSelected = selectedPath === path.id
          const colorClasses = {
            blue: "bg-blue-50 border-blue-200 text-blue-900",
            purple: "bg-purple-50 border-purple-200 text-purple-900",
            green: "bg-green-50 border-green-200 text-green-900",
            orange: "bg-orange-50 border-orange-200 text-orange-900",
          }

          return (
            <Card
              key={path.id}
              className={cn(
                "cursor-pointer transition-all border-2",
                colorClasses[path.color as keyof typeof colorClasses],
                isSelected && "ring-4 ring-blue-400 ring-offset-2 shadow-lg"
              )}
              onClick={() => onPathSelect(path.id)}
            >
              <div className="p-4 text-center">
                <div className="text-3xl mb-2">{path.icon}</div>
                <h3 className="font-bold text-sm">{path.label}</h3>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Microcopy */}
      <div className="text-center pt-4">
        <p className="text-xs text-gray-500 italic">
          Solo algunas etapas definen el camino final. Otras solo ajustan la recomendación.
        </p>
      </div>
    </div>
  )
}



