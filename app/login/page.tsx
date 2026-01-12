"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false)
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false)

  // Check if coming from password reset, unconfirmed email, or account not created
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get("password") === "reset") {
      setPasswordResetSuccess(true)
      // Clear the query parameter
      router.replace("/login", { scroll: false })
    } else if (searchParams.get("unconfirmed") === "true") {
      setError("Tu email no ha sido confirmado. Por favor, revisa tu bandeja de entrada y confirma tu email antes de acceder.")
      setIsEmailNotConfirmed(true)
      router.replace("/login", { scroll: false })
    } else if (searchParams.get("error") === "account_not_created") {
      setError("Tu cuenta no ha sido creada completamente. Por favor, confirma tu email primero haciendo clic en el enlace que te enviamos.")
      setIsEmailNotConfirmed(true)
      router.replace("/login", { scroll: false })
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setIsEmailNotConfirmed(false)

    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      // Check if error is related to email not confirmed
      const errorMessage = signInError.message.toLowerCase()
      const isEmailNotConfirmedError = 
        errorMessage.includes("email not confirmed") ||
        errorMessage.includes("email_not_confirmed") ||
        errorMessage.includes("correo no confirmado") ||
        errorMessage.includes("email address not confirmed")
      
      setIsEmailNotConfirmed(isEmailNotConfirmedError)
      setError(isEmailNotConfirmedError 
        ? "Tu email no ha sido confirmado. Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación."
        : signInError.message
      )
      setLoading(false)
    } else {
      // Check if user exists in Prisma database
      try {
        const checkResponse = await fetch("/api/auth/get-redirect")
        const checkData = await checkResponse.json()
        
        // If redirect is login, it means user doesn't exist in Prisma
        if (checkData.redirect === "/login" || checkData.error === "account_not_created") {
          setError("Tu cuenta no ha sido creada completamente. Por favor, confirma tu email primero haciendo clic en el enlace que te enviamos.")
          setIsEmailNotConfirmed(true)
          setLoading(false)
          return
        }
        
        // User exists, proceed to dashboard
        router.push(checkData.redirect || "/dashboard")
        router.refresh()
      } catch (err) {
        console.error("Error checking user:", err)
        // Fallback: try to go to dashboard, it will redirect if user doesn't exist
        router.push("/dashboard")
        router.refresh()
      }
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Accede a tu cuenta de Nexo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passwordResetSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-3 rounded mb-4">
              ✓ Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded space-y-2">
                <p>{error}</p>
                {isEmailNotConfirmed && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-xs text-red-700 mb-2">
                      ¿No recibiste el email de confirmación?
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (email) {
                          router.push(`/resend-confirmation?email=${encodeURIComponent(email)}`)
                        } else {
                          setError("Por favor, ingresa tu email primero")
                        }
                      }}
                      className="w-full text-xs"
                    >
                      Reenviar Email de Confirmación
                    </Button>
                  </div>
                )}
              </div>
            )}
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
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password">Contraseña</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    console.log("Navigating to forgot-password")
                    router.push("/forgot-password")
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-2"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

