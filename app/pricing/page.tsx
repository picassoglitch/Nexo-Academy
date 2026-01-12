"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import PlanCard from "@/components/plan-card"
import { PLANS_DATA } from "@/lib/plans-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DISCLAIMER_TEXT } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic"

function PricingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPricing, setShowPricing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user completed quiz or if skipQuiz is true
    if (typeof window !== "undefined") {
      const skipQuiz = searchParams.get("skipQuiz") === "true"
      const quizCompleted = localStorage.getItem("quiz_completed") === "true"
      setShowPricing(skipQuiz || quizCompleted)
      setLoading(false)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!showPricing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12 px-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-center">
              Completa el Cuestionario Primero
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Para ver nuestros planes y precios, primero necesitas completar nuestro cuestionario personalizado.
            </p>
            <p className="text-gray-600">
              Esto nos ayuda a recomendarte el plan perfecto según tus objetivos y experiencia.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href="/quiz">Comenzar Cuestionario</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                Planes y Precios
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Elige el plan que mejor se adapte a tus objetivos
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Mobile: Show Pro first */}
              <div className="md:order-2 order-1">
                <PlanCard {...PLANS_DATA[1]} />
              </div>
              <div className="md:order-1 order-2">
                <PlanCard {...PLANS_DATA[0]} />
              </div>
              <div className="md:order-3 order-3">
                <PlanCard {...PLANS_DATA[2]} />
              </div>
            </div>

            {/* Urgency (Light, Non-Aggressive) */}
            <p className="text-center text-sm text-white/70 max-w-2xl mx-auto mb-4">
              Precio de lanzamiento por tiempo limitado. Los bonos pueden cambiar sin aviso.
            </p>

            {/* Disclaimer */}
            <p className="text-center text-sm text-white/60 max-w-2xl mx-auto">
              {DISCLAIMER_TEXT}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Preguntas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">¿Puedo cambiar de plan después?</h3>
              <p className="text-gray-600 text-sm">
                Sí, puedes hacer upgrade en cualquier momento desde tu dashboard.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">¿Hay garantía de ingresos?</h3>
              <p className="text-gray-600 text-sm">
                No. {DISCLAIMER_TEXT} Los resultados dependen de tu ejecución y esfuerzo.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-gray-600 text-sm">
                Aceptamos tarjetas, OXXO y SPEI a través de MercadoPago.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">¿Cuándo empiezo?</h3>
              <p className="text-gray-600 text-sm">
                Inmediatamente después del pago. Tendrás acceso instantáneo a todo el contenido.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Cargando...</div>}>
      <PricingContent />
    </Suspense>
  )
}
