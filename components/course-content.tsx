"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Lock, PlayCircle } from "lucide-react"
import { canAccessPath, getUserPlan, type User as AccessUser } from "@/lib/access-control"
import UpsellModal from "./upsell-modal"
import { getLockedReason } from "@/lib/access-control"

export default function CourseContent({
  course,
  user,
}: {
  course: any
  user: any
}) {
  // Convertir user a AccessUser
  const accessUser: AccessUser = {
    tier: user.tier !== undefined ? user.tier : 0,
    selectedPathId: user.selectedPathId || null,
  }

  const userPlan = getUserPlan(accessUser)
  const [showUpsell, setShowUpsell] = useState<{ moduleId: string; reason: any } | null>(null)

  const completedLessonIds = new Set(
    user.lessonProgress
      .filter((lp: any) => lp.completed)
      .map((lp: any) => lp.lessonId)
  )

  const totalLessons = course.modules.reduce(
    (acc: number, module: any) => acc + module.lessons.length,
    0
  )
  const completedCount = completedLessonIds.size
  const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

  const canAccessLesson = (lesson: any) => {
    if (lesson.isFreePreview) return true
    if (!userPlan) return false

    // Verificar tier requerido
    const tierOrder: Record<string, number> = { STARTER: 1, PRO: 2, OPERATOR: 3 }
    const userTier = accessUser.tier
    const lessonTier = tierOrder[lesson.requiredTier as string] || 1

    if (userTier < lessonTier) {
      return false
    }

    // Verificar acceso al módulo/path
    const canAccessModule = canAccessPath(lesson.moduleId, accessUser)
    return canAccessModule
  }

  const handleModuleClick = (module: any, e: React.MouseEvent) => {
    if (!canAccessPath(module.id, accessUser)) {
      e.preventDefault()
      const lockedReason = getLockedReason("paths:all", accessUser)
      if (lockedReason) {
        setShowUpsell({ moduleId: module.id, reason: lockedReason })
      }
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{course.description}</p>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso: {completedCount} de {totalLessons} lecciones</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>

          <div className="space-y-6">
            {course.modules.map((module: any) => {
              const canAccessModule = canAccessPath(module.id, accessUser)
              const isLocked = !canAccessModule

              return (
                <Card key={module.id} className={isLocked ? "opacity-75" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {module.title}
                        {isLocked && <Lock className="h-4 w-4 text-gray-400" />}
                      </CardTitle>
                      {isLocked && (
                        <span className="text-xs text-gray-500">
                          {userPlan === "starter" 
                            ? "Selecciona este camino en tu plan Starter"
                            : "Disponible en Pro o Operator"}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {module.lessons.map((lesson: any) => {
                        const isCompleted = completedLessonIds.has(lesson.id)
                        const canAccess = canAccessLesson(lesson)

                        return (
                          <Link
                            key={lesson.id}
                            href={
                              canAccess
                                ? `/curso/${course.slug}/leccion/${lesson.slug}`
                                : "#"
                            }
                            onClick={(e) => {
                              if (!canAccess) {
                                e.preventDefault()
                                // Mostrar modal de upsell si es necesario
                              }
                            }}
                            className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                              canAccess
                                ? "hover:bg-gray-50"
                                : "opacity-60 cursor-not-allowed"
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                              ) : canAccess ? (
                                <PlayCircle className="h-6 w-6 text-blue-600" />
                              ) : (
                                <Lock className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{lesson.title}</h3>
                              {lesson.summary && (
                                <p className="text-sm text-gray-600">{lesson.summary}</p>
                              )}
                            </div>
                            {!canAccess && (
                              <Button size="sm" variant="outline" disabled>
                                <Lock className="h-4 w-4 mr-2" />
                                Desbloquear
                              </Button>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {showUpsell && (
        <UpsellModal
          isOpen={!!showUpsell}
          onClose={() => setShowUpsell(null)}
          featureTitle={showUpsell.reason.title}
          featureDescription={showUpsell.reason.body}
          targetPlan={showUpsell.reason.ctaPlan}
          currentPlan={userPlan}
        />
      )}
    </>
  )
}
