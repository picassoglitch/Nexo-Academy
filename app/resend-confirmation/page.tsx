"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

function ResendConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Get email from query params if available
  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    if (!email) {
      setError("Por favor, ingresa tu email")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setError("")
      } else {
        setError(data.error || "Error al reenviar el email. Por favor, intenta de nuevo.")
      }
    } catch (error: any) {
      console.error("Error resending confirmation:", error)
      setError("Error al reenviar el email. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reenviar Email de Confirmación</CardTitle>
          <CardDescription className="text-center">
            Te enviaremos un nuevo enlace para confirmar tu email
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded mb-4 space-y-2">
              <p className="font-semibold">✓ Email enviado exitosamente</p>
              <p className="text-sm">
                Hemos enviado un nuevo email de confirmación a <strong>{email}</strong>. 
                Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace de confirmación.
              </p>
              <p className="text-sm mt-2">
                Si no recibes el email en unos minutos, verifica que el email sea correcto o intenta de nuevo.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="mt-2"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa el email con el que te registraste
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Reenviar Email de Confirmación"}
              </Button>
            </form>
          )}

          <div className="mt-6 space-y-2 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya confirmaste tu email?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Iniciar Sesión
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResendConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Cargando...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ResendConfirmationContent />
    </Suspense>
  )
}
