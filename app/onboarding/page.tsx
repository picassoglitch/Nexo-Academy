"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export const dynamic = "force-dynamic"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    // Obtener email de la cookie o query param
    const email = searchParams.get("email") || ""
    setUserEmail(email)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Obtener el token de onboarding de la cookie
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("onboarding_token="))
        ?.split("=")[1]

      if (token) {
        // Actualizar contraseña usando el token de recovery
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        })

        if (updateError) {
          // Si falla con token, intentar con sesión actual
          console.log("Error with token, trying with session:", updateError)
        }
      }

      // Intentar actualizar contraseña directamente
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        // Si no hay sesión, intentar login con email y luego actualizar
        if (userEmail) {
          // Primero intentar sign in con magic link o password reset
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: password,
          })

          if (signInError) {
            // Si no puede hacer sign in, el usuario necesita usar el link de recovery
            setError(
              "Por favor, usa el link que te enviamos por email para establecer tu contraseña. Si no lo recibiste, contacta soporte."
            )
            setLoading(false)
            return
          }
        } else {
          setError("No se pudo identificar tu cuenta. Por favor, contacta soporte.")
          setLoading(false)
          return
        }
      } else {
        // Actualizar contraseña del usuario autenticado
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        })

        if (updateError) {
          setError(updateError.message || "Error al establecer la contraseña")
          setLoading(false)
          return
        }
      }

      setSuccess(true)

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push("/dashboard?onboarding=complete")
      }, 2000)
    } catch (err: any) {
      console.error("Error in onboarding:", err)
      setError(err.message || "Error al procesar tu solicitud")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">¡Contraseña establecida!</h2>
              <p className="text-gray-600">
                Tu cuenta está lista. Serás redirigido al dashboard en un momento...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Bienvenido a Nexo</CardTitle>
          <p className="text-center text-gray-600 mt-2">
            Establece tu contraseña para acceder a tu cuenta
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {userEmail && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Email:</strong> {userEmail}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="mt-2"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="mt-2"
                placeholder="Repite tu contraseña"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Establecer Contraseña"
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Al continuar, aceptas nuestros términos y condiciones
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Cargando...</div>}>
      <OnboardingContent />
    </Suspense>
  )
}
