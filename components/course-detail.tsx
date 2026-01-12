"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Play, Trophy, Zap, Star, TrendingUp } from "lucide-react"
import ProgressCircle from "./progress-circle"
import LessonItem from "./lesson-item"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Module {
  id: string
  title: string
  description: string | null
  order: number
  course: {
    id: string
    title: string
    slug: string
  }
  lessons: Array<{
    id: string
    slug: string
    title: string
    summary: string | null
    lessonType: string | null
    estimatedDuration: number | null
    requiredTier: string
    isFreePreview: boolean
    order: number
  }>
}

interface CourseDetailProps {
  module: Module
  userTier: number
  lessonProgress: Array<{
    lessonId: string
    completed: boolean
  }>
}

export default function CourseDetail({
  module,
  userTier,
  lessonProgress,
}: CourseDetailProps) {
  // Helper functions
  const canAccessLesson = (lesson: any) => {
    if (lesson.isFreePreview) return true

    // Lessons use requiredTier (singular), not requiredTiers
    const tierOrder: Record<string, number> = { STARTER: 1, PRO: 2, OPERATOR: 3 }
    const lessonTier = tierOrder[lesson.requiredTier as string] || 1

    return userTier >= lessonTier
  }

  const getNextLesson = () => {
    const completedLessonIds = new Set(
      lessonProgress.filter((lp) => lp.completed).map((lp) => lp.lessonId)
    )

    // Find first incomplete lesson in this module
    for (const lesson of module.lessons) {
      if (!completedLessonIds.has(lesson.id) && canAccessLesson(lesson)) {
        return lesson.slug
      }
    }

    return null
  }
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())

  const totalLessons = module.lessons.length
  const completedLessons = module.lessons.filter((lesson) => {
    const progress = lessonProgress.find((lp) => lp.lessonId === lesson.id)
    return progress?.completed
  }).length
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Calculate XP (100 XP per lesson)
  const totalXP = completedLessons * 100
  const level = Math.floor(totalXP / 500) + 1

  const nextLessonSlug = getNextLesson()

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons)
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId)
    } else {
      newExpanded.add(lessonId)
    }
    setExpandedLessons(newExpanded)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-orange-50 to-white pb-20 md:pb-8">
      {/* Header with Cover */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-orange-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mb-4 text-white hover:bg-white/20"
          >
            <Link href="/curso">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Caminos
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{module.title}</h1>
          {module.description && (
            <p className="text-lg text-purple-100 max-w-3xl">{module.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Progress Section */}
        <Card className="mb-6 border-2 border-purple-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              {/* Progress Circle */}
              <div className="flex flex-col items-center text-center">
                <ProgressCircle percentage={progressPercentage} size={120} strokeWidth={12} />
                <p className="text-2xl font-bold text-gray-900 mt-4">{progressPercentage}%</p>
                <p className="text-sm text-gray-600">
                  {completedLessons} de {totalLessons} lecciones
                </p>
              </div>

              {/* XP & Level */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalXP}</p>
                <p className="text-sm text-gray-600 mb-2">XP Total</p>
                <Badge className="bg-purple-100 text-purple-800">
                  <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                  Nivel {level}
                </Badge>
              </div>

              {/* Continue CTA */}
              <div className="flex flex-col items-center text-center">
                {nextLessonSlug ? (
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white mb-3"
                    >
                      <Link href={`/curso/${module.course.slug}/leccion/${nextLessonSlug}`}>
                        <Play className="mr-2 h-5 w-5" />
                        Continuar Aprendiendo
                      </Link>
                    </Button>
                    <p className="text-xs text-gray-500">Siguiente lección disponible</p>
                  </>
                ) : progressPercentage === 100 ? (
                  <>
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                      <Trophy className="h-10 w-10 text-white" />
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-2">¡Completado!</p>
                    <p className="text-sm text-gray-600">Has terminado este camino</p>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
                    >
                      <Link href={`/curso/${module.course.slug}/leccion/${module.lessons[0]?.slug}`}>
                        <Play className="mr-2 h-5 w-5" />
                        Comenzar
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card className="border-2 border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Lecciones</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {totalLessons} lecciones • {module.lessons.reduce((acc, l) => acc + (l.estimatedDuration || 10), 0)} minutos totales
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {module.lessons.map((lesson, index) => {
                const isCompleted = lessonProgress.some(
                  (lp) => lp.lessonId === lesson.id && lp.completed
                )
                const isLocked = !canAccessLesson(lesson)
                const isCurrent = nextLessonSlug === lesson.slug

                return (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    isCompleted={isCompleted}
                    isLocked={isLocked}
                    isCurrent={isCurrent}
                    courseSlug={module.course.slug}
                    moduleId={module.id}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

