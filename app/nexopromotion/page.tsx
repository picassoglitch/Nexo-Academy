"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Zap, Target, Rocket, Shield } from "lucide-react"
import UrgencyCounter from "@/components/urgency-counter"
import PlanCard from "@/components/plan-card"
import { PLANS_DATA } from "@/lib/plans-data"
import { DISCLAIMER_TEXT } from "@/lib/constants"
import SimpleHeader from "@/components/simple-header"
import Reveal from "@/components/reveal"
import { useScrollProgress } from "@/hooks/use-scroll-progress"

export default function LandingPage() {
  const scrollProgress = useScrollProgress()

  return (
    <div className="min-h-screen bg-white">
      <SimpleHeader />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-hero text-white overflow-hidden">
        {/* Animated background spotlight */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% ${50 + scrollProgress * 20}%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)`,
            transition: "background 0.1s ease-out",
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Reveal delay={0}>
              <div className="inline-block bg-red-500/20 border border-red-400/50 rounded-full px-6 py-2 mb-6">
                <p className="text-sm font-semibold">Oferta limitada</p>
              </div>
            </Reveal>

            {/* Headline */}
            <Reveal delay={100}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold mb-6 leading-tight tracking-tight">
                Gana Dinero con Inteligencia Artificial en Solo 30 Días
              </h1>
            </Reveal>

            {/* Subheadline */}
            <Reveal delay={200}>
              <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto">
                Automatiza hasta el <span className="font-bold">95% del trabajo</span> y construye sistemas de ingresos reales.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Sin promesas vacías. Solo ejecución paso a paso.
              </p>
            </Reveal>

            {/* Urgency Counter */}
            <Reveal delay={400}>
              <div className="mb-8">
                <UrgencyCounter />
              </div>
            </Reveal>

            {/* Primary CTA */}
            <Reveal delay={500}>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xl md:text-2xl px-12 py-8 rounded-full shadow-glow font-bold"
              >
                <Link href="/quiz">Inscribirme Ahora — Empezar</Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What They Get - Execution Focus */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 tracking-tight text-slate-900">
                Lo Que Obtienes
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-6">
              <Reveal delay={0}>
                <Card className="group hover:ring-2 hover:ring-brand-400/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-brand-50 rounded-xl group-hover:bg-brand-100 transition-colors">
                        <Target className="h-6 w-6 text-brand-600 flex-shrink-0" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-slate-900">Sistemas Reales</h3>
                        <p className="text-base text-slate-600">
                          No teoría. Sistemas que funcionan en el mercado mexicano, probados y ejecutables desde el día 1.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              <Reveal delay={100}>
                <Card className="group hover:ring-2 hover:ring-brand-400/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-brand-50 rounded-xl group-hover:bg-brand-100 transition-colors">
                        <Zap className="h-6 w-6 text-brand-600 flex-shrink-0" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-slate-900">Casos Aplicables en México</h3>
                        <p className="text-base text-slate-600">
                          Ejemplos reales de negocios locales, precios en MXN, herramientas disponibles en México.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              <Reveal delay={200}>
                <Card className="group hover:ring-2 hover:ring-brand-400/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-brand-50 rounded-xl group-hover:bg-brand-100 transition-colors">
                        <Rocket className="h-6 w-6 text-brand-600 flex-shrink-0" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-slate-900">Paso a Paso</h3>
                        <p className="text-base text-slate-600">
                          Cada día tiene una acción clara. No adivinanzas. Sabes exactamente qué hacer y cómo hacerlo.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              <Reveal delay={300}>
                <Card className="group hover:ring-2 hover:ring-brand-400/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-brand-50 rounded-xl group-hover:bg-brand-100 transition-colors">
                        <CheckCircle2 className="h-6 w-6 text-brand-600 flex-shrink-0" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-slate-900">Enfoque en Acción Diaria</h3>
                        <p className="text-base text-slate-600">
                          Una lección por día durante 30 días. Ejecutas antes de optimizar. Cobras antes de perfeccionar.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-semibold mb-4 tracking-tight">
                  Elige Tu Plan
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  Cupos limitados esta semana
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Reveal delay={0}>
                <div className="md:order-1 order-1">
                  <PlanCard {...PLANS_DATA[0]} />
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div className="md:order-2 order-2">
                  <PlanCard {...PLANS_DATA[1]} />
                </div>
              </Reveal>
              <Reveal delay={200}>
                <div className="md:order-3 order-3">
                  <PlanCard {...PLANS_DATA[2]} />
                </div>
              </Reveal>
            </div>

            <Reveal delay={300}>
              <p className="text-center text-sm text-white/70 max-w-2xl mx-auto mb-4">
                Precio de lanzamiento por tiempo limitado. Los bonos pueden cambiar sin aviso.
              </p>
            </Reveal>

            <Reveal delay={400}>
              <p className="text-center text-sm text-white/60 max-w-2xl mx-auto">
                {DISCLAIMER_TEXT}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Credibility - Light */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Shield className="h-5 w-5" />
              <p className="text-sm font-medium">Hecho para el mercado mexicano</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">Contenido actualizado 2026</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Shield className="h-5 w-5" />
              <p className="text-sm font-medium">No afiliados, no humo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-12 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">
                Inicio
              </Link>
              <Link href="/#quienes-somos" className="hover:text-gray-900">
                Quiénes somos
              </Link>
              <Link href="/terminos" className="hover:text-gray-900">
                Términos
              </Link>
              <Link href="/aviso-legal" className="hover:text-gray-900">
                Aviso legal
              </Link>
            </div>
            <p className="text-center text-xs text-gray-500 mt-6">
              © 2026 Nexo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}



