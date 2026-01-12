"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle2, Gift, Mail } from "lucide-react"

interface EmailSubscriptionFormProps {
  source?: string
  title?: string
  subtitle?: string
  buttonText?: string
  successMessage?: string
  className?: string
  variant?: "default" | "compact" | "hero"
}

export function EmailSubscriptionForm({
  source = "website",
  title = "Obten tu regalo gratis!",
  subtitle = "Suscribete y recibe nuestro PDF exclusivo con tips de IA",
  buttonText = "Obtener PDF Gratis",
  successMessage = "Listo! Revisa tu email para descargar tu regalo",
  className = "",
  variant = "default",
}: EmailSubscriptionFormProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError("Por favor ingresa tu email"); return }
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source }),
      })
      const data = await response.json()
      if (response.ok) { setSuccess(true); setEmail(""); setName("") }
      else { setError(data.error || "Error al suscribirse") }
    } catch (err) {
      setError("Error de conexion")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={`text-center p-6 bg-green-50 rounded-lg border border-green-200 ${className}`}>
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">Gracias por suscribirte!</h3>
        <p className="text-green-700">{successMessage}</p>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" required />
        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : buttonText}</Button>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </form>
    )
  }

  if (variant === "hero") {
    return (
      <div className={`bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-full"><Gift className="h-8 w-8" /></div>
          <div><h3 className="text-2xl font-bold">{title}</h3><p className="text-purple-200">{subtitle}</p></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input type="text" placeholder="Tu nombre (opcional)" value={name} onChange={(e) => setName(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/60" />
            <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/60" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-white text-purple-700 hover:bg-purple-50 font-semibold py-6 text-lg">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Mail className="h-5 w-5 mr-2" />{buttonText}</>}
          </Button>
          {error && <p className="text-red-300 text-sm text-center">{error}</p>}
          <p className="text-xs text-center text-purple-200">Sin spam. Puedes cancelar cuando quieras.</p>
        </form>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 border ${className}`}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4"><Gift className="h-8 w-8 text-purple-600" /></div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input type="text" placeholder="Tu nombre (opcional)" value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Mail className="h-5 w-5 mr-2" />{buttonText}</>}
        </Button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <p className="text-xs text-center text-gray-500">Sin spam. Puedes cancelar cuando quieras.</p>
      </form>
    </div>
  )
}
