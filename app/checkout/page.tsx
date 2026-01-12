"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TIERS } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { StripeCheckout } from "@/components/stripe-checkout"
import { PLANS_DATA } from "@/lib/plans-data"
import {
  Lock,
  CheckCircle2,
  Shield,
  CreditCard,
  ArrowRight,
  Sparkles,
  Users,
  Zap,
  Loader2,
} from "lucide-react"
import posthog from "posthog-js"

export const dynamic = "force-dynamic"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tier, setTier] = useState<string>("STARTER")
  const [coupon, setCoupon] = useState("")
  const [couponApplied, setCouponApplied] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [checkoutEmail, setCheckoutEmail] = useState("")

  useEffect(() => {
    const tierParam = searchParams.get("tier") || "STARTER"
    setTier(tierParam)
    const emailParam = searchParams.get("email")

    // Check if user is logged in
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        setCheckoutEmail(data.user.email || emailParam || "")
      } else {
        setUser(null)
        setCheckoutEmail(emailParam || "")
      }
    })
  }, [searchParams])

  const handleApplyCoupon = async () => {
    if (!coupon) return

    try {
      const response = await fetch(`/api/coupons/validate?code=${coupon}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()

      if (data.valid) {
        setCouponApplied(data.coupon)
      } else {
        alert("Cupón inválido o expirado")
      }
    } catch (error) {
      console.error("Error applying coupon:", error)
      alert("Error al validar el cupón. Intenta de nuevo.")
    }
  }

  const calculateTotal = () => {
    const tierInfo = TIERS[tier as keyof typeof TIERS]
    let total = tierInfo.price

    if (couponApplied) {
      if (couponApplied.type === "PERCENT") {
        total = total - (total * couponApplied.amount) / 100
      } else {
        total = total - couponApplied.amount
      }
    }

    return Math.max(0, total)
  }

  const tierInfo = TIERS[tier as keyof typeof TIERS]
  const planData = PLANS_DATA.find((p) => p.name.toUpperCase() === tier) || PLANS_DATA[0]
  const total = calculateTotal()
  const emailParam = searchParams.get("email")
  const nameParam = searchParams.get("name")

  // Initialize email from URL params if available
  useEffect(() => {
    if (emailParam && !checkoutEmail) {
      setCheckoutEmail(emailParam)
    }
  }, [emailParam])

  // Get key benefits for the selected plan
  const keyBenefits = planData.features
    .filter((f) => f.included)
    .slice(0, 5)
    .map((f) => f.text)

  // Calculate upgrade price if not Operator
  const showUpgrade = tier !== "OPERATOR"
  const upgradePrice = tier === "STARTER" ? 370000 : 300000 // $3,700 or $3,000 in cents

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Centrado */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Finalizar Compra Segura
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Lock className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Pago encriptado y protegido</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Resumen del Pedido (Sticky en desktop) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <Card className="border-2 border-gray-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Plan Info */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{tierInfo.name}</h3>
                      {planData.isPopular && (
                        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{tierInfo.description}</p>

                    {/* Key Benefits */}
                    <div className="space-y-2">
                      {keyBenefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm text-gray-600">Precio</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(tierInfo.price, "MXN")}
                      </span>
                    </div>
                    {couponApplied && (
                      <div className="flex items-center justify-between text-sm text-green-600 mb-2">
                        <span>Descuento ({couponApplied.code})</span>
                        <span>
                          -{formatCurrency(
                            couponApplied.type === "PERCENT"
                              ? (tierInfo.price * couponApplied.amount) / 100
                              : couponApplied.amount,
                            "MXN"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Coupon Field */}
                  <div className="border-t border-gray-200 pt-4">
                    <label htmlFor="coupon" className="text-sm font-medium text-gray-700 block mb-2">
                      ¿Tienes un cupón?
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="coupon"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="CUPON123"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        variant="outline"
                        className="whitespace-nowrap"
                      >
                        Aplicar
                      </Button>
                    </div>
                    {couponApplied && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Cupón aplicado: {couponApplied.code}
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-3xl font-bold text-blue-600">
                        {formatCurrency(total, "MXN")}
                      </span>
                    </div>
                    {planData.msiText && (
                      <p className="text-sm text-gray-600 mt-1 text-right">{planData.msiText}</p>
                    )}
                  </div>

                  {/* Upgrade Upsell */}
                  {showUpgrade && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                        <div className="flex items-start gap-2 mb-2">
                          <Sparkles className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              Upgrade a Operator
                            </p>
                            <p className="text-xs text-gray-600 mb-2">
                              Accede a plantillas profesionales, scripts y recursos avanzados
                            </p>
                            <p className="text-sm font-bold text-orange-600 mb-3">
                              Solo +{formatCurrency(upgradePrice, "MXN")}
                            </p>
                            <Button
                              asChild
                              size="sm"
                              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                              onClick={() => {
                                router.push(`/checkout?tier=OPERATOR&email=${checkoutEmail || ""}&name=${nameParam || ""}`)
                              }}
                            >
                              <span>Upgrade Ahora</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trust Section - Mobile/Desktop */}
              <div className="mt-6 space-y-4">
                {/* Guarantee */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Shield className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Garantía de 30 días</h4>
                        <p className="text-sm text-gray-700">
                          Acceso completo o te devolvemos tu dinero. Sin preguntas, sin complicaciones.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Testimonials */}
                <div className="space-y-3">
                  {[
                    {
                      quote: "¡Vale cada peso! Ya generé ingresos en mi primer mes.",
                      name: "María G.",
                      city: "CDMX",
                    },
                    {
                      quote: "La comunidad me ayudó a ajustar mi estrategia. Excelente inversión.",
                      name: "Carlos R.",
                      city: "Guadalajara",
                    },
                  ].map((testimonial, index) => (
                    <Card key={index} className="border-gray-200">
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-700 italic mb-2">"{testimonial.quote}"</p>
                        <p className="text-xs text-gray-500">
                          — {testimonial.name}, {testimonial.city}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Método de Pago */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">Método de Pago</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Stripe Logo & Info */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                      S
                    </div>
                    <span className="text-xl font-bold text-gray-900">Stripe</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Pago seguro procesado por Stripe. Aceptamos todas las tarjetas principales.
                  </p>

                  {/* Payment Method Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">Visa</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">Mastercard</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">Amex</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <span className="text-xs font-medium text-gray-700">+ Más</span>
                    </div>
                  </div>
                </div>

                {/* Payment - No account required, just email */}
                <div className="space-y-4">
                  {!user && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Puedes pagar sin cuenta.</strong> Después del pago recibirás un código de activación para crear tu cuenta y activar tu plan.
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="checkout-email">Email para el pago *</Label>
                    <Input
                      id="checkout-email"
                      type="email"
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="mt-2"
                      autoComplete="email"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Te enviaremos el código de activación a este email
                    </p>
                  </div>

                  <StripeCheckout
                    amount={total}
                    email={checkoutEmail}
                    name={nameParam || user?.user_metadata?.name || undefined}
                    tier={tier}
                    couponCode={coupon}
                    onError={(error) => {
                      console.error("Payment error:", error)
                      alert(`Error al procesar el pago: ${error?.message || "Error desconocido"}`)
                    }}
                  />
                </div>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Pago seguro</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Encriptado SSL</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Mercado Pago Oficial</span>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    Acceso inmediato tras el pago. Únete a la comunidad hoy.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Trust Elements - Desktop Only */}
            <div className="mt-6 hidden lg:block">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Acceso Inmediato</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Tan pronto como completes el pago, tendrás acceso instantáneo a todo el contenido del plan que elijas.
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Comunidad activa</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Contenido actualizado</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Cargando...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
