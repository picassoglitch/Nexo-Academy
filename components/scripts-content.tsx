"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Lock, FileText } from "lucide-react"
import { Tier } from "@/lib/types"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function ScriptsContent({
  scripts,
  userTier,
}: {
  scripts: any[]
  userTier: Tier | null
}) {
  const canAccess = (script: any) => {
    if (!userTier) return false
    const tierOrder: Record<string, number> = { STARTER: 1, PRO: 2, OPERATOR: 3 }
    return (tierOrder[userTier as string] || 0) >= (tierOrder[script.requiredTier as string] || 0)
  }

  const getTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      STARTER: "Starter",
      PRO: "Pro",
      OPERATOR: "Operator",
    }
    return labels[tier] || tier
  }

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      STARTER: "bg-blue-500",
      PRO: "bg-purple-500",
      OPERATOR: "bg-orange-500",
    }
    return colors[tier] || "bg-gray-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Scripts y Automatizaciones</h1>
          <p className="text-lg text-gray-600">
            Scripts listos para usar en WhatsApp, email, outreach y más
          </p>
        </div>

        {scripts.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No hay scripts disponibles aún</p>
              <p className="text-sm text-gray-500">
                Los scripts aparecerán aquí una vez que estén disponibles.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script) => {
              const hasAccess = canAccess(script)
              const isLocked = !hasAccess

              return (
                <Card
                  key={script.id}
                  className={`relative transition-all duration-200 ease-out ${
                    isLocked
                      ? "opacity-75 border-gray-300"
                      : "hover:-translate-y-1 hover:shadow-lift border-border-soft"
                  }`}
                >
                  {isLocked && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-[1px] rounded-2xl z-10 flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-600 mb-1">
                          Requiere {getTierLabel(script.requiredTier)}
                        </p>
                        <Button asChild size="sm" variant="outline" className="mt-2">
                          <Link href="/pricing">Mejorar Plan</Link>
                        </Button>
                      </div>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl">{script.title}</CardTitle>
                      <Badge
                        className={`${getTierColor(script.requiredTier)} text-white text-xs`}
                      >
                        {getTierLabel(script.requiredTier)}
                      </Badge>
                    </div>
                    {script.description && (
                      <CardDescription className="text-sm line-clamp-2">
                        {script.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4" />
                        <span>Script</span>
                      </div>
                      {hasAccess && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="border-brand-300 text-brand-700 hover:bg-brand-50"
                        >
                          <a href={script.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}



