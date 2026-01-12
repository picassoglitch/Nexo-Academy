"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  FileText,
  Ticket,
  BarChart3,
  Zap,
  Calendar,
  Target,
  ArrowRight,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function AdminDashboard({ stats }: { stats: any }) {
  const conversionRate =
    stats.funnel.planViews > 0
      ? Math.round((stats.orders.recent.filter((o: any) => o.status === "APPROVED").length / stats.funnel.planViews) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-gray-600 mt-1">Vista general del negocio</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/admin/lecciones">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Lección
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/cupones">
                <Ticket className="mr-2 h-4 w-4" />
                Crear Cupón
              </Link>
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {(stats.alerts.pendingPayments > 0 ||
          stats.alerts.unapprovedTestimonials > 0 ||
          stats.alerts.pendingOrders > 0) && (
          <div className="mb-6 space-y-2">
            {stats.alerts.pendingPayments > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">
                      {stats.alerts.pendingPayments} pagos pendientes de aprobación
                    </span>
                    <Button asChild variant="link" size="sm" className="ml-auto">
                      <Link href="/admin/ordenes?status=IN_PROCESS">Ver</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {stats.alerts.unapprovedTestimonials > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {stats.alerts.unapprovedTestimonials} testimonios pendientes de aprobación
                    </span>
                    <Button asChild variant="link" size="sm" className="ml-auto">
                      <Link href="/admin/testimonios">Aprobar</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {stats.alerts.pendingOrders > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">
                      {stats.alerts.pendingOrders} órdenes pendientes
                    </span>
                    <Button asChild variant="link" size="sm" className="ml-auto">
                      <Link href="/admin/ordenes?status=PENDING">Ver</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Revenue & Sales Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Ingresos y Ventas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.revenue.total.gross)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Neto: {formatCurrency(stats.revenue.total.net)} ({stats.revenue.total.count} ventas)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Este Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.revenue.thisMonth.gross)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Neto: {formatCurrency(stats.revenue.thisMonth.net)} ({stats.revenue.thisMonth.count} ventas)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.revenue.today.gross)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.revenue.today.count} {stats.revenue.today.count === 1 ? "venta" : "ventas"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Tasa de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversionRate}%</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.funnel.planViews} planes vistos
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Tier */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Ingresos por Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {stats.revenue.byTier.map((tier: any) => (
                  <div key={tier.tier} className="text-center">
                    <div className="text-lg font-semibold">{tier.tier}</div>
                    <div className="text-sm text-gray-600">{tier._count} usuarios</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User & Engagement Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios y Engagement
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.users.newMonth} este mes
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Activos (7 días)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.active7d}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.users.active30d} activos (30 días)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Nuevos Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.newToday}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.users.newWeek} esta semana
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Progreso Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.engagement.avgProgress}%</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.engagement.quizCompletions} quizzes completados
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Funnel Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Embudo de Conversión
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Quizzes Iniciados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.funnel.quizStarts}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.funnel.planViews} planes generados
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Carritos Abandonados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.funnel.abandonedCarts}</div>
                <div className="text-xs text-gray-500 mt-1">Últimos 7 días</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Cupones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.coupons.total}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.coupons.redeemed} canjeados
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Órdenes Recientes
            </h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/ordenes">
                Ver todas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {stats.orders.recent.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center pb-4 border-b last:border-0">
                    <div>
                      <div className="font-medium">{order.user.email}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.createdAt)} • {order.coupon?.code && `Cupón: ${order.coupon.code}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(order.amount)}</div>
                      <div
                        className={`text-xs ${
                          order.status === "APPROVED"
                            ? "text-green-600"
                            : order.status === "PENDING"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
                {stats.orders.recent.length === 0 && (
                  <div className="text-center text-gray-500 py-8">No hay órdenes recientes</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Acciones Rápidas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Contenido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/cursos">Cursos</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/modulos">Módulos</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/lecciones">Lecciones</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/activos">Activos/Plantillas</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/precios">Precios</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestión de Negocio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/ordenes">Órdenes</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/cupones">Cupones</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/usuarios">Usuarios</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/testimonios">Testimonios</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/config">Configuración</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/admin/analytics">Analytics</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
