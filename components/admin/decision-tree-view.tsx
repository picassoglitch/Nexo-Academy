"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { DecisionGraph, DecisionNode, DecisionEdge } from "@/lib/decision-graph-builder"

interface DecisionTreeViewProps {
  graph: DecisionGraph
  selectedNodeId: string | null
  onNodeSelect: (nodeId: string | null) => void
  simulationPath?: string[]
  viewMode?: "logic" | "users"
}

// Improved tree layout with proper spacing
function calculateLayout(nodes: DecisionNode[], edges: DecisionEdge[]) {
  const nodePositions: Record<string, { x: number; y: number; width: number; height: number }> = {}
  const nodeLevels: Record<string, number> = {}
  const nodeChildren: Record<string, string[]> = {}

  // Calculate levels (distance from start)
  const startNode = nodes.find((n) => n.id === "start")
  if (!startNode) return nodePositions

  // BFS to assign levels
  const queue: Array<{ id: string; level: number }> = [{ id: "start", level: 0 }]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const { id, level } = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    nodeLevels[id] = level

    const children = edges.filter((e) => e.from === id).map((e) => e.to)
    nodeChildren[id] = children

    children.forEach((childId) => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, level: level + 1 })
      }
    })
  }

  // Group nodes by level
  const nodesByLevel: Record<number, DecisionNode[]> = {}
  Object.entries(nodeLevels).forEach(([nodeId, level]) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (node) {
      if (!nodesByLevel[level]) nodesByLevel[level] = []
      nodesByLevel[level].push(node)
    }
  })

  // Calculate positions with improved spacing
  const levelSpacing = 220 // Increased from 180
  const nodeSpacing = 200 // Increased from 180
  const startY = 100
  const centerX = 0

  // Sort levels
  const sortedLevels = Object.keys(nodesByLevel)
    .map(Number)
    .sort((a, b) => a - b)

  sortedLevels.forEach((level) => {
    const levelNodes = nodesByLevel[level]
    const y = startY + level * levelSpacing

    // Extra spacing for final path nodes
    const isPathLevel = levelNodes.some((n) => n.type === "path")
    const extraSpacing = isPathLevel ? 80 : 0

    if (levelNodes.length === 1) {
      const node = levelNodes[0]
      const width = node.type === "path" ? 200 : 150
      const height = node.type === "path" ? 80 : 65
      nodePositions[node.id] = { x: centerX, y: y + extraSpacing, width, height }
    } else {
      const totalWidth = (levelNodes.length - 1) * nodeSpacing
      const startX = centerX - totalWidth / 2

      levelNodes.forEach((node, index) => {
        const width = node.type === "path" ? 200 : 150
        const height = node.type === "path" ? 80 : 65
        nodePositions[node.id] = {
          x: startX + index * nodeSpacing,
          y: y + extraSpacing,
          width,
          height,
        }
      })
    }
  })

  return nodePositions
}

