"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export function ActivationCodeInput() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    tierName?: string
    error?: string
    useCount?: number
  } | null>(null)
  const [applied, setApplied] = useState(false)

  const handleValidate = async () => {
    if (!code.trim()) return

    setValidating(true)
    setValidationResult(null)

    try {
      const response = await fetch("/api/activation/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })

      const data = await response.json()
      setValidationResult(data)
    } catch (error: any) {
      setValidationResult({
        valid: false,
        error: "Error al validar el código",
      })
    } finally {
      setValidating(false)
    }
  }

  const handleApply = async () => {
    if (!code.trim() || !validationResult?.valid) return

    setLoading(true)

    try {
      const response = await fetch("/api/activation/apply-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })

      const data = await response.json()

      if (response.ok) {
        setApplied(true)
        setValidationResult({
          valid: true,
          tierName: data.tierName,
        })
        // Refresh page after 2 seconds to show updated tier
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setValidationResult({
          valid: false,
          error: data.error || "Error al activar el código",
        })
      }
    } catch (error: any) {
      setValidationResult({
        valid: false,
        error: "Error al activar el código",
      })
    } finally {
      setLoading(false)
    }
  }

  if (applied && validationResult?.valid) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ¡Código Activado Exitosamente!
            </h3>
            <p className="text-green-700">
              Tu cuenta ahora tiene acceso a <strong>{validationResult.tierName}</strong>.
            </p>
            <p className="text-sm text-green-600 mt-2">
              Recargando página...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activar Código de Acceso</CardTitle>
        <p className="text-sm text-gray-600">
          Ingresa el código de activación que recibiste después de tu pago para activar tu plan.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="NEXO-XXXX-XXXX"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setValidationResult(null)
            }}
            className="font-mono text-center text-lg tracking-wider"
            maxLength={14}
          />
          <Button
            onClick={handleValidate}
            disabled={!code.trim() || validating || loading}
            variant="outline"
          >
            {validating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Validar"
            )}
          </Button>
        </div>

        {validationResult && (
          <div
            className={`p-4 rounded-lg ${
              validationResult.valid
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {validationResult.valid ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Código válido</span>
                </div>
                <p className="text-sm text-green-700">
                  Este código activará el plan: <strong>{validationResult.tierName}</strong>
                </p>
                {validationResult.useCount !== undefined && validationResult.useCount > 0 && (
                  <p className="text-xs text-green-600">
                    Este código ha sido usado {validationResult.useCount} vez(es)
                  </p>
                )}
                <Button
                  onClick={handleApply}
                  disabled={loading}
                  className="w-full mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Activando...
                    </>
                  ) : (
                    "Activar Código"
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="h-5 w-5" />
                <span>{validationResult.error || "Código inválido"}</span>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-gray-500">
          💡 Tip: El código tiene el formato NEXO-XXXX-XXXX. Puedes usarlo múltiples veces.
        </p>
      </CardContent>
    </Card>
  )
}
