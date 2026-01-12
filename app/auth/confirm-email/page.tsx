"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export const dynamic = "force-dynamic"

function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleConfirmation = async () => {
      const supabase = createClient()
      
      // Get the token from URL hash (Supabase puts it there)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get("access_token")
      const type = hashParams.get("type")

      if (accessToken && type === "signup") {
        try {
          // Set the session with the token
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || "",
          })

          if (sessionError) {
            throw sessionError
          }

          if (session?.user) {
            // Check if email is confirmed
            if (session.user.email_confirmed_at) {
              // Create Prisma account now that email is confirmed
              try {
                const response = await fetch("/api/auth/sync-user", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: session.user.email,
                    name: session.user.user_metadata?.name || null,
                    supabaseId: session.user.id,
                  }),
                })

                if (response.ok) {
                  setStatus("success")
                  setMessage("Tu email ha sido confirmado exitosamente. Tu cuenta ha sido activada.")
                  
                  // Redirect to dashboard after 2 seconds
                  setTimeout(() => {
                    router.push("/dashboard?email_confirmed=true")
                  }, 2000)
                } else {
                  // Try to get error details
                  const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
                  console.error("Error response from sync-user:", errorData)
                  
                  // Even if sync fails, try to continue - user might already exist
                  setStatus("success")
                  setMessage("Tu email ha sido confirmado. Redirigiendo al dashboard...")
                  
                  setTimeout(() => {
                    router.push("/dashboard?email_confirmed=true")
                  }, 2000)
                }
              } catch (err) {
                console.error("Error syncing user:", err)
                setStatus("error")
                setMessage("Tu email fue confirmado, pero hubo un error al activar tu cuenta. Por favor, intenta iniciar sesión.")
              }
            } else {
              setStatus("error")
              setMessage("El email no pudo ser confirmado. Por favor, intenta de nuevo.")
            }
          } else {
            setStatus("error")
            setMessage("No se pudo verificar la sesión. Por favor, intenta de nuevo.")
          }
        } catch (error: any) {
          console.error("Error confirming email:", error)
          setStatus("error")
          setMessage(error.message || "Error al confirmar el email. Por favor, intenta de nuevo.")
        }
      } else {
        // Check if already confirmed via query params
        const confirmed = searchParams.get("email_confirmed")
        if (confirmed === "true") {
          setStatus("success")
          setMessage("Tu email ya ha sido confirmado. Redirigiendo...")
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          setStatus("error")
          setMessage("Enlace de confirmación inválido o expirado.")
        }
      }
    }

    handleConfirmation()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {status === "loading" && "Confirmando Email..."}
            {status === "success" && "✓ Email Confirmado"}
            {status === "error" && "Error de Confirmación"}
          </CardTitle>
          <CardDescription className="text-center">
            {status === "loading" && "Por favor espera..."}
            {status === "success" && "Tu cuenta ha sido activada"}
            {status === "error" && "Hubo un problema"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Verificando tu email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded">
                <p>{message}</p>
              </div>
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Ir a mi Dashboard
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded">
                <p>{message}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => router.push("/login")} variant="outline" className="flex-1">
                  Iniciar Sesión
                </Button>
                <Button onClick={() => router.push("/resend-confirmation")} className="flex-1">
                  Reenviar Email
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
}
