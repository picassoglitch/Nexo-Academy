"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DISCLAIMER_TEXT, INCOME_PATHS, TIERS } from "@/lib/constants"
import { IncomePath, Tier } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import posthog from "posthog-js"

export default function PlanContent({ planId }: { planId?: string }) {
  const router = useRouter()
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (planId) {
      fetch(`/api/plan/${planId}`)
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          const contentType = res.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON")
          }
          return res.json()
        })
        .then((data) => {
          setPlan(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching plan:", error)
          setLoading(false)
        })
    } else {
      // Get latest plan from session or create default
      setPlan({
        recommendedPath: IncomePath.PATH1,
        recommendedTier: Tier.STARTER,
        planJson: {},
      })
      setLoading(false)
    }
  }, [planId])

  const handleUnlock = () => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture("plan_cta_clicked", {
        path: plan?.recommendedPath,
        tier: plan?.recommendedTier,
      })
    }
    router.push(`/checkout?tier=${plan?.recommendedTier || "STARTER"}`)
  }

  if (loading) {
    return <div className="text-center py-12">Cargando tu plan...</div>
  }

  const path = plan?.recommendedPath || IncomePath.PATH1
  const tier = plan?.recommendedTier || Tier.STARTER
  const pathInfo = INCOME_PATHS[path as keyof typeof INCOME_PATHS]
  const tierInfo = TIERS[tier as keyof typeof TIERS]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Tu Plan Personalizado</h1>
        <p className="text-lg text-gray-600">
          Basado en tus respuestas, te recomendamos:
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Camino Recomendado</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">{pathInfo.name}</h3>
            <p className="text-gray-600 mb-4">{pathInfo.description}</p>
            {pathInfo.pricingRange && (
              <p className="text-sm text-gray-500">
                Rango de precios: {pathInfo.pricingRange}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>Plan Recomendado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-3xl font-bold mb-2">
                {formatCurrency(tierInfo.price)}
              </div>
              <p className="text-gray-600">{tierInfo.description}</p>
            </div>
            <Button onClick={handleUnlock} className="w-full" size="lg">
              Desbloquear mi Plan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 30-Day Roadmap Preview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vista Previa del Reto de 30 Días</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Semana 1: Oferta + Fundaciones</h4>
              <p className="text-sm text-gray-600">
                Aprenderás a crear tu oferta, definir tu nicho, y establecer las bases de tu negocio con IA.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Semana 2: Prospección + Cierres</h4>
              <p className="text-sm text-gray-600">
                Técnicas de outreach, scripts de ventas, y cómo cerrar tu primer cliente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Semana 3: Entrega con IA (SOPs)</h4>
              <p className="text-sm text-gray-600">
                Sistemas operativos para entregar valor de forma escalable usando IA.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Semana 4: Retainers + Escala</h4>
              <p className="text-sm text-gray-600">
                Cómo convertir clientes en ingresos recurrentes y escalar tu operación.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Urgency CTA */}
      <Card className="bg-red-50 border-2 border-red-200 mb-8">
        <CardContent className="pt-6">
          <p className="text-center text-lg font-semibold text-red-800 mb-4">
            ⚠️ Únete ahora antes de que se agoten los cupos
          </p>
          <Button onClick={handleUnlock} className="w-full" size="lg">
            Comenzar Ahora
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-gray-500">
        {DISCLAIMER_TEXT}
      </p>
    </div>
  )
}

