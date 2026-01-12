"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, ArrowLeft, Lock, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import CourseCard from "./course-card"
import { cn } from "@/lib/utils"
import { canAccessPath, getNextAvailableTier, type User as AccessUser } from "@/lib/access-control"

interface Module {
  id: string
  title: string
  description: string | null
  order: number
  course: {
    id: string
    title: string
    slug: string
    requiredTiers?: any
  }
  lessons: Array<{
    id: string
    title: string
    requiredTier: string
    isFreePreview: boolean
  }>
}

interface CoursesCatalogProps {
  modules: Module[]
  lockedModules?: Module[] // Cursos bloqueados para mostrar como upsell
  userTier: number
  selectedPathId: string | null
  selectedCourseId?: string | null
  lessonProgress: Array<{
    lessonId: string
    completed: boolean
  }>
}

export default function CoursesCatalog({
  modules,
  lockedModules = [],
  userTier,
  selectedPathId,
  selectedCourseId,
  lessonProgress,
}: CoursesCatalogProps) {
  // Convert to AccessUser format
  const accessUser: AccessUser = {
    tier: userTier,
    selectedPathId: selectedPathId,
    selectedCourseId: selectedCourseId || null,
  }

  // Helper functions
  const canAccessModule = (module: Module) => {
    // If user is Starter and has selectedCourseId, only allow access to that course
    if (userTier === 1 && selectedCourseId) {
      return module.course.id === selectedCourseId
    }
    
    // First check course-level requiredTiers
    if (module.course.requiredTiers) {
      let courseTiers: string[] = []
      if (typeof module.course.requiredTiers === "string") {
        try {
          courseTiers = JSON.parse(module.course.requiredTiers)
        } catch {
          // If parsing fails, continue to path check
        }
      } else if (Array.isArray(module.course.requiredTiers)) {
        courseTiers = module.course.requiredTiers
      }
      
      if (courseTiers.length > 0 && !courseTiers.includes("ALL")) {
        const userTierName = userTier === 0 ? "FREE" : userTier === 1 ? "STARTER" : userTier === 2 ? "PRO" : "OPERATOR"
        if (!courseTiers.includes(userTierName)) {
          return false
        }
      }
    }
    
    // Then check path access
    return canAccessPath(module.id, accessUser)
  }

  const getLockedTier = (module: Module) => {
    // Use the helper function to get the next available tier
    return getNextAvailableTier(userTier, module.course.requiredTiers)
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "not-started" | "in-progress" | "completed">("all")

  // Calculate progress for each module
  const getModuleProgress = (module: Module) => {
    const total = module.lessons.length
    const completed = module.lessons.filter((lesson) => {
      const progress = lessonProgress.find((lp) => lp.lessonId === lesson.id)
      return progress?.completed
    }).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    let status: "not-started" | "in-progress" | "completed"
    if (completed === 0) {
      status = "not-started"
    } else if (completed === total) {
      status = "completed"
    } else {
      status = "in-progress"
    }

    return { completed, total, percentage, status }
  }

  // Filter modules
  const filteredModules = modules.filter((module) => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const progress = getModuleProgress(module)
    const matchesFilter =
      filterStatus === "all" || progress.status === filterStatus

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-orange-50 to-white pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Caminos Disponibles
          </h1>
          <p className="text-gray-600">
            Elige un camino de ingresos y comienza tu reto de 30 días
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar caminos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos</option>
                  <option value="not-started">No empezados</option>
                  <option value="in-progress">En progreso</option>
                  <option value="completed">Completados</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        {filteredModules.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-gray-600">
                {searchQuery || filterStatus !== "all"
                  ? "No se encontraron caminos con esos filtros"
                  : "No hay caminos disponibles"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredModules.map((module) => {
              const progress = getModuleProgress(module)
              const isLocked = !canAccessModule(module)
              const lockedTier = getLockedTier(module)

              return (
                <CourseCard
                  key={module.id}
                  module={module}
                  progress={progress}
                  status={progress.status}
                  isLocked={isLocked}
                  lockedTier={lockedTier || undefined}
                  userTier={userTier}
                />
              )
            })}
          </div>
        )}

        {/* Locked Courses Section - Subtle Upsell */}
        {lockedModules.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="mb-6 text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Más cursos disponibles con PRO
              </h3>
              <p className="text-sm text-gray-500">
                Desbloquea todos los cursos y accede a contenido exclusivo
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lockedModules.slice(0, 4).map((module) => {
                const progress = getModuleProgress(module)
                const lockedTier = getLockedTier(module)

                return (
                  <Card
                    key={module.id}
                    className="relative overflow-hidden opacity-75 hover:opacity-90 transition-all border-2 border-gray-200"
                  >
                    {/* Subtle lock overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-[1px]" />
                    
                    <CardContent className="pt-6 relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg text-gray-700">
                              {module.course.title}
                            </h3>
                            <Badge className="bg-orange-500/80 text-white text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              PRO
                            </Badge>
                          </div>
                          {module.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {module.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{module.lessons.length} lecciones</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white"
                      >
                        <Link href="/pricing?skipQuiz=true&tier=PRO">
                          <TrendingUp className="mr-2 h-3 w-3" />
                          Mejorar a PRO
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {lockedModules.length > 4 && (
              <div className="mt-4 text-center">
                <Button
                  asChild
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Link href="/pricing?skipQuiz=true&tier=PRO">
                    Ver todos los cursos disponibles con PRO
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

