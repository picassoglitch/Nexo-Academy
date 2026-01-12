"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Lock } from "lucide-react"
import { Tier } from "@/lib/types"
import Link from "next/link"

export default function TemplatesContent({
  assets,
  userTier,
}: {
  assets: any[]
  userTier: Tier | null
}) {
  const canAccess = (asset: any) => {
    if (!userTier) return false
    const tierOrder: Record<string, number> = { STARTER: 1, PRO: 2, OPERATOR: 3 }
    return (tierOrder[userTier as string] || 0) >= (tierOrder[asset.requiredTier as string] || 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Plantillas y Recursos</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => {
            const accessible = canAccess(asset)

            return (
              <Card key={asset.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {accessible ? (
                      <Download className="h-5 w-5 text-green-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                    {asset.title}
                  </CardTitle>
                  <CardDescription>
                    Requiere: {asset.requiredTier}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {asset.description && (
                    <p className="text-sm text-gray-600 mb-4">{asset.description}</p>
                  )}
                  {accessible ? (
                    <a
                      href={asset.fileUrl}
                      download
                      className="block"
                    >
                      <Button className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </Button>
                    </a>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/pricing">Desbloquear</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

