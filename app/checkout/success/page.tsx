"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SessionInfo {
  tier: string
  tierName: string
  userEmail: string
  userName: string | null
  isExistingUser: boolean
  hasSupabaseAccount: boolean
  needsAccountCreation: boolean
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const checkUserSession = async () => {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        setUser(currentUser)
        setIsLoggedIn(true)
        console.log("User is already logged in:", currentUser.email)
      }
    }
    checkUserSession()
  }, [])

  useEffect(() => {
    const fetchSessionInfo = async () => {
      if (!sessionId) {
        setLoading(false)
        return
      }

      // Wait for webhook to process payment (polling with retries)
      let retries = 0
      const maxRetries = 10
      const pollInterval = 1000 // 1 second

      const checkPaymentProcessed = async () => {
        try {
          const response = await fetch(`/api/stripe/get-session?session_id=${sessionId}`)
          const data = await response.json()

          if (response.ok && data.tierName) {
            // Verify payment was processed by webhook
            const verifyResponse = await fetch(`/api/stripe/verify-payment-processed?session_id=${sessionId}`)
            const verifyData = await verifyResponse.json()

            // If webhook hasn't processed yet but we have session data, try to update tier directly as fallback
            if (!verifyData.processed && retries >= 3) {
              console.log("Webhook hasn't processed yet, attempting direct tier update as fallback...")
              try {
                const updateResponse = await fetch(`/api/stripe/update-tier-from-session?session_id=${sessionId}`, {
                  method: "POST",
                })
                if (updateResponse.ok) {
                  console.log("✅ Tier updated directly from session")
                }
              } catch (updateError) {
                console.error("Error updating tier directly:", updateError)
              }
            }

            if (verifyData.processed || retries >= maxRetries) {
              setSessionInfo(data)
              setVerified(true)
              setLoading(false)
              return true
            }
          }

          retries++
          if (retries < maxRetries) {
            setTimeout(checkPaymentProcessed, pollInterval)
          } else {
            // Max retries reached, show anyway
            if (response.ok && data.tierName) {
              setSessionInfo(data)
              setVerified(true)
            }
            setLoading(false)
          }
        } catch (error) {
          console.error("Error fetching session info:", error)
          retries++
          if (retries < maxRetries) {
            setTimeout(checkPaymentProcessed, pollInterval)
          } else {
            setLoading(false)
          }
        }
      }

      checkPaymentProcessed()
    }

    fetchSessionInfo()
  }, [sessionId])

  const handleCreateAccount = async () => {
    if (!sessionInfo) return

    setCreatingAccount(true)

    try {
      // Generate a random password (user will be able to change it later)
      const tempPassword = Math.random().toString(36).slice(-12) + "A1!"

      const response = await fetch("/api/auth/create-account-after-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sessionInfo.userEmail,
          name: sessionInfo.userName,
          password: tempPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setAccountCreated(true)
        
        // Sign in the user
        const supabase = createClient()
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: sessionInfo.userEmail,
          password: tempPassword,
        })

        if (!signInError) {
          // Redirect to dashboard after successful login
          setTimeout(() => {
            router.push("/dashboard?payment=success&onboarding=complete")
          }, 1500)
        } else {
          // If sign in fails, redirect to login page
          router.push(`/login?email=${encodeURIComponent(sessionInfo.userEmail)}&payment=success`)
        }
      } else {
        alert(`Error: ${data.error || "No se pudo crear la cuenta"}`)
        setCreatingAccount(false)
      }
    } catch (error: any) {
      console.error("Error creating account:", error)
      alert(`Error: ${error.message || "Error desconocido"}`)
      setCreatingAccount(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando pago...</p>
        </div>
      </div>
    )
  }

  if (accountCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">¡Cuenta creada exitosamente!</h2>
          <p className="text-gray-600">Redirigiendo a tu dashboard...</p>
        </div>
      </div>
    )
  }

  const tierName = sessionInfo?.tierName || "tu plan"

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-3xl">¡Pago Recibido!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-gray-700">
              Tu pago ha sido procesado exitosamente. Ya tienes acceso como <strong>{tierName}</strong>.
            </p>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-yellow-800">⚠️ Confirmación de Email Requerida</h3>
              <p className="text-sm text-yellow-700">
                Hemos enviado un email de confirmación a <strong>{sessionInfo?.userEmail || "tu correo"}</strong>. 
                Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación para activar tu cuenta 
                y acceder a tu dashboard.
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                Si no recibes el email, revisa tu carpeta de spam o contacta a soporte.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎁 Bonus de Bienvenida</h3>
              <p className="text-sm text-gray-700">
                Descarga tu "Fast-Start Kit" con prompts y plantillas listas para usar.
                Disponible en tu dashboard después de confirmar tu email.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              {isLoggedIn ? (
                <Button 
                  onClick={() => {
                    router.push("/dashboard?payment=success")
                    router.refresh()
                  }}
                  size="lg" 
                  className="w-full sm:w-auto"
                >
                  Ir a mi Dashboard
                </Button>
              ) : (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/login">Ir a Iniciar Sesión</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

