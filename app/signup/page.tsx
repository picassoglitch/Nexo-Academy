"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [confirmationLink, setConfirmationLink] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Use our API endpoint that sends email via Resend
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setLoading(false)
        
        // If confirmation link is provided (fallback when email fails), store it
        if (data.confirmationLink) {
          setConfirmationLink(data.confirmationLink)
        }
      } else {
        setError(data.error || "Error al crear la cuenta. Por favor, intenta de nuevo.")
        setLoading(false)
      }
    } catch (err: any) {
      console.error("Error in signup:", err)
      setError("Error al crear la cuenta. Por favor, intenta de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
          <CardDescription className="text-center">
            Únete a Nexo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded mb-4 space-y-2">
              <p className="font-semibold">✓ Cuenta creada exitosamente</p>
              {confirmationLink ? (
                <>
                  <p className="text-sm">
                    <strong>⚠️ Nota:</strong> El email no pudo enviarse automáticamente. 
                    Por favor, haz clic en el enlace de abajo para confirmar tu email.
                  </p>
                  <div className="mt-3 p-3 bg-white rounded border border-green-300">
                    <p className="text-xs font-semibold mb-2">Enlace de Confirmación:</p>
                    <a 
                      href={confirmationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline break-all block"
                    >
                      {confirmationLink}
                    </a>
                    <Button
                      type="button"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => {
                        window.open(confirmationLink, '_blank')
                      }}
                    >
                      Abrir Enlace de Confirmación
                    </Button>
                  </div>
                  <p className="text-xs mt-2 text-gray-600">
                    O visita <Link href="/resend-confirmation" className="text-blue-600 hover:underline">/resend-confirmation</Link> para recibir el email.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm">
                    Hemos enviado un email de confirmación a <strong>{email}</strong>. 
                    Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace de confirmación 
                    para activar tu cuenta.
                  </p>
                  <p className="text-sm mt-2">
                    ¿No recibiste el email? Visita <Link href="/resend-confirmation" className="text-blue-600 hover:underline">/resend-confirmation</Link> para reenviarlo.
                  </p>
                </>
              )}
              <p className="text-sm mt-2">
                Una vez que confirmes tu email, podrás iniciar sesión y acceder a tu cuenta.
              </p>
            </div>
          )}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded">
                  {error}
                </div>
              )}
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2"
              />
            </div>
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
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 6 caracteres
              </p>
            </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>
          )}
          <p className="text-center text-sm text-gray-600 mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

