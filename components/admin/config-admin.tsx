"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TIERS } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"

export default function ConfigAdmin() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Configuración</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Precios de Tiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(TIERS).map(([key, tier]) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{tier.name}</p>
                  <p className="text-sm text-gray-600">{tier.description}</p>
                </div>
                <p className="text-xl font-bold">{formatCurrency(tier.price)}</p>
              </div>
            ))}
            <p className="text-sm text-gray-500">
              Nota: Los precios se configuran en el código. Para cambiar, edita lib/constants.ts
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="communityUrl">URL de Comunidad</Label>
              <Input
                id="communityUrl"
                defaultValue={process.env.NEXT_PUBLIC_COMMUNITY_URL || ""}
                placeholder="https://tu-comunidad.com"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Configura en variables de entorno: NEXT_PUBLIC_COMMUNITY_URL
              </p>
            </div>
            <div>
              <Label htmlFor="maxSpots">Cupos Máximos (Scarcity)</Label>
              <Input
                id="maxSpots"
                type="number"
                defaultValue="100"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usado para mostrar "Solo X cupos disponibles"
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horarios de Sesiones en Vivo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Configura los horarios de las sesiones en vivo para usuarios Operator.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Esta funcionalidad se puede implementar con un campo en la base de datos o
              configuración en variables de entorno.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