export default function DecisionTreeView({
  graph,
  selectedNodeId,
  onNodeSelect,
  simulationPath = [],
  viewMode = "logic",
}: DecisionTreeViewProps) {
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate layout - memoize to prevent infinite loops
  const nodePositions = useMemo(() => {
    return calculateLayout(graph.nodes, graph.edges)
  }, [graph.nodes, graph.edges])

  // Calculate initial viewBox from node positions
  useEffect(() => {
    const positions = Object.values(nodePositions)
    if (positions.length > 0) {
      const bounds = positions.reduce(
        (acc, pos) => ({
          minX: Math.min(acc.minX, pos.x - pos.width / 2 - 50),
          maxX: Math.max(acc.maxX, pos.x + pos.width / 2 + 50),
          minY: Math.min(acc.minY, pos.y - pos.height / 2 - 50),
          maxY: Math.max(acc.maxY, pos.y + pos.height / 2 + 50),
        }),
        {
          minX: positions[0]?.x || 0,
          maxX: positions[0]?.x || 0,
          minY: positions[0]?.y || 0,
          maxY: positions[0]?.y || 0,
        }
      )

      const width = Math.max(1400, bounds.maxX - bounds.minX + 400)
      const height = Math.max(1000, bounds.maxY - bounds.minY + 400)
      setViewBox((current) => {
        const threshold = 50
        if (
          Math.abs(current.x - (bounds.minX - 200)) > threshold ||
          Math.abs(current.y - (bounds.minY - 100)) > threshold ||
          Math.abs(current.width - width) > threshold ||
          Math.abs(current.height - height) > threshold
        ) {
          return {
            x: bounds.minX - 200,
            y: bounds.minY - 100,
            width,
            height,
          }
        }
        return current
      })
    }
  }, [graph.nodes.length, graph.edges.length])

  // Handle zoom
  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.15, 2))
    setViewBox((vb) => ({
      ...vb,
      width: vb.width * 0.85,
      height: vb.height * 0.85,
      x: vb.x + vb.width * 0.075,
      y: vb.y + vb.height * 0.075,
    }))
  }

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.15, 0.4))
    setViewBox((vb) => ({
      ...vb,
      width: vb.width * 1.18,
      height: vb.height * 1.18,
      x: vb.x - vb.width * 0.09,
      y: vb.y - vb.height * 0.09,
    }))
  }

  const handleFitView = () => {
    const positions = Object.values(nodePositions)
    if (positions.length > 0) {
      const bounds = positions.reduce(
        (acc, pos) => ({
          minX: Math.min(acc.minX, pos.x - pos.width / 2 - 50),
          maxX: Math.max(acc.maxX, pos.x + pos.width / 2 + 50),
          minY: Math.min(acc.minY, pos.y - pos.height / 2 - 50),
          maxY: Math.max(acc.maxY, pos.y + pos.height / 2 + 50),
        }),
        {
          minX: positions[0]?.x || 0,
          maxX: positions[0]?.x || 0,
          minY: positions[0]?.y || 0,
          maxY: positions[0]?.y || 0,
        }
      )

      const width = Math.max(1400, bounds.maxX - bounds.minX + 400)
      const height = Math.max(1000, bounds.maxY - bounds.minY + 400)
      setViewBox({
        x: bounds.minX - 200,
        y: bounds.minY - 100,
        width,
        height,
      })
      setZoom(1)
    }
  }

  // Handle pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !(e.target as HTMLElement).closest(".node")) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect()
      const scaleX = viewBox.width / rect.width
      const scaleY = viewBox.height / rect.height

      setViewBox((vb) => ({
        ...vb,
        x: vb.x - (e.clientX - dragStart.x) * scaleX,
        y: vb.y - (e.clientY - dragStart.y) * scaleY,
      }))
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle node click
  const handleNodeClick = (nodeId: string) => {
    onNodeSelect(nodeId === selectedNodeId ? null : nodeId)
  }

  // Get node style
  const getNodeStyle = (node: DecisionNode) => {
    const isSelected = node.id === selectedNodeId
    const isInSimulation = simulationPath.includes(node.id)
    const isHovered = node.id === hoveredNodeId
    const isConnected = hoveredNodeId
      ? graph.edges.some((e) => e.from === hoveredNodeId && e.to === node.id) ||
        graph.edges.some((e) => e.from === node.id && e.to === hoveredNodeId)
      : false

    let baseStyle = "cursor-pointer transition-all duration-200"

    if (isSelected) {
      baseStyle += " ring-4 ring-blue-500 ring-offset-2"
    }
    if (isInSimulation) {
      baseStyle += " ring-2 ring-blue-300"
    }
    if (isHovered) {
      baseStyle += " scale-105"
    }
    if (hoveredNodeId && !isConnected && !isHovered) {
      baseStyle += " opacity-40"
    }

    return baseStyle
  }

  // Get node colors
  const getNodeColors = (node: DecisionNode) => {
    if (node.type === "start") {
      return {
        fill: "#3b82f6",
        stroke: "#2563eb",
        text: "#ffffff",
      }
    }
    if (node.type === "path") {
      return {
        fill: "#10b981",
        stroke: "#059669",
        text: "#ffffff",
      }
    }
    if (node.type === "decisive") {
      return {
        fill: "#ffffff",
        stroke: "#dc2626",
        text: "#1f2937",
      }
    }
    if (node.type === "adjuster") {
      return {
        fill: "#ffffff",
        stroke: "#f59e0b",
        text: "#1f2937",
      }
    }
    return {
      fill: "#ffffff",
      stroke: "#d1d5db",
      text: "#1f2937",
    }
  }

  // Get edge style
  const getEdgeStyle = (edge: DecisionEdge, fromPos: any, toPos: any) => {
    const isInSimulation =
      simulationPath.includes(edge.from) && simulationPath.includes(edge.to)
    const isConnected =
      hoveredNodeId === edge.from || hoveredNodeId === edge.to || hoveredNodeId === null
    const thickness = viewMode === "users" && edge.userCount
      ? Math.max(1.5, Math.min(4, Math.sqrt(edge.userCount) * 0.5))
      : 2

    return {
      stroke: isInSimulation
        ? "#3b82f6"
        : isConnected
          ? edge.isDecisive
            ? "#dc2626"
            : "#9ca3af"
          : "#e5e7eb",
      strokeWidth: thickness,
      opacity: isConnected ? 1 : 0.3,
    }
  }

  // Calculate edge label position (staggered to avoid collisions)
  const getEdgeLabelPosition = (edge: DecisionEdge, index: number, fromPos: any, toPos: any) => {
    const midX = (fromPos.x + toPos.x) / 2
    const midY = (fromPos.y + toPos.y) / 2
    const offset = (index % 3 - 1) * 15 // Stagger labels
    return { x: midX, y: midY + offset }
  }

  // Group edges by from node to stagger labels
  const edgesByFrom = useMemo(() => {
    const grouped: Record<string, Array<{ edge: DecisionEdge; index: number }>> = {}
    graph.edges.forEach((edge, idx) => {
      if (!grouped[edge.from]) grouped[edge.from] = []
      grouped[edge.from].push({ edge, index: idx })
    })
    return grouped
  }, [graph.edges])

  const viewBoxString = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
  const showEdgeLabels = zoom > 0.7

  return (
    <div className="relative w-full h-full bg-slate-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Leyenda
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white"></div>
            <span className="text-gray-600">Pregunta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-red-500 bg-white"></div>
            <span className="text-gray-600">Decisiva</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-amber-500 bg-white"></div>
            <span className="text-gray-600">Ajusta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-gray-600">Final</span>
          </div>
          {viewMode === "users" && (
            <div className="pt-1 border-t border-gray-200 mt-1">
              <span className="text-gray-500">Grosor = Volumen</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="h-8 w-8 p-0"
          title="Acercar"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="h-8 w-8 p-0"
          title="Alejar"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleFitView}
          className="h-8 w-8 p-0"
          title="Ajustar vista"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <div className="h-px bg-gray-200 my-1"></div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsDragging(!isDragging)
          }}
          className="h-8 w-8 p-0"
          title="Mover"
        >
          <Move className="h-4 w-4" />
        </Button>
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[600px] overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={viewBoxString}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
          style={{ minHeight: "600px" }}
        >
          {/* Grid background */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="0.5" fill="#e2e8f0" opacity="0.5" />
            </pattern>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#9ca3af" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Edges */}
          <g className="edges">
            {graph.edges.map((edge, index) => {
              const fromPos = nodePositions[edge.from]
              const toPos = nodePositions[edge.to]
              if (!fromPos || !toPos) return null

              const style = getEdgeStyle(edge, fromPos, toPos)
              const labelPos = getEdgeLabelPosition(edge, index, fromPos, toPos)

              // Bezier curve for smoother edges
              const dx = toPos.x - fromPos.x
              const dy = toPos.y - fromPos.y
              const controlX = fromPos.x + dx * 0.5
              const controlY = fromPos.y + dy * 0.3

              return (
                <g key={`edge-${index}`}>
                  <path
                    d={`M ${fromPos.x} ${fromPos.y} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y}`}
                    fill="none"
                    {...style}
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Edge label with background */}
                  {showEdgeLabels && edge.answerLabel && edge.answerLabel !== "→" && (
                    <g>
                      <rect
                        x={labelPos.x - 30}
                        y={labelPos.y - 8}
                        width="60"
                        height="16"
                        rx="8"
                        fill="white"
                        fillOpacity="0.9"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        className="pointer-events-none"
                      />
                      <text
                        x={labelPos.x}
                        y={labelPos.y + 4}
                        textAnchor="middle"
                        className="text-xs fill-gray-700 pointer-events-none font-medium"
                        style={{ fontSize: "11px" }}
                      >
                        {edge.answerLabel.length > 12
                          ? edge.answerLabel.substring(0, 12) + "..."
                          : edge.answerLabel}
                      </text>
                    </g>
                  )}
                  {/* User count badge */}
                  {viewMode === "users" && edge.userCount !== undefined && edge.userCount > 0 && (
                    <g>
                      <circle
                        cx={labelPos.x}
                        cy={labelPos.y + 20}
                        r="10"
                        fill="#3b82f6"
                        className="pointer-events-none"
                      />
                      <text
                        x={labelPos.x}
                        y={labelPos.y + 24}
                        textAnchor="middle"
                        className="text-xs fill-white pointer-events-none font-semibold"
                        style={{ fontSize: "9px" }}
                      >
                        {edge.userCount}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {graph.nodes.map((node) => {
              const pos = nodePositions[node.id]
              if (!pos) return null

              const isSelected = node.id === selectedNodeId
              const isInSimulation = simulationPath.includes(node.id)
              const colors = getNodeColors(node)

              return (
                <g
                  key={node.id}
                  className={`node ${getNodeStyle(node)}`}
                  onClick={() => handleNodeClick(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  transform={`translate(${pos.x}, ${pos.y})`}
                >
                  {/* Node shape */}
                  {node.type === "path" ? (
                    <rect
                      x={-pos.width / 2}
                      y={-pos.height / 2}
                      width={pos.width}
                      height={pos.height}
                      rx="12"
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={isSelected ? 4 : 3}
                      className="drop-shadow-sm"
                    />
                  ) : (
                    <rect
                      x={-pos.width / 2}
                      y={-pos.height / 2}
                      width={pos.width}
                      height={pos.height}
                      rx="10"
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={node.type === "decisive" ? 3 : 2}
                      className="drop-shadow-sm"
                    />
                  )}

                  {/* Node icon */}
                  {node.type !== "path" && node.type !== "start" && (
                    <circle
                      cx={-pos.width / 2 + 20}
                      cy={-pos.height / 2 + 20}
                      r="6"
                      fill={colors.text}
                      opacity="0.3"
                      className="pointer-events-none"
                    />
                  )}

                  {/* Node label */}
                  <text
                    x="0"
                    y={node.type === "path" ? 8 : 6}
                    textAnchor="middle"
                    className={`pointer-events-none font-semibold`}
                    fill={colors.text}
                    style={{
                      fontSize: node.type === "path" ? "13px" : "12px",
                    }}
                  >
                    {node.type === "start"
                      ? "INICIO"
                      : node.type === "path"
                        ? node.label
                        : node.label.length > 20
                          ? node.label.substring(0, 20) + "..."
                          : node.label}
                  </text>

                  {/* Type badge */}
                  {node.type === "decisive" && (
                    <g transform={`translate(${pos.width / 2 - 35}, ${-pos.height / 2 + 8})`}>
                      <rect
                        x="0"
                        y="0"
                        width="30"
                        height="16"
                        rx="8"
                        fill="#fee2e2"
                        stroke="#dc2626"
                        strokeWidth="1"
                        className="pointer-events-none"
                      />
                      <text
                        x="15"
                        y="11"
                        textAnchor="middle"
                        className="text-xs fill-red-700 pointer-events-none font-medium"
                        style={{ fontSize: "9px" }}
                      >
                        Decisiva
                      </text>
                    </g>
                  )}

                  {node.type === "adjuster" && (
                    <g transform={`translate(${pos.width / 2 - 35}, ${-pos.height / 2 + 8})`}>
                      <rect
                        x="0"
                        y="0"
                        width="30"
                        height="16"
                        rx="8"
                        fill="#fef3c7"
                        stroke="#f59e0b"
                        strokeWidth="1"
                        className="pointer-events-none"
                      />
                      <text
                        x="15"
                        y="11"
                        textAnchor="middle"
                        className="text-xs fill-amber-700 pointer-events-none font-medium"
                        style={{ fontSize: "9px" }}
                      >
                        Ajusta
                      </text>
                    </g>
                  )}

                  {/* User count for path nodes */}
                  {viewMode === "users" && node.type === "path" && (
                    <g transform={`translate(${pos.width / 2 - 20}, ${pos.height / 2 - 20})`}>
                      <circle r="12" fill="#3b82f6" className="pointer-events-none" />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        className="text-xs fill-white pointer-events-none font-semibold"
                        style={{ fontSize: "10px" }}
                      >
                        {graph.edges
                          .filter((e) => e.to === node.id)
                          .reduce((sum, e) => sum + (e.userCount || 0), 0)}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      </div>
    </div>
  )
}
