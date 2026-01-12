"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function CouponsAdmin({ coupons: initialCoupons }: { coupons: any[] }) {
  const [coupons, setCoupons] = useState(initialCoupons)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENT",
    amount: 0,
    maxRedemptions: null as number | null,
    expiresAt: null as string | null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
      }),
    })

    if (response.ok) {
      const newCoupon = await response.json()
      setCoupons([newCoupon, ...coupons])
      setShowForm(false)
      setFormData({
        code: "",
        type: "PERCENT",
        amount: 0,
        maxRedemptions: null,
        expiresAt: null,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestión de Cupones</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cupón
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nuevo Cupón</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full mt-2 p-2 border rounded-md"
                  >
                    <option value="PERCENT">Porcentaje</option>
                    <option value="FIXED">Cantidad Fija (centavos)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount">
                    {formData.type === "PERCENT" ? "Porcentaje (0-100)" : "Cantidad (centavos)"}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="maxRedemptions">Redenciones Máximas (opcional)</Label>
                  <Input
                    id="maxRedemptions"
                    type="number"
                    value={formData.maxRedemptions || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxRedemptions: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="expiresAt">Fecha de Expiración (opcional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt || ""}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Crear</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{coupon.code}</h3>
                    <p className="text-sm text-gray-600">
                      {coupon.type === "PERCENT"
                        ? `${coupon.amount}% de descuento`
                        : `${formatCurrency(coupon.amount)} de descuento`}
                    </p>
                    <p className="text-sm text-gray-500">
                      Redenciones: {coupon.redeemedCount}
                      {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ""}
                    </p>
                    {coupon.expiresAt && (
                      <p className="text-sm text-gray-500">
                        Expira: {new Date(coupon.expiresAt).toLocaleDateString("es-MX")}
                      </p>
                    )}
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                        coupon.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {coupon.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

