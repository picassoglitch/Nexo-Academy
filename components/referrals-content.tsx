"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, CheckCircle2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function ReferralsContent({
  user,
  referralLink,
}: {
  user: any
  referralLink: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalCommissions = user.referralsGiven.reduce(
    (acc: number, ref: any) => acc + (ref.commissionAmount || 0),
    0
  )

  const paidCommissions = user.referralsGiven
    .filter((ref: any) => ref.status === "PAID")
    .reduce((acc: number, ref: any) => acc + (ref.commissionAmount || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Programa de Referidos</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tu Enlace de Referido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="flex-1" />
              <Button onClick={handleCopy}>
                {copied ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Comparte este enlace y gana comisiones cuando alguien se registre y compre un plan
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Comisiones Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrency(totalCommissions)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comisiones Pagadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrency(paidCommissions)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Referidos</CardTitle>
          </CardHeader>
          <CardContent>
            {user.referralsGiven.length === 0 ? (
              <p className="text-gray-600">Aún no tienes referidos</p>
            ) : (
              <div className="space-y-4">
                {user.referralsGiven.map((ref: any) => (
                  <div
                    key={ref.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{ref.referred.email}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(ref.createdAt).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(ref.commissionAmount)}</p>
                      <p
                        className={`text-sm ${
                          ref.status === "PAID" ? "text-green-600" : "text-yellow-600"
                        }`}
                      >
                        {ref.status === "PAID" ? "Pagado" : "Pendiente"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

