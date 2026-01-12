"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface StripeCheckoutProps {
  amount: number
  email: string
  name?: string
  tier: string
  couponCode?: string
  password?: string // Password for account creation after payment
  onError?: (error: any) => void
}

export function StripeCheckout({
  amount,
  email,
  name,
  tier,
  couponCode,
  password,
  onError,
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          email,
          name,
          tier,
          couponCode,
          password, // Pass password in metadata for account creation after payment
        }),
      })

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text.substring(0, 500))
        throw new Error("El servidor devolvió una respuesta inválida. Verifica que STRIPE_SECRET_KEY esté configurado y reinicia el servidor.")
      }

      const data = await response.json()

      if (!response.ok) {
        console.error("Checkout session creation failed:", data)
        const errorMessage = data.details || data.error || "Error al crear la sesión de pago"
        throw new Error(`${errorMessage}${data.type ? ` (${data.type})` : ""}${data.code ? ` [${data.code}]` : ""}`)
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No se recibió URL de checkout")
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error)
      setLoading(false)
      if (onError) {
        onError(error)
      } else {
        alert(`Error: ${error.message || "Error desconocido"}`)
      }
    }
  }

  return (
    <div className="w-full">
      <Button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Procesando...
          </>
        ) : (
          "Continuar con el pago"
        )}
      </Button>
      <p className="text-sm text-gray-600 mt-3 text-center">
        Serás redirigido a Stripe para completar el pago de forma segura
      </p>
    </div>
  )
}

