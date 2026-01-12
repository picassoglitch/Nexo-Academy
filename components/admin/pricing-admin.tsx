"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const TIERS = [
  { key: "STARTER", label: "Starter", defaultPrice: 29900 },
  { key: "PRO", label: "Pro", defaultPrice: 99900 },
  { key: "OPERATOR", label: "Operator", defaultPrice: 399900 },
]

export default function PricingAdmin() {
  const [prices, setPrices] = useState({
    STARTER: 29900,
    PRO: 99900,
    OPERATOR: 399900,
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prices),
      })

      if (response.ok) {
        alert("Precios actualizados correctamente")
      } else {
        const error = await response.json()
        alert(error.error || "Error al guardar")
      }
    } catch (error) {
      alert("Error al guardar los precios")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestión de Precios</h1>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Precios
          </Button>
        </div>

        <div className="space-y-6">
          {TIERS.map((tier) => (
            <Card key={tier.key}>
              <CardHeader>
                <CardTitle>{tier.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`${tier.key}-price`}>Precio (en centavos MXN)</Label>
                    <Input
                      id={`${tier.key}-price`}
                      type="number"
                      value={prices[tier.key as keyof typeof prices]}
                      onChange={(e) =>
                        setPrices({
                          ...prices,
                          [tier.key]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Precio actual: {formatCurrency(prices[tier.key as keyof typeof prices])}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Resumen de Precios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {TIERS.map((tier) => (
                <div key={tier.key} className="flex justify-between items-center">
                  <span className="font-medium">{tier.label}:</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(prices[tier.key as keyof typeof prices])}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

