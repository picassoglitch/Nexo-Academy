"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, Users, ArrowRight } from "lucide-react"

interface UserFlowViewProps {
  flowData: {
    pathCounts: Record<string, number>
    intentDistribution: Record<string, number>
    dropOffRate: number
    totalQuiz: number
    totalPlans: number
  }
}

export default function UserFlowView({ flowData }: UserFlowViewProps) {
  const pathPercentages = useMemo(() => {
    const total = flowData.totalQuiz || 1
    return Object.entries(flowData.pathCounts).map(([path, count]) => ({
      path,
      count,
      percentage: (count / total) * 100,
    })).sort((a, b) => b.count - a.count)
  }, [flowData])

  const pathLabels: Record<string, string> = {
    STARTER: "Starter",
    CREATOR: "Creator",
    FREELANCER: "Freelancer",
    SCALER: "Scaler",
  }

  const pathColors: Record<string, string> = {
    STARTER: "bg-blue-500",
    CREATOR: "bg-purple-500",
    FREELANCER: "bg-green-500",
    SCALER: "bg-orange-500",
  }

  return (
    <div className="space-y-6">
      {/* Drop-off Warning */}
      {flowData.dropOffRate > 30 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <TrendingDown className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-red-900 mb-1">
                Punto de Abandono Detectado
              </h4>
              <p className="text-sm text-red-700">
                {flowData.dropOffRate.toFixed(1)}% de usuarios completan el cuestionario pero no crean un plan.
                Considera revisar la experiencia de conversión.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Path Distribution */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Distribución por Camino</h4>
          <Badge variant="secondary">
            {flowData.totalQuiz} usuarios
          </Badge>
        </div>

        {pathPercentages.map(({ path, count, percentage }) => (
          <div key={path} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${pathColors[path] || "bg-gray-500"}`} />
                <span className="font-medium">{pathLabels[path] || path}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">{count} usuarios</span>
                <span className="font-semibold text-gray-900">{percentage.toFixed(1)}%</span>
              </div>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        ))}
      </div>

      {/* Conversion Funnel */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-sm mb-4">Embudo de Conversión</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Completaron Cuestionario</span>
            </div>
            <span className="font-semibold">{flowData.totalQuiz}</span>
          </div>
          <div className="flex justify-center">
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Crearon Plan</span>
            </div>
            <span className="font-semibold">{flowData.totalPlans}</span>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="mt-2">
              Tasa de conversión: {flowData.totalQuiz > 0 
                ? ((flowData.totalPlans / flowData.totalQuiz) * 100).toFixed(1)
                : 0}%
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}



