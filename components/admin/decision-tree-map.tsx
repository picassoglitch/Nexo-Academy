"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Target, Zap, Rocket, Network } from "lucide-react"
import { cn } from "@/lib/utils"

interface DecisionTreeMapProps {
  selectedNode: string | null
  onNodeSelect: (nodeId: string) => void
  editMode: boolean
}

// Simplified decision tree structure
const DECISION_NODES = [
  {
    id: "start",
    label: "Inicio del Cuestionario",
    type: "entry",
    color: "blue",
    description: "Usuario comienza el cuestionario",
  },
  {
    id: "context",
    label: "Contexto e Intención",
    type: "group",
    color: "blue",
    description: "6 preguntas sobre objetivos y motivación",
    questions: ["Objetivo principal", "Horizonte temporal", "Experiencia", "Tipo de ingresos", "Seriedad"],
  },
  {
    id: "skills",
    label: "Habilidades y Recursos",
    type: "group",
    color: "green",
    description: "6 preguntas sobre capacidades",
    questions: ["Nivel técnico", "Herramientas usadas", "Tiempo disponible", "Recursos"],
  },
  {
    id: "interests",
    label: "Intereses y Caminos",
    type: "group",
    color: "purple",
    description: "7 preguntas sobre preferencias",
    questions: ["Servicios", "Contenido", "Productos", "Freelance", "SaaS"],
  },
  {
    id: "barriers",
    label: "Barreras y Motivación",
    type: "group",
    color: "orange",
    description: "5 preguntas sobre obstáculos",
    questions: ["Mayor miedo", "Qué los detuvo", "Estilo de aprendizaje"],
  },
  {
    id: "commitment",
    label: "Compromiso",
    type: "group",
    color: "green",
    description: "5 preguntas finales",
    questions: ["Disposición a invertir", "Estilo de pago", "Preparación"],
  },
  {
    id: "starter",
    label: "Camino Starter",
    type: "outcome",
    color: "blue",
    description: "Ideal para empezar",
    path: "STARTER",
    icon: Rocket,
  },
  {
    id: "creator",
    label: "Camino Creator",
    type: "outcome",
    color: "purple",
    description: "Contenido y productos digitales",
    path: "CREATOR",
    icon: Target,
  },
  {
    id: "freelancer",
    label: "Camino Freelancer",
    type: "outcome",
    color: "green",
    description: "Servicios y consultoría",
    path: "FREELANCER",
    icon: Users,
  },
  {
    id: "scaler",
    label: "Camino Scaler",
    type: "outcome",
    color: "orange",
    description: "Para quienes ya operan",
    path: "SCALER",
    icon: Zap,
  },
]

const CONNECTIONS = [
  { from: "start", to: "context" },
  { from: "context", to: "skills" },
  { from: "skills", to: "interests" },
  { from: "interests", to: "barriers" },
  { from: "barriers", to: "commitment" },
  { from: "commitment", to: "starter" },
  { from: "commitment", to: "creator" },
  { from: "commitment", to: "freelancer" },
  { from: "commitment", to: "scaler" },
]

const COLOR_MAP = {
  blue: "bg-blue-50 border-blue-200 text-blue-900",
  green: "bg-green-50 border-green-200 text-green-900",
  orange: "bg-orange-50 border-orange-200 text-orange-900",
  purple: "bg-purple-50 border-purple-200 text-purple-900",
}

const COLOR_HOVER = {
  blue: "hover:bg-blue-100 hover:border-blue-300",
  green: "hover:bg-green-100 hover:border-green-300",
  orange: "hover:bg-orange-100 hover:border-orange-300",
  purple: "hover:bg-purple-100 hover:border-purple-300",
}

export default function DecisionTreeMap({
  selectedNode,
  onNodeSelect,
  editMode,
}: DecisionTreeMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const getNode = (id: string) => DECISION_NODES.find((n) => n.id === id)

  return (
    <div className="relative w-full min-h-[600px] bg-gray-50 rounded-lg p-8">
      {/* Nodes Layout */}
      <div className="space-y-8">
        {/* Entry Point */}
        <div className="flex justify-center">
          <NodeCard
            node={getNode("start")!}
            isSelected={selectedNode === "start"}
            isHovered={hoveredNode === "start"}
            onSelect={() => onNodeSelect("start")}
            onHover={setHoveredNode}
          />
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <ArrowRight className="h-6 w-6 text-gray-400 rotate-90" />
        </div>

        {/* Question Groups Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {["context", "skills", "interests", "barriers", "commitment"].map((nodeId) => {
            const node = getNode(nodeId)
            if (!node) return null
            return (
              <NodeCard
                key={nodeId}
                node={node}
                isSelected={selectedNode === nodeId}
                isHovered={hoveredNode === nodeId}
                onSelect={() => onNodeSelect(nodeId)}
                onHover={setHoveredNode}
              />
            )
          })}
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <ArrowRight className="h-6 w-6 text-gray-400 rotate-90" />
        </div>

        {/* Outcome Paths Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["starter", "creator", "freelancer", "scaler"].map((nodeId) => {
            const node = getNode(nodeId)
            if (!node) return null
            return (
              <NodeCard
                key={nodeId}
                node={node}
                isSelected={selectedNode === nodeId}
                isHovered={hoveredNode === nodeId}
                onSelect={() => onNodeSelect(nodeId)}
                onHover={setHoveredNode}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface NodeCardProps {
  node: typeof DECISION_NODES[0]
  isSelected: boolean
  isHovered: boolean
  onSelect: () => void
  onHover: (id: string | null) => void
}

function NodeCard({ node, isSelected, isHovered, onSelect, onHover }: NodeCardProps) {
  const Icon = node.icon || Target

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 border-2",
        COLOR_MAP[node.color as keyof typeof COLOR_MAP],
        COLOR_HOVER[node.color as keyof typeof COLOR_HOVER],
        isSelected && "ring-4 ring-blue-400 ring-offset-2",
        isHovered && "scale-105 shadow-lg"
      )}
      onClick={onSelect}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-2">
          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">{node.label}</h3>
            <p className="text-xs opacity-75 line-clamp-2">{node.description}</p>
          </div>
        </div>

        {node.type === "group" && node.questions && (
          <div className="mt-2 pt-2 border-t border-current/20">
            <p className="text-xs font-medium mb-1">Preguntas clave:</p>
            <div className="flex flex-wrap gap-1">
              {node.questions.slice(0, 3).map((q, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {q}
                </Badge>
              ))}
              {node.questions.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{node.questions.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {node.type === "outcome" && (
          <div className="mt-2 pt-2 border-t border-current/20">
            <Badge variant="outline" className="text-xs">
              {node.path}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  )
}

