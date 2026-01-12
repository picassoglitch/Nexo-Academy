"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Flame,
  BookOpen,
  Download,
  Users,
  Share2,
  Settings,
  Lock,
  FolderTree,
  Search,
  Bell,
  Zap,
  Trophy,
  TrendingUp,
  ChevronRight,
  Play,
  Award,
  Star,
  LogOut,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { canAccess, getUserPlan, canAccessPath, getLockedReason, getNextAvailableTier, type User as AccessUser } from "@/lib/access-control"
import { PLAN_LABELS, TIER_TO_PLAN } from "@/lib/config/plans"
import LockedFeatureCard from "./locked-feature-card"
import EnabledFeatureCard from "./enabled-feature-card"
import UpsellModal from "./upsell-modal"
import PlanComparisonModal from "./plan-comparison-modal"
import ProgressCircle from "./progress-circle"
import StreakCard from "./streak-card"
import XPCounter from "./xp-counter"
import BottomNav from "./bottom-nav"
import DailyChallenge from "./daily-challenge"
import { SubscriptionManagement } from "./subscription-management"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function DashboardContent({
  user,
  course,
  progress,
  modules,
  lockedCourses,
}: {
  user: any
  course: any
  progress: {
    totalLessons: number
    completedLessons: number
    progressPercentage: number
    streak: number
  }
  modules?: any[]
  lockedCourses?: any[]
}) {
  // Convertir user a AccessUser
  const accessUser: AccessUser = {
    tier: user.tier !== undefined ? user.tier : 0,
    selectedPathId: user.selectedPathId || null,
    selectedCourseId: user.selectedCourseId || null,
  }

  const userTier = accessUser.tier
  const userPlan = getUserPlan(accessUser)
  const tierNames: Record<number, string> = {
    0: "Gratis",
    1: "Starter",
    2: "Pro",
    3: "Operator",
  }

  const displayName = userTier > 0 ? tierNames[userTier] : (user.name || "Estudiante")
  const [showUpsell, setShowUpsell] = useState<{ feature: string; plan: any } | null>(null)
  const [showPlanComparison, setShowPlanComparison] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      setLoggingOut(true)
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
      } catch (error) {
        console.error("Error logging out:", error)
        setLoggingOut(false)
      }
    }
  }

  // Calculate XP (mock - 100 XP per lesson)
  const totalXP = progress.completedLessons * 100
  const nextLevelXP = 500
  const currentLevelXP = totalXP % nextLevelXP
  const level = Math.floor(totalXP / nextLevelXP) + 1

  // Verificar acceso a features
  const canAccessCommunity = canAccess("community", accessUser)
  const canAccessTemplates = canAccess("templates", accessUser)
  const canAccessScripts = canAccess("scripts", accessUser)
  const canAccessDownloads = canAccess("downloads", accessUser)
  const canAccessPathsAll = canAccess("paths:all", accessUser)
  const canAccessPathsSingle = canAccess("paths:single", accessUser)

  // Si es starter sin curso seleccionado, mostrar pantalla de selección con todos los cursos
  if (userPlan === "starter" && !accessUser.selectedCourseId && modules && modules.length > 0) {
    // Group modules by course
    const coursesMap = new Map<string, { course: any; modules: any[] }>()
    modules.forEach((module: any) => {
      const course = module.course || { id: "unknown", title: "Curso", requiredTiers: null, description: null }
      const courseId = course.id
      if (!coursesMap.has(courseId)) {
        coursesMap.set(courseId, { course, modules: [] })
      }
      coursesMap.get(courseId)!.modules.push(module)
    })

    // Check which courses are accessible for Starter tier
    const canAccessCourseForStarter = (course: any) => {
      if (!course.requiredTiers) return true
      let courseTiers: string[] = []
      if (typeof course.requiredTiers === "string") {
        try {
          courseTiers = JSON.parse(course.requiredTiers)
        } catch {
          return true
        }
      } else if (Array.isArray(course.requiredTiers)) {
        courseTiers = course.requiredTiers
      }
      return courseTiers.includes("ALL") || courseTiers.includes("STARTER")
    }

    // Separar cursos accesibles y bloqueados
    const accessibleCourses: Array<{ course: any; modules: any[] }> = []
    const lockedCourses: Array<{ course: any; modules: any[] }> = []

    Array.from(coursesMap.values()).forEach((item) => {
      if (canAccessCourseForStarter(item.course)) {
        accessibleCourses.push(item)
      } else {
        lockedCourses.push(item)
      }
    })

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-orange-50 to-white pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card className="mb-8 border-2 border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Elige tu Curso</CardTitle>
              <p className="text-gray-600 mt-2">
                Como usuario Starter, puedes elegir un curso para enfocarte durante 30 días.
                Una vez seleccionado, solo tendrás acceso a ese curso. Para acceder a más cursos, mejora tu plan.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Cursos accesibles */}
                {accessibleCourses.map(({ course, modules: courseModules }) => (
                  <Card
                    key={course.id}
                    className="transition-all hover:shadow-lg border-2 border-purple-200 cursor-pointer hover:bg-purple-50"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h2>
                          {course.description && (
                            <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{courseModules.length} módulo{courseModules.length !== 1 ? "s" : ""}</span>
                            <span>
                              {courseModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} lecciones
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={async () => {
                            const response = await fetch(`/api/user/select-course`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ courseId: course.id }),
                            })
                            if (response.ok) {
                              window.location.reload()
                            } else {
                              const error = await response.json()
                              alert(error.error || "Error al seleccionar el curso")
                            }
                          }}
                          className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
                        >
                          Elegir este Curso
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Cursos bloqueados */}
                {lockedCourses.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Cursos disponibles con PRO
                    </h3>
                    {lockedCourses.map(({ course, modules: courseModules }) => (
                      <Card
                        key={course.id}
                        className="transition-all opacity-70 border-2 border-gray-200 mb-4"
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>
                                <Badge className="bg-orange-500 text-white">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Requiere PRO
                                </Badge>
                              </div>
                              {course.description && (
                                <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{courseModules.length} módulo{courseModules.length !== 1 ? "s" : ""}</span>
                                <span>
                                  {courseModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} lecciones
                                </span>
                              </div>
                            </div>
                            <Button
                              className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white"
                              onClick={() => setShowPlanComparison(true)}
                            >
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Mejorar a PRO
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-orange-50 to-white pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                Bienvenido, {displayName}
              </h1>
              <p className="text-gray-600 text-sm mt-1">Continúa tu reto de 30 días</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-gray-600 hover:text-red-600"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {loggingOut ? "Cerrando..." : "Salir"}
              </Button>
              {userPlan && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPlanComparison(true)}
                  className="hidden md:flex"
                >
                  Ver Planes
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* XP Counter */}
        <XPCounter xp={totalXP} level={level} currentLevelXP={currentLevelXP} nextLevelXP={nextLevelXP} />

        {/* Progress Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Progress Circle */}
          <Card className="border-2 border-purple-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <ProgressCircle
                  percentage={progress.progressPercentage}
                  size={120}
                  strokeWidth={12}
                />
                <div className="mt-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{progress.progressPercentage}%</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {progress.completedLessons} de {progress.totalLessons} lecciones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <StreakCard streak={progress.streak} />

          {/* Plan Card with Upsell */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full mb-3">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-1">
                  {userTier > 0 ? tierNames[userTier] : "Sin plan"}
                </p>
                {userTier < 3 && (
                  <Button
                    size="sm"
                    className="mt-3 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white"
                    onClick={() => setShowPlanComparison(true)}
                  >
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Mejorar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Challenge */}
        <DailyChallenge progress={progress} />

        {/* Continue Learning - Expandable Card */}
        {course && (
          <Card className="mb-6 bg-gradient-to-r from-purple-600 via-purple-700 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Continúa Aprendiendo</h2>
                  <p className="text-purple-100 mb-4">
                    {progress.completedLessons === 0
                      ? "Comienza tu primera lección del reto de 30 días"
                      : `Has completado ${progress.completedLessons} lecciones. ¡Sigue así!`}
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg"
                  >
                    <Link href="/curso">
                      <Play className="mr-2 h-5 w-5" />
                      Ver Curso
                    </Link>
                  </Button>
                </div>
                <div className="hidden md:block ml-6">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Caminos - Swipeable Cards */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FolderTree className="h-6 w-6 text-purple-600" />
              Caminos
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/curso">
                Ver todos
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {canAccessPathsAll || canAccessPathsSingle ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules
                ?.filter((module: any, index: number, self: any[]) => 
                  // Filtrar duplicados: mantener solo el primer módulo con cada título único
                  index === self.findIndex((m: any) => m.title === module.title)
                )
                .slice(0, 2)
                .map((module: any) => (
                <Card
                  key={module.id}
                  className="border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer hover:shadow-lg"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{module.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {module.description || "Accede a este camino de ingresos"}
                        </p>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/curso#${module.id}`}>
                            Explorar
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                      <div className="ml-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <FolderTree className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <LockedFeatureCard
              title="Caminos"
              description="Elige un camino de ingresos para comenzar tu reto de 30 días"
              icon={<FolderTree className="h-5 w-5" />}
              featureKey="paths:single"
              user={accessUser}
            />
          )}
        </div>

        {/* Features Grid with Badges */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Comunidad */}
          {canAccessCommunity ? (
            <Card className="border-2 border-green-200 hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-green-100 text-green-800">Activo</Badge>
                </div>
                <h3 className="font-bold text-lg mb-2">Comunidad</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Únete a la comunidad privada de estudiantes
                </p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="https://discord.com/invite/KuVCRgKrpM" target="_blank" rel="noopener noreferrer">
                    Acceder a Comunidad
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <LockedFeatureCard
              title="Comunidad"
              description="Únete a la comunidad privada de estudiantes Pro y Operator"
              icon={<Users className="h-5 w-5" />}
              featureKey="community"
              user={accessUser}
            />
          )}

          {/* Plantillas */}
          {canAccessTemplates ? (
            <Card className="border-2 border-blue-200 hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Activo</Badge>
                </div>
                <h3 className="font-bold text-lg mb-2">Plantillas</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Accede a plantillas profesionales y recursos descargables
                </p>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/plantillas">Ver Plantillas</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <LockedFeatureCard
              title="Plantillas"
              description="Accede a plantillas profesionales y recursos descargables"
              icon={<Download className="h-5 w-5" />}
              featureKey="templates"
              user={accessUser}
            />
          )}

          {/* Scripts */}
          {canAccessScripts ? (
            <Card className="border-2 border-purple-200 hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Activo</Badge>
                </div>
                <h3 className="font-bold text-lg mb-2">Scripts</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Scripts de WhatsApp, automatizaciones y flujos de trabajo
                </p>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/scripts">Ver Scripts</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <LockedFeatureCard
              title="Scripts"
              description="Desbloquea scripts y automatizaciones probadas"
              icon={<Zap className="h-5 w-5" />}
              featureKey="scripts"
              user={accessUser}
            />
          )}
        </div>

        {/* Descargables */}
        <div className="mb-6">
          {canAccessDownloads ? (
            <Card className="border-2 border-orange-200 hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Download className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Descargables</h3>
                      <p className="text-sm text-gray-600">
                        SOPs, checklists, bases de datos y recursos exclusivos
                      </p>
                    </div>
                  </div>
                  <Button asChild className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                    <Link href="/descargables">Acceder</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <LockedFeatureCard
              title="Descargables"
              description="Accede a recursos descargables y SOPs detallados"
              icon={<Download className="h-5 w-5" />}
              featureKey="downloads"
              user={accessUser}
            />
          )}
        </div>

        {/* Referidos */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Share2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Referidos</h3>
                  <p className="text-sm text-gray-600">Invita amigos y gana comisiones</p>
                </div>
              </div>
              <Button asChild variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                <Link href="/referidos">Ver Referidos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gestión de Suscripción - Solo para usuarios con suscripción activa */}
        {userTier > 0 && (
          <div className="mb-6">
            <SubscriptionManagement />
          </div>
        )}

        {/* Otros Cursos Disponibles - Solo para Starter con curso seleccionado */}
        {userPlan === "starter" && accessUser.selectedCourseId && lockedCourses && lockedCourses.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-purple-600" />
                  Otros Caminos Disponibles
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Explora otros cursos que podrías tomar o desbloquear con PRO
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/curso">
                  Ver todos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lockedCourses.slice(0, 4).map((lockedCourse: any) => {
                // Group modules by course
                const courseModules = lockedCourse.modules || []
                const totalLessons = courseModules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0)
                
                // Get the next available tier for this course
                const nextTier = getNextAvailableTier(userTier, lockedCourse.requiredTiers)
                const requiresPro = nextTier === "PRO" || nextTier === "OPERATOR"
                const isStarterAccessible = !nextTier || nextTier === "STARTER"

                return (
                  <Card
                    key={lockedCourse.id}
                    className="relative overflow-hidden opacity-80 hover:opacity-100 transition-all border-2 border-gray-200 hover:border-purple-300"
                  >
                    {/* Subtle lock overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/40 to-white/40 backdrop-blur-[1px] pointer-events-none" />
                    
                    <CardContent className="pt-6 relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg text-gray-800">
                              {lockedCourse.title}
                            </h3>
                            {requiresPro && (
                              <Badge className="bg-orange-500/90 text-white text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                PRO
                              </Badge>
                            )}
                            {!requiresPro && (
                              <Badge className="bg-blue-500/90 text-white text-xs">
                                Starter
                              </Badge>
                            )}
                          </div>
                          {lockedCourse.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {lockedCourse.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{courseModules.length} módulo{courseModules.length !== 1 ? "s" : ""}</span>
                            <span>{totalLessons} lecciones</span>
                          </div>
                        </div>
                      </div>
                      {requiresPro ? (
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white"
                          onClick={() => setShowPlanComparison(true)}
                        >
                          <TrendingUp className="mr-2 h-3 w-3" />
                          {nextTier === "PRO" ? "Mejorar a PRO" : nextTier === "OPERATOR" ? "Mejorar a Operator" : "Mejorar Plan"}
                        </Button>
                      ) : isStarterAccessible ? (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Link href="/curso">
                            Ver Curso
                            <ChevronRight className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {lockedCourses.length > 4 && (
              <div className="mt-4 text-center">
                <Button
                  asChild
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Link href="/curso">
                    Ver todos los cursos disponibles
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />

      {/* Modales */}
      {showUpsell && (
        <UpsellModal
          isOpen={!!showUpsell}
          onClose={() => setShowUpsell(null)}
          featureTitle={showUpsell.feature}
          featureDescription=""
          targetPlan={showUpsell.plan}
          currentPlan={userPlan}
        />
      )}

      <PlanComparisonModal
        isOpen={showPlanComparison}
        onClose={() => setShowPlanComparison(false)}
        currentPlan={userPlan}
      />
    </div>
  )
}
