"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DISCLAIMER_TEXT } from "@/lib/constants"
import {
  BookOpen,
  CheckCircle2,
  Shield,
  Users,
  ArrowRight,
  Target,
  Zap,
  TrendingUp,
  Rocket,
  ChevronDown,
  ChevronUp,
  Lock,
  MessageSquare,
  Play,
  Mail,
  Sparkles,
  Award,
  Clock,
  Globe,
} from "lucide-react"
import MainHeader from "@/components/main-header"
import { PLANS_DATA } from "@/lib/plans-data"
import { useState, useEffect } from "react"
import Reveal from "@/components/reveal"
import NexusAvatar from "@/components/nexus-avatar"
import NexusLogo from "@/components/nexus-logo"

// FAQ Accordion Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">{question}</CardTitle>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent>
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </CardContent>
      )}
    </Card>
  )
}

const DEFAULT_CONFIG = {
  heroTitle: "Aprende a usar IA para generar ingresos reales, con guías probadas y una comunidad que te respalda",
  heroSubtitle: "Educación práctica enfocada en ejecución. Únete a cientos de emprendedores que ya están transformando ideas en negocios con IA.",
  heroCtaText: "Empieza a ganar dinero",
  heroCtaLink: "/quiz",
  heroSecondaryCtaText: "Ver Cómo Funciona",
  aboutTitle: "Somos un equipo de ingenieros en IA con experiencia real en startups",
  aboutDescription: "Hemos construido y escalado productos con IA que generan ingresos reales. Ahora compartimos ese conocimiento contigo.",
  aboutFeature1: "+10 años de experiencia en IA",
  aboutFeature2: "Productos escalados a miles de usuarios",
  aboutFeature3: "Con visión global y experiencia internacional",
  videoUrl: "",
  videoTitle: "Video: Conoce más sobre Nexo y nuestro enfoque",
  videoDescription: "",
}

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  useEffect(() => {
    // Load landing page config
    fetch("/api/admin/landing-page-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setConfig({ ...DEFAULT_CONFIG, ...data.config })
        }
      })
      .catch(() => {
        // Use defaults if error
      })
  }, [])

  const handleGuideSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Guide email:", email)
    alert("¡Gracias! Te enviaremos la guía gratis por email.")
    setEmail("")
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Newsletter email:", newsletterEmail)
    alert("¡Gracias por suscribirte!")
    setNewsletterEmail("")
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <MainHeader />

      {/* Hero Section - Mejorado */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-blue-50 via-white to-orange-50 overflow-hidden">
        {/* Background Illustration Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div>
                <Reveal delay={0}>
                  <h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-gray-900 leading-tight"
                    dangerouslySetInnerHTML={{
                      __html: config.heroTitle
                        .replace(/ingresos reales/g, '<span class="text-blue-600">ingresos reales</span>')
                        .replace(/comunidad que te respalda/g, '<span class="text-orange-500">comunidad que te respalda</span>')
                    }}
                  />
                </Reveal>
                <Reveal delay={100}>
                  <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                    {config.heroSubtitle}
                  </p>
                </Reveal>

                {/* CTAs */}
                <Reveal delay={200}>
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Button
                      asChild
                      size="lg"
                      className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <Link href={config.heroCtaLink}>{config.heroCtaText}</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-6 border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault()
                        scrollToSection("como-funciona")
                      }}
                    >
                      <Link href="/#como-funciona">{config.heroSecondaryCtaText}</Link>
                    </Button>
                  </div>
                </Reveal>
              </div>

              {/* Right: Lead Magnet Form */}
              <Reveal delay={300}>
                <Card className="border-2 border-blue-200 shadow-2xl bg-white">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-6 w-6" />
                      <CardTitle className="text-2xl font-bold">Guía Gratis de IA</CardTitle>
                    </div>
                    <p className="text-blue-100 mt-2">
                      Descubre cómo empezar a generar ingresos con IA en 7 días
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleGuideSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="hero-email" className="block text-sm font-medium text-gray-700 mb-2">
                          Tu email
                        </label>
                        <input
                          id="hero-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@email.com"
                          required
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 shadow-lg"
                        size="lg"
                      >
                        Descargar Guía Gratis
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Sin spam. Cancela cuando quieras. 100% gratis.
                      </p>
                    </form>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span>+2,500 descargas esta semana</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Quiénes Somos - Mejorado */}
      <section id="quienes-somos" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
                Quiénes Somos
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Avatar & Info */}
              <Reveal delay={0}>
                <div className="text-center md:text-left">
                  <div className="mx-auto md:mx-0 mb-6 flex justify-center md:justify-start">
                    <NexusAvatar size={160} className="shadow-xl" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {config.aboutTitle}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    {config.aboutDescription}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                      <span className="text-gray-700">{config.aboutFeature1}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                      <span className="text-gray-700">{config.aboutFeature2}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                      <span className="text-gray-700">{config.aboutFeature3}</span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Right: Video */}
              <Reveal delay={200}>
                {config.videoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video">
                    <iframe
                      src={config.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    {config.videoTitle && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                          {config.videoTitle}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 aspect-video">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-xl hover:scale-110">
                        <Play className="h-10 w-10 text-blue-600 ml-1" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                        {config.videoTitle}
                      </p>
                    </div>
                  </div>
                )}
              </Reveal>
            </div>

            <Reveal delay={300}>
              <div className="mt-12 space-y-4 text-gray-700 leading-relaxed max-w-3xl mx-auto">
                <p>
                  <strong className="text-gray-900">Nexo</strong> es un programa de ejecución, no de teoría. Es un sistema práctico que ha ayudado a emprendedores a generar <strong className="text-gray-900">más de $5,000 USD mensuales</strong>, construir negocios de <strong className="text-gray-900">6 cifras</strong> y desarrollar <strong className="text-gray-900">ingresos sostenibles</strong> utilizando inteligencia artificial aplicada al mercado.
                </p>
                <p>
                  Desde el día 1, trabajas sobre activos que pueden generar ingresos. El contenido está construido a partir de casos reales, incluyendo emprendedores que comenzaron desde $0 y lograron facturar entre <strong className="text-gray-900">$3,000 y $6,000 USD en menos de 90 días</strong>.
                </p>
                <p>
                  A lo largo del proceso aprendes <strong className="text-gray-900">5 modelos de ingreso probados</strong>, utilizando múltiples herramientas de AI, y sigues estrategias que han permitido escalar proyectos a <strong className="text-gray-900">seis cifras mensuales</strong>, en algunos casos, a <strong className="text-gray-900">millones de dólares anuales</strong>, sin equipos grandes ni inversiones iniciales elevadas.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Testimonials - Mejorado con Métricas */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
                Historias de Éxito Reales
              </h2>
              <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto text-lg">
                Emprendedores que están generando ingresos reales con IA
              </p>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  name: "María González",
                  city: "Buenos Aires",
                  role: "Emprendedora",
                  quote: "Con Nexo generé mis primeros $500 USD en 45 días. El sistema de chatbots para restaurantes funcionó perfecto. La comunidad me ayudó a ajustar mi estrategia de pricing.",
                  avatar: "M",
                  metric: "$500 USD",
                  metricLabel: "En 45 días",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  name: "Carlos Ramírez",
                  city: "Barcelona",
                  role: "Freelancer",
                  quote: "Automaticé el servicio al cliente de mi negocio y ahora tengo más tiempo para crecer. Los scripts fueron clave. Ya tengo 3 clientes recurrentes.",
                  avatar: "C",
                  metric: "3 clientes",
                  metricLabel: "Recurrentes",
                  color: "from-orange-500 to-orange-600",
                },
                {
                  name: "Ana Martínez",
                  city: "Madrid",
                  role: "Creadora de Contenido",
                  quote: "Empecé vendiendo productos digitales con IA. En 2 meses ya tenía ingresos recurrentes de $200 USD/mes. Los templates fueron exactamente lo que necesitaba.",
                  avatar: "A",
                  metric: "$200 USD/mes",
                  metricLabel: "Recurrentes",
                  color: "from-green-500 to-green-600",
                },
                {
                  name: "Roberto Sánchez",
                  city: "Lima",
                  role: "Consultor",
                  quote: "La comunidad me ayudó a ajustar mi estrategia. Ahora tengo 5 clientes recurrentes pagando $300 USD cada uno. El ROI fue increíble.",
                  avatar: "R",
                  metric: "$1,500 USD",
                  metricLabel: "Ingresos mensuales",
                  color: "from-purple-500 to-purple-600",
                },
              ].map((testimonial, index) => (
                <Reveal key={index} delay={index * 100}>
                  <Card className="h-full border-2 border-gray-200 hover:shadow-xl transition-shadow">
                    <CardContent className="pt-8">
                      <div className="flex items-start gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0`}>
                          {testimonial.avatar}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500">{testimonial.role} • {testimonial.city}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-6 italic text-lg">
                        "{testimonial.quote}"
                      </p>
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl font-bold bg-gradient-to-r ${testimonial.color} bg-clip-text text-transparent`}>
                            {testimonial.metric}
                          </span>
                          <span className="text-sm text-gray-500">{testimonial.metricLabel}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona - Mejorado con Iconos Grandes */}
      <section id="como-funciona" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                Cómo Funciona
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: BookOpen,
                  title: "1. Aprendes",
                  description: "Guías prácticas paso a paso. Contenido actualizado para 2026, aplicable a mercados globales.",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: Zap,
                  title: "2. Implementas",
                  description: "Cada lección incluye una acción concreta. Ejecutas antes de optimizar. Sin teoría innecesaria.",
                  color: "from-orange-500 to-orange-600",
                },
                {
                  icon: TrendingUp,
                  title: "3. Ajustas",
                  description: "Basado en resultados reales, optimizas lo que funciona y descartas lo que no. Con feedback de la comunidad.",
                  color: "from-green-500 to-green-600",
                },
                {
                  icon: Rocket,
                  title: "4. Escalas",
                  description: "Una vez que funciona, repites y escalas el sistema que creaste. Ingresos reales y sostenibles.",
                  color: "from-purple-500 to-purple-600",
                },
              ].map((step, index) => (
                <Reveal key={index} delay={index * 100}>
                  <Card className="text-center h-full border-2 border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1">
                    <CardContent className="pt-8 pb-8">
                      <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                        <step.icon className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-gray-900">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-base">{step.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - PRO Destacado */}
      <section id="programas" className="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
                Elige cómo quieres avanzar
              </h2>
              <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto text-lg">
                Planes diseñados para diferentes niveles de compromiso y objetivos
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-8 items-end mb-12">
              {PLANS_DATA.map((plan, index) => {
                const isPopular = plan.isPopular
                return (
                  <Reveal key={index} delay={index * 100}>
                    <Card
                      className={`relative flex flex-col h-full transition-all ${
                        isPopular
                          ? "border-2 border-orange-500 shadow-2xl scale-105 z-10 md:mt-0 mt-8"
                          : "border border-gray-200 shadow-lg"
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                          <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                            ⭐ Más popular
                          </span>
                        </div>
                      )}
                      <CardHeader className={`text-center pb-4 ${isPopular ? "bg-gradient-to-r from-orange-50 to-orange-100" : ""}`}>
                        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>
                        {plan.tagline && (
                          <p className="text-sm text-gray-600 mb-4">{plan.tagline}</p>
                        )}
                        <div className="mb-2">
                          {plan.oldPrice && (
                            <p className="text-sm text-gray-500 line-through mb-1">
                              ${plan.oldPrice} USD
                            </p>
                          )}
                          <p className={`text-5xl font-bold ${isPopular ? "text-orange-600" : "text-gray-900"}`}>
                            ${plan.price}
                            <span className="text-lg text-gray-600"> USD</span>
                          </p>
                          {plan.msiText && (
                            <p className="text-sm text-gray-600 mt-1">{plan.msiText}</p>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col pt-6">
                        <ul className="space-y-3 mb-8 flex-1">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              {feature.included ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <span className="h-6 w-6 text-gray-300 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                  <span className="text-xs">✗</span>
                                </span>
                              )}
                              <span
                                className={`text-base ${
                                  feature.included ? "text-gray-700" : "text-gray-400 line-through"
                                }`}
                              >
                                {feature.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          asChild
                          className={`w-full text-lg py-6 ${
                            isPopular
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                          size="lg"
                        >
                          <Link href={plan.ctaHref}>{plan.ctaText}</Link>
                        </Button>
                        {isPopular && (
                          <p className="text-center text-sm text-gray-600 mt-3">
                            <Clock className="h-4 w-4 inline mr-1" />
                            Acceso inmediato
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Reveal>
                )
              })}
            </div>

            <Reveal delay={300}>
              <div className="text-center space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Garantía 30 días</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Acceso inmediato</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Lock className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Pago seguro</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Pago seguro con Stripe • Sin compromiso • Cancela cuando quieras
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Por Qué Confiar - Mejorado */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                Por Qué Confiar en Nosotros
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: Target,
                  title: "Enfoque global",
                  description: "Todo el contenido está pensado para ser aplicable globalmente: casos reales, herramientas disponibles internacionalmente, estrategias probadas.",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: Zap,
                  title: "Ejecución Real",
                  description: "No teoría. Sistemas que puedes implementar desde el día 1, con resultados verificables.",
                  color: "from-orange-500 to-orange-600",
                },
                {
                  icon: Shield,
                  title: "Sin Afiliados",
                  description: "Todo el contenido es original. No promovemos productos de terceros ni recibimos comisiones.",
                  color: "from-green-500 to-green-600",
                },
                {
                  icon: Award,
                  title: "Contenido Actualizado",
                  description: "El programa se actualiza regularmente con las mejores prácticas y herramientas disponibles en 2026.",
                  color: "from-purple-500 to-purple-600",
                },
                {
                  icon: Users,
                  title: "Comunidad Moderada",
                  description: "Acceso a comunidad privada (según tu plan) donde puedes compartir avances y recibir apoyo.",
                  color: "from-pink-500 to-pink-600",
                },
                {
                  icon: Shield,
                  title: "Garantía 30 días",
                  description: "Si no estás satisfecho, te devolvemos tu dinero. Sin preguntas, sin complicaciones.",
                  color: "from-indigo-500 to-indigo-600",
                },
              ].map((item, index) => (
                <Reveal key={index} delay={index * 50}>
                  <Card className="h-full border-2 border-gray-200 hover:shadow-xl transition-all">
                    <CardContent className="pt-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-4`}>
                        <item.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>

            {/* Trust Badges */}
            <Reveal delay={300}>
              <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t-2 border-gray-200">
                <div className="flex items-center gap-2 text-gray-700">
                  <Lock className="h-6 w-6 text-green-600" />
                  <span className="font-semibold">Pago seguro</span>
                </div>
                <div className="text-gray-700 font-semibold">Stripe</div>
                <div className="text-gray-700 font-semibold">Stripe</div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <span className="font-semibold">SSL Encriptado</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Comunidad Activa - Acceso con Suscripción */}
      <section id="comunidad" className="py-20 md:py-28 bg-gradient-to-b from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
                Accede a Nuestra Comunidad Privada
              </h2>
            </Reveal>

            <div className="max-w-3xl mx-auto">
              <Reveal delay={0}>
                <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
                  <CardContent className="pt-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Comunidad Privada</h3>
                        <p className="text-sm text-gray-500">Incluida en tu suscripción</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                      Al unirte a Nexo, obtienes acceso inmediato a nuestra comunidad privada donde podrás compartir tus avances, hacer preguntas y recibir feedback de otros miembros. La comunidad está moderada y enfocada en resultados reales.
                    </p>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Acceso inmediato al unirte</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Comparte avances y recibe feedback</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">Comunidad moderada y activa</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl p-6 mb-6 border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <NexusAvatar size={48} />
                        <div>
                          <span className="font-bold text-gray-900">Juan P.</span>
                          <span className="text-sm text-gray-500 ml-2">• Miembro PRO</span>
                        </div>
                      </div>
                      <p className="text-gray-700 italic text-base">
                        "La comunidad me ayudó a ajustar mi estrategia de pricing. En una semana ya tenía mi primer cliente pagando $300 USD. El apoyo es increíble."
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                Preguntas Frecuentes
              </h2>
            </Reveal>
            <div className="space-y-4">
              <FAQItem
                question="¿Puedo cambiar de plan después?"
                answer="Sí, puedes hacer upgrade en cualquier momento desde tu dashboard. El precio se prorrateará automáticamente."
              />
              <FAQItem
                question="¿Hay garantía de ingresos?"
                answer="Cada persona obtiene resultados distintos según su nivel de compromiso y el mercado en el que ejecuta. En Nexo te damos un método claro, herramientas reales y una comunidad que apoya, para que tengas las mejores condiciones para avanzar y construir ingresos reales."
              />
              <FAQItem
                question="¿Qué métodos de pago aceptan?"
                answer="Aceptamos tarjetas de crédito/débito a través de Stripe. Todos los pagos son seguros y procesados de forma encriptada."
              />
              <FAQItem
                question="¿Cuándo empiezo?"
                answer="Inmediatamente después del pago. Tendrás acceso instantáneo a todo el contenido del plan que elijas, incluyendo las guías, plantillas y acceso a la comunidad (según tu plan)."
              />
              <FAQItem
                question="¿El contenido se actualiza?"
                answer="Sí. Actualizamos regularmente el contenido con las mejores prácticas y herramientas más recientes. Los miembros tienen acceso a todas las actualizaciones sin costo adicional."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final - Grande */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Reveal>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                ¿Listo para generar ingresos con IA de forma ética y práctica?
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-xl md:text-2xl mb-10 text-blue-100">
                Únete a cientos de emprendedores que ya están transformando ideas en negocios reales.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-7 shadow-2xl"
                >
                  <Link href="/quiz">Únete a Nexo hoy</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-7"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("programas")
                  }}
                >
                  <Link href="/#programas">Ver Planes</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="mb-4">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-white leading-tight">NEXUS</span>
                    <span className="text-xs font-medium text-white/80 leading-tight uppercase tracking-wide">Inteligencia Artificial</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">
                  Educación práctica en IA para generar ingresos reales.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-4">Programas</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/#programas" className="hover:text-white transition-colors">
                      Nexo
                    </Link>
                  </li>
                  <li>
                    <Link href="/#programas" className="hover:text-white transition-colors">
                      Precios
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-4">Información</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/#quienes-somos" className="hover:text-white transition-colors">
                      Quiénes Somos
                    </Link>
                  </li>
                  <li>
                    <Link href="/#como-funciona" className="hover:text-white transition-colors">
                      Cómo Funciona
                    </Link>
                  </li>
                  <li>
                    <Link href="/#comunidad" className="hover:text-white transition-colors">
                      Comunidad
                    </Link>
                  </li>
                  <li>
                    <Link href="/terminos" className="hover:text-white transition-colors">
                      Términos
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacidad" className="hover:text-white transition-colors">
                      Privacidad
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-4">Newsletter</h3>
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Suscribirse
                  </Button>
                </form>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-800 text-center text-sm">
              <p className="mb-2">© 2026 Nexo. Todos los derechos reservados.</p>
              <p className="text-gray-500">{DISCLAIMER_TEXT}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
