"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"

interface Subscription {
  id: string
  status: string
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  canceled_at: number | null
}

export function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/stripe/get-subscription")
      const data = await response.json()

      if (response.ok && data.hasSubscription) {
        setSubscription(data.subscription)
      }
      setLoading(false)
    } catch (error: any) {
      console.error("Error fetching subscription:", error)
      setError("Error al cargar la información de tu suscripción")
      setLoading(false)
    }
  }

  const handleCancelSubscription = async (cancelAtPeriodEnd: boolean = true) => {
    setCancelling(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_at_period_end: cancelAtPeriodEnd }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        // Refresh subscription data
        await fetchSubscription()
      } else {
        setError(data.error || "Error al cancelar la suscripción")
      }
    } catch (error: any) {
      console.error("Error canceling subscription:", error)
      setError("Error al cancelar la suscripción. Por favor, intenta de nuevo.")
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mi Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No tienes una suscripción activa.</p>
        </CardContent>
      </Card>
    )
  }

  const periodEnd = new Date(subscription.current_period_end)
  const isCancelled = subscription.cancel_at_period_end || subscription.status !== "active"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi Suscripción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Estado:</span>
            <span
              className={`text-sm font-medium ${
                subscription.status === "active" && !isCancelled
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              {isCancelled ? "Cancelada" : "Activa"}
            </span>
          </div>

          {isCancelled ? (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                Tu suscripción se cancelará el {periodEnd.toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                . Tendrás acceso hasta esa fecha.
              </p>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Próximo pago:</span>
              <span className="text-sm font-medium">
                {periodEnd.toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {!isCancelled && (
          <div className="pt-4 border-t">
            <Button
              onClick={() => handleCancelSubscription(true)}
              disabled={cancelling}
              variant="outline"
              className="w-full"
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Cancelar Suscripción"
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Tu suscripción se cancelará al final del período actual. Mantendrás acceso hasta entonces.
            </p>
          </div>
        )}

        {isCancelled && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 text-center">
              Si cambias de opinión, puedes reactivar tu suscripción contactando a soporte.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


