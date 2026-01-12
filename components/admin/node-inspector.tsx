"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Info, Target, Users, ArrowRight } from "lucide-react"
import type { DecisionNode, DecisionEdge, DecisionGraph } from "@/lib/decision-graph-builder"

interface NodeInspectorProps {
  node: DecisionNode | null
  graph: DecisionGraph
  viewMode?: "logic" | "users"
  simulationPath?: string[]
}

export default function NodeInspector({
  node,
  graph,
  viewMode = "logic",
  simulationPath = [],
}: NodeInspectorProps) {
  if (!node) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex items-center justify-center flex-1 min-h-[400px] text-gray-400">
          <div className="text-center">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm font-medium">Haz clic en un nodo para ver detalles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get edges connected to this node
  const incomingEdges = graph.edges.filter((e) => e.to === node.id)
  const outgoingEdges = graph.edges.filter((e) => e.from === node.id)

  // Get node type info
  const getNodeTypeInfo = () => {
    switch (node.type) {
      case "start":
        return { icon: Target, color: "blue", label: "Nodo Inicial", badgeColor: "bg-blue-100 text-blue-700 border-blue-200" }
      case "question":
        return { icon: Info, color: "gray", label: "Pregunta", badgeColor: "bg-gray-100 text-gray-700 border-gray-200" }
      case "decisive":
        return { icon: AlertCircle, color: "red", label: "Decisiva", badgeColor: "bg-red-50 text-red-700 border-red-200" }
      case "adjuster":
        return { icon: CheckCircle2, color: "amber", label: "Ajusta", badgeColor: "bg-amber-50 text-amber-700 border-amber-200" }
      case "path":
        return { icon: Target, color: "green", label: "Camino Final", badgeColor: "bg-green-50 text-green-700 border-green-200" }
      default:
        return { icon: Info, color: "gray", label: "Nodo", badgeColor: "bg-gray-100 text-gray-700 border-gray-200" }
    }
  }

  const typeInfo = getNodeTypeInfo()
  const Icon = typeInfo.icon
  const isInSimulation = simulationPath.includes(node.id)

  // Calculate user statistics
  const userStats = viewMode === "users" ? calculateUserStats(node, graph) : null

  // Get paths this node opens/closes
  const getPathImpact = () => {
    if (node.type !== "decisive" && node.type !== "adjuster") return null

    const pathsOpened: string[] = []

    outgoingEdges.forEach((edge) => {
      const destNode = graph.nodes.find((n) => n.id === edge.to)
      if (destNode?.type === "path") {
        pathsOpened.push(destNode.label)
      }
    })

    // For decisive questions, determine which paths are NOT accessible
    const allPaths = graph.nodes.filter((n) => n.type === "path").map((n) => n.label)
    const pathsClosed = allPaths.filter((p) => !pathsOpened.includes(p))

    return { pathsOpened, pathsClosed }
  }

  const pathImpact = getPathImpact()

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-4 border-b border-gray-200">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${typeInfo.badgeColor} border`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-2 leading-tight">{node.label}</CardTitle>
            <Badge variant="outline" className={`text-xs font-medium ${typeInfo.badgeColor} border`}>
              {typeInfo.label}
            </Badge>
          </div>
        </div>
        {isInSimulation && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-medium text-blue-700">Ruta destacada (simulación activa)</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-5 pt-5">
        {/* Question details */}
        {node.meta?.question && (
          <div>
            <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">
              Pregunta Completa
            </h4>
            <p className="text-sm text-gray-900 leading-relaxed">{node.meta.question}</p>
            {node.meta.description && (
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">{node.meta.description}</p>
            )}
          </div>
        )}

        {/* Section */}
        {node.section && (
          <div>
            <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">
              Sección
            </h4>
            <Badge variant="outline" className="text-xs font-medium">
              {node.section}
            </Badge>
          </div>
        )}

        {/* Options (for questions) */}
        {node.meta?.options && node.meta.options.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3">
              Opciones de Respuesta
            </h4>
            <div className="space-y-2">
              {node.meta.options.map((option, index) => {
                const edge = outgoingEdges.find((e) => e.answerValue === option.value)
                const destinationNode = edge ? graph.nodes.find((n) => n.id === edge.to) : null

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-900 flex-1 pr-3">{option.label}</span>
                    {destinationNode ? (
                      <Badge
                        variant="outline"
                        className="text-xs font-medium bg-white border-gray-300"
                      >
                        {destinationNode.type === "path" ? (
                          <span className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" />
                            {destinationNode.label}
                          </span>
                        ) : (
                          "Siguiente"
                        )}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Impact section */}
        {pathImpact && (pathImpact.pathsOpened.length > 0 || pathImpact.pathsClosed.length > 0) && (
          <div>
            <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3">
              Impacto
            </h4>
            <div className="space-y-3">
              {pathImpact.pathsOpened.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Abre caminos:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pathImpact.pathsOpened.map((path, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        {path}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {pathImpact.pathsClosed.length > 0 && node.type === "decisive" && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Cierra caminos:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pathImpact.pathsClosed.map((path, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-gray-100 text-gray-500 border-gray-300"
                      >
                        {path}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final path details */}
        {node.type === "path" && (
          <div>
            <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3">
              Criterios para este Camino
            </h4>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Los usuarios llegan aquí cuando cumplen estas condiciones:
            </p>
            <div className="space-y-2">
              {incomingEdges
                .filter((e) => e.isDecisive)
                .map((edge, index) => {
                  const sourceNode = graph.nodes.find((n) => n.id === edge.from)
                  return (
                    <div
                      key={index}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="text-xs font-semibold text-red-900 mb-1">
                        {sourceNode?.label || edge.from}
                      </div>
                      <div className="text-xs text-red-700">{edge.answerLabel}</div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* User statistics */}
        {viewMode === "users" && userStats && (
          <div>
            <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Estadísticas de Usuarios
            </h4>
            <div className="space-y-3">
              {userStats.totalUsers > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Usuarios que pasaron por aquí</div>
                  <div className="text-2xl font-bold text-blue-700">{userStats.totalUsers}</div>
                </div>
              )}
              {node.type === "path" && userStats.distribution && (
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">Distribución</div>
                  <div className="space-y-1.5">
                    {Object.entries(userStats.distribution).map(([path, count]) => (
                      <div
                        key={path}
                        className="flex justify-between items-center text-sm py-1.5 px-2 bg-gray-50 rounded"
                      >
                        <span className="text-gray-700">{path}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Incoming connections */}
        {incomingEdges.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3">
              Viene de
            </h4>
            <div className="space-y-2">
              {incomingEdges.map((edge, index) => {
                const sourceNode = graph.nodes.find((n) => n.id === edge.from)
                return (
                  <div
                    key={index}
                    className="text-sm text-gray-700 p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <span className="font-medium">{sourceNode?.label || edge.from}</span>
                    {edge.answerLabel && edge.answerLabel !== "→" && (
                      <>
                        {" "}
                        <span className="text-gray-500">→</span>{" "}
                        <span className="text-gray-600">"{edge.answerLabel}"</span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Outgoing connections */}
        {outgoingEdges.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-3">
              Va a
            </h4>
            <div className="space-y-2">
              {outgoingEdges.map((edge, index) => {
                const destNode = graph.nodes.find((n) => n.id === edge.to)
                return (
                  <div
                    key={index}
                    className="text-sm text-gray-700 p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <span className="font-medium">{destNode?.label || edge.to}</span>
                    {edge.answerLabel && edge.answerLabel !== "→" && (
                      <>
                        {" "}
                        <span className="text-gray-500">→</span>{" "}
                        <span className="text-gray-600">"{edge.answerLabel}"</span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper to calculate user statistics
function calculateUserStats(node: DecisionNode, graph: DecisionGraph) {
  const incomingEdges = graph.edges.filter((e) => e.to === node.id)
  const totalUsers = incomingEdges.reduce((sum, e) => sum + (e.userCount || 0), 0)

  let distribution: Record<string, number> | null = null
  if (node.type === "path") {
    distribution = { [node.label]: totalUsers }
  }

  return {
    totalUsers,
    distribution,
  }
}
