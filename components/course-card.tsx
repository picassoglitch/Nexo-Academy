"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Play, CheckCircle2, Clock, TrendingUp } from "lucide-react"
import ProgressCircle from "./progress-circle"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CourseCardProps {
  module: {
    id: string
    title: string
    description: string | null
    course: {
      id: string
      title: string
      slug: string
    }
    lessons: Array<{
      id: string
      title: string
      requiredTier: string
      isFreePreview: boolean
    }>
  }
  progress: {
    completed: number
    total: number
    percentage: number
  }
  status: "not-started" | "in-progress" | "completed"
  isLocked: boolean
  lockedTier?: string
  userTier: number
}

export default function CourseCard({
  module,
  progress,
  status,
  isLocked,
  lockedTier,
  userTier,
}: CourseCardProps) {
  const tierNames: Record<string, string> = {
    STARTER: "Starter",
    PRO: "PRO",
    OPERATOR: "Operator",
  }

  const statusColors = {
    "not-started": "border-gray-200 bg-white",
    "in-progress": "border-purple-200 bg-purple-50",
    completed: "border-green-200 bg-green-50",
  }

  const statusIcons = {
    "not-started": Clock,
    "in-progress": Play,
    completed: CheckCircle2,
  }

  const StatusIcon = statusIcons[status]

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1",
        statusColors[status],
        isLocked && "opacity-75"
      )}
    >
      {isLocked && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-orange-500 text-white">
            <Lock className="h-3 w-3 mr-1" />
            {lockedTier ? tierNames[lockedTier] : "Bloqueado"}
          </Badge>
        </div>
      )}

      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image/Icon Placeholder */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <StatusIcon className="h-12 w-12 md:h-16 md:w-16 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {module.course.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {module.description || module.course.title || "Camino de ingresos con IA"}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <ProgressCircle
                  percentage={progress.percentage}
                  size={60}
                  strokeWidth={6}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    {progress.completed} de {progress.total} lecciones
                  </span>
                  <span className="font-semibold text-gray-900">{progress.percentage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500 capitalize">
                    {status === "not-started"
                      ? "No empezado"
                      : status === "in-progress"
                        ? "En progreso"
                        : "Completado"}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            {isLocked ? (
              <Button
                asChild
                className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white"
              >
                <Link href="/pricing">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {lockedTier && tierNames[lockedTier] 
                    ? `Mejorar a ${tierNames[lockedTier]}`
                    : userTier === 0 
                      ? "Mejorar a Starter"
                      : userTier === 1
                        ? "Mejorar a PRO"
                        : userTier === 2
                          ? "Mejorar a Operator"
                          : "Ver Planes"}
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant={status === "completed" ? "outline" : "default"}
                className={cn(
                  "w-full",
                  status !== "completed" &&
                    "bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
                )}
              >
                <Link href={`/curso/${module.course.slug}/${module.id}`}>
                  {status === "not-started" ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Comenzar
                    </>
                  ) : status === "in-progress" ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Continuar
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Ver de nuevo
                    </>
                  )}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

