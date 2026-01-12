"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Lock, Play, Clock, FileText, Video, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface LessonItemProps {
  lesson: {
    id: string
    slug: string
    title: string
    summary: string | null
    lessonType: string | null
    estimatedDuration: number | null
    requiredTier: string
    isFreePreview: boolean
    order: number
  }
  isCompleted: boolean
  isLocked: boolean
  isCurrent: boolean
  courseSlug: string
  moduleId: string
}

export default function LessonItem({
  lesson,
  isCompleted,
  isLocked,
  isCurrent,
  courseSlug,
  moduleId,
}: LessonItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getLessonIcon = () => {
    switch (lesson.lessonType) {
      case "Video Principal":
        return <Video className="h-5 w-5" />
      case "Interactivo":
        return <Zap className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getLessonBadge = () => {
    switch (lesson.lessonType) {
      case "Video Principal":
        return <Badge className="bg-red-100 text-red-800 text-xs">Video</Badge>
      case "Interactivo":
        return <Badge className="bg-purple-100 text-purple-800 text-xs">Interactivo</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Texto</Badge>
    }
  }

  return (
    <div
      className={cn(
        "border-2 rounded-lg transition-all",
        isCurrent
          ? "border-purple-500 bg-purple-50 shadow-md"
          : isLocked
            ? "border-gray-200 bg-gray-50 opacity-60"
            : isCompleted
              ? "border-green-200 bg-green-50"
              : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm"
      )}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => !isLocked && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div className="flex-shrink-0 mt-1">
            {isLocked ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
            ) : isCompleted ? (
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            ) : (
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isCurrent
                    ? "bg-purple-600"
                    : "bg-gray-200"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-bold",
                    isCurrent ? "text-white" : "text-gray-600"
                  )}
                >
                  {lesson.order}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 line-clamp-2">{lesson.title}</h4>
              {getLessonBadge()}
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
              {lesson.estimatedDuration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{lesson.estimatedDuration} min</span>
                </div>
              )}
              {getLessonIcon()}
              {isCompleted && (
                <span className="text-green-600 font-medium">Completada</span>
              )}
              {isCurrent && (
                <span className="text-purple-600 font-medium">Continuar aquí</span>
              )}
            </div>

            {lesson.summary && isExpanded && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{lesson.summary}</p>
            )}
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            {isLocked ? (
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Bloqueado
              </Badge>
            ) : (
              <Button
                asChild
                size="sm"
                className={cn(
                  isCurrent
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : isCompleted
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Link href={`/curso/${courseSlug}/leccion/${lesson.slug}`}>
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Ver
                    </>
                  ) : (
                    <>
                      <Play className="mr-1 h-3 w-3" />
                      {isCurrent ? "Continuar" : "Comenzar"}
                    </>
                  )}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



