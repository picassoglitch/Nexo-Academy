"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
  BarChart3,
  Zap,
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  SkipForward,
  RefreshCw,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function AdvancedDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/analytics/comprehensive")
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading analytics:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return <div className="p-8">Error loading analytics</div>
  }

  const { redFlags, users, courses, lessons, paths, revenue, engagement, support, funnel, alerts } = data

  // Find lessons with high views + low completion (red flags)
  const problematicLessons = lessons
    .filter((l: any) => l.views > 10 && l.completionRate < 50)
    .sort((a: any, b: any) => a.completionRate - b.completionRate)
    .slice(0, 5)

  // Find drop-off points
  const dropOffLessons = lessons
    .filter((l: any) => l.views > 5)
    .sort((a: any, b: any) => {
      const dropOffA = a.views - a.completions
      const dropOffB = b.views - b.completions
      return dropOffB - dropOffA
    })
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Analytics completos y gestión avanzada</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/analytics/detailed">Analytics Detallados</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/cursos/advanced">Gestión Avanzada</Link>
            </Button>
          </div>
        </div>

        {/* 🚨 RED FLAGS */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            Red Flags
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className={redFlags.highEnrollmentsLowCompletion ? "border-red-500 bg-red-50" : ""}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{redFlags.completionRate}%</div>
                <div className="text-sm text-gray-600 mt-1">
                  {redFlags.highEnrollmentsLowCompletion ? (
                    <span className="text-red-600">⚠️ Course quality problem</span>
                  ) : (
                    <span className="text-green-600">✓ Healthy</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={redFlags.highRefunds ? "border-red-500 bg-red-50" : ""}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Refund Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{redFlags.refundRate}%</div>
                <div className="text-sm text-gray-600 mt-1">
                  {redFlags.highRefunds ? (
                    <span className="text-red-600">⚠️ Promise vs reality mismatch</span>
                  ) : (
                    <span className="text-green-600">✓ Healthy</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={redFlags.highUsersLowRevenue ? "border-orange-500 bg-orange-50" : ""}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Revenue per User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(redFlags.revenuePerUser)}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {redFlags.highUsersLowRevenue ? (
                    <span className="text-orange-600">⚠️ Pricing or upsell issue</span>
                  ) : (
                    <span className="text-green-600">✓ Healthy</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Actionable Alerts</h2>
            <div className="space-y-2">
              {alerts.map((alert: any, idx: number) => (
                <Card
                  key={idx}
                  className={
                    alert.severity === "high"
                      ? "border-red-500 bg-red-50"
                      : alert.severity === "medium"
                      ? "border-orange-500 bg-orange-50"
                      : "border-yellow-500 bg-yellow-50"
                  }
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">{alert.message}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Revenue & Payments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Revenue & Payments
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenue.gross)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(revenue.net)}</div>
                <div className="text-xs text-gray-500 mt-1">After fees</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Refunds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenue.refunds}</div>
                <div className="text-xs text-gray-500 mt-1">{formatCurrency(revenue.refundAmount)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div>MercadoPago: {revenue.byMethod.mercadoPago}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* User & Enrollment Data */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Users className="h-6 w-6" />
            User & Enrollment Data
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name/Email</th>
                      <th className="text-left p-2">Signup</th>
                      <th className="text-left p-2">Courses</th>
                      <th className="text-left p-2">Path</th>
                      <th className="text-left p-2">Progress</th>
                      <th className="text-left p-2">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 10).map((user: any) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-2">
                          <div className="font-medium">{user.name || "N/A"}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </td>
                        <td className="p-2">{formatDate(user.signupDate)}</td>
                        <td className="p-2">{user.coursesPurchased}</td>
                        <td className="p-2">{user.currentPath}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${user.progressPercent}%` }}
                              />
                            </div>
                            <span className="text-xs">{user.progressPercent}%</span>
                          </div>
                        </td>
                        <td className="p-2 text-xs">{formatDate(user.lastActivity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/usuarios">Ver todos los usuarios</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course & Lesson Performance */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Course & Lesson Performance
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {courses.map((course: any) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Enrollments:</span>
                      <span className="font-medium">{course.enrollments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completion Rate:</span>
                      <span className="font-medium">{course.completionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Lessons:</span>
                      <span className="font-medium">{course.lessons}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Problematic Lessons */}
          {problematicLessons.length > 0 && (
            <Card className="border-orange-500 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Lessons with High Views + Low Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {problematicLessons.map((lesson: any) => (
                    <div key={lesson.id} className="flex justify-between items-center p-2 bg-white rounded">
                      <div>
                        <div className="font-medium">{lesson.title}</div>
                        <div className="text-xs text-gray-600">
                          {lesson.views} views, {lesson.completionRate}% completion
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/lecciones?lesson=${lesson.id}`}>Review</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Path Analytics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-6 w-6" />
            Path / Curriculum Analytics
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {paths.map((path: any) => (
              <Card key={path.path}>
                <CardHeader>
                  <CardTitle className="text-sm">{path.path}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div>Started: {path.usersStarted}</div>
                    <div>Completed: {path.usersCompleted}</div>
                    <div>Revenue: {formatCurrency(path.revenue)}</div>
                    {path.avgTimeToMonetization > 0 && (
                      <div>Avg Time: {path.avgTimeToMonetization} days</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Engagement & Behavior */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Engagement & Behavior
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagement.dau}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Weekly Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagement.wau}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Inactive 7+ days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{engagement.inactive7d}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Inactive 14+ days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{engagement.inactive14d}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Conversion & Funnel Metrics
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Signups</span>
                  <span className="font-bold">{funnel.signups}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Purchases</span>
                  <span className="font-bold">{funnel.purchases}</span>
                  <span className="text-sm text-gray-600">
                    ({Math.round(funnel.conversionRates.signupToPurchase)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>First Lesson</span>
                  <span className="font-bold">{funnel.firstLesson}</span>
                  <span className="text-sm text-gray-600">
                    ({Math.round(funnel.conversionRates.purchaseToFirstLesson)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Completions</span>
                  <span className="font-bold">{funnel.completions}</span>
                  <span className="text-sm text-gray-600">
                    ({Math.round(funnel.conversionRates.firstLessonToCompletion)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support & Feedback */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Support & Feedback
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Open Support Tickets</span>
                <span className="text-2xl font-bold">{support.openTickets}</span>
              </div>
              <div className="mt-4">
                <Button asChild variant="outline">
                  <Link href="/admin/support">View Support Tickets</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


