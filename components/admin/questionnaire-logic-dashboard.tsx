"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Play, Eye, Users, ToggleLeft, ToggleRight } from "lucide-react"
import DecisionTreeView from "./decision-tree-view"
import NodeInspector from "./node-inspector"
import SimulateUserModal from "./simulate-user-modal"
import { buildDecisionGraph, calculatePath, type DecisionGraph, type QuizStep } from "@/lib/decision-graph-builder"

interface QuestionnaireLogicDashboardProps {
  quizResponses: any[]
  plans: any[]
}

// Quiz structure - matches app/quiz/page.tsx
const QUIZ_STEPS: QuizStep[] = [
  // SECTION 1
  {
    id: "main-goal",
    section: "Contexto",
    question: "¿Cuál es tu principal objetivo con la inteligencia artificial?",
    description: "Elige la opción que mejor describa tu motivación principal",
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
    type: "single",
    options: [
      { value: "muy-serio", label: "Muy serio, estoy listo para empezar ahora" },
      { value: "serio", label: "Serio, pero necesito ver el plan primero" },
      { value: "explorando", label: "Estoy explorando opciones" },
      { value: "solo-curioso", label: "Solo tengo curiosidad por ahora" },
    ],
  },
  // SECTION 2
  {
    id: "technical-level",
    section: "Habilidades",
    question: "¿Cómo describirías tu nivel técnico general?",
    type: "single",
    options: [
      { value: "principiante", label: "Principiante, necesito guía paso a paso" },
      { value: "basico", label: "Básico, me defiendo con tecnología común" },
      { value: "intermedio", label: "Intermedio, aprendo rápido nuevas herramientas" },
      { value: "avanzado", label: "Avanzado, me siento cómodo con tecnología compleja" },
    ],
  },
  {
    id: "time-available",
    section: "Habilidades",
    question: "¿Cuántas horas por semana puedes dedicar a aprender y ejecutar?",
    type: "single",
    options: [
      { value: "menos-2h", label: "Menos de 2 horas" },
      { value: "2-4h", label: "2-4 horas" },
      { value: "5-10h", label: "5-10 horas" },
      { value: "10-20h", label: "10-20 horas" },
      { value: "20h+", label: "Más de 20 horas" },
    ],
  },
  // SECTION 3 - Decisive questions
  {
    id: "interest-services",
    section: "Intereses",
    question: "¿Te interesa ofrecer servicios de IA a negocios locales?",
    description: "Por ejemplo: automatizar marketing, crear contenido, optimizar procesos",
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
    type: "single",
    options: [
      { value: "muy-interesado", label: "Muy interesado" },
      { value: "interesado", label: "Interesado" },
      { value: "poco-interesado", label: "Poco interesado" },
      { value: "no-interesado", label: "No me interesa" },
    ],
  },
]

export default function QuestionnaireLogicDashboard({
  quizResponses,
  plans,
}: QuestionnaireLogicDashboardProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [showSimulator, setShowSimulator] = useState(false)
  const [viewMode, setViewMode] = useState<"logic" | "users">("logic")
  const [simulationPath, setSimulationPath] = useState<string[]>([])

  // Build decision graph
  const graph = useMemo(() => {
    return buildDecisionGraph(QUIZ_STEPS, viewMode === "users" ? quizResponses : undefined)
  }, [QUIZ_STEPS, quizResponses, viewMode])

  // Get selected node
  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId) || null

  // Handle simulation result
  const handleSimulationResult = (answers: Record<string, string>) => {
    const path = calculatePath(answers)
    
    // Build simulation path (simplified - trace through key questions)
    const pathNodes: string[] = ["start"]
    
    // Add decisive questions that were answered
    if (answers["experience-level"]) pathNodes.push(`q-experience-level`)
    if (answers["time-available"]) pathNodes.push(`q-time-available`)
    if (answers["interest-services"]) pathNodes.push(`q-interest-services`)
    if (answers["interest-content"]) pathNodes.push(`q-interest-content`)
    if (answers["interest-freelance"]) pathNodes.push(`q-interest-freelance`)
    
    // Add final path
    pathNodes.push(`path-${path}`)
    
    setSimulationPath(pathNodes)
    setSelectedNodeId(`path-${path}`)
  }

  const handleEditToggle = () => {
    if (editMode) {
      const confirmed = window.confirm(
        "¿Estás seguro? Los cambios en la lógica pueden afectar las recomendaciones futuras."
      )
      if (!confirmed) return
    }
    setEditMode(!editMode)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mapa de Decisión del Cuestionario
              </h1>
              <p className="text-gray-600">
                Visualiza el flujo completo desde las preguntas hasta los caminos finales
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowSimulator(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4" />
                Simular Usuario
              </Button>
              <Button
                onClick={handleEditToggle}
                variant={editMode ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                {editMode ? "Modo Lectura" : "Editar Lógica"}
              </Button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Vista:</span>
              <Button
                variant={viewMode === "logic" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("logic")}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Lógica
              </Button>
              <Button
                variant={viewMode === "users" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("users")}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Usuarios Reales
              </Button>
            </div>
            <Badge variant="secondary" className="text-xs">
              {quizResponses.length} cuestionarios completados
            </Badge>
            {simulationPath.length > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-50">
                Simulación activa
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content: Tree View + Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 h-[calc(100vh-250px)]">
          {/* Left: Decision Tree Canvas */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <DecisionTreeView
              graph={graph}
              selectedNodeId={selectedNodeId}
              onNodeSelect={setSelectedNodeId}
              simulationPath={simulationPath}
              viewMode={viewMode}
            />
          </div>

          {/* Right: Node Inspector */}
          <div className="h-full">
            <NodeInspector
              node={selectedNode}
              graph={graph}
              viewMode={viewMode}
              simulationPath={simulationPath}
            />
          </div>
        </div>
      </div>

      {/* Simulate User Modal */}
      {showSimulator && (
        <SimulateUserModal
          isOpen={showSimulator}
          onClose={() => {
            setShowSimulator(false)
            setSimulationPath([])
          }}
          onPathSelected={(path) => {
            // This will be handled by the simulation result
          }}
          onSimulationComplete={handleSimulationResult}
        />
      )}
    </div>
  )
}
