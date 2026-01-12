"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Save } from "lucide-react"

type TierConfig = {
  name: string
  displayName: string
  checkoutTier: string
  price: number
  priceDisplay: string
  incomeRange: string
  benefits: string[]
  bonuses: string[]
  icon: string
  color: string
}

type QuizConfigData = {
  tier_definitions?: Record<string, TierConfig>
  final_screen_settings?: {
    spotsLeftMin?: number
    spotsLeftMax?: number
    urgencyText?: string
  }
}

export default function QuizConfigAdmin({ initialConfig }: { initialConfig: QuizConfigData }) {
  const [config, setConfig] = useState<QuizConfigData>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string>("STARTER")

  // Initialize with default values if empty
  useEffect(() => {
    if (!config.tier_definitions) {
      setConfig({
        ...config,
        tier_definitions: {
          STARTER: {
            name: "STARTER",
            displayName: "Starter",
            checkoutTier: "STARTER",
            price: 29900,
            priceDisplay: "$299 MXN",
            incomeRange: "$5,000 - $15,000 MXN/mes",
            benefits: [
              "1 camino completo de ingresos (tu elección)",
              "Plantillas core descargables",
              "Scripts de WhatsApp básicos",
              "Acceso a comunidad privada",
              "Soporte por email",
            ],
            bonuses: ["Plantillas de propuestas", "Checklist de onboarding", "Guía de pricing México"],
            icon: "🚀",
            color: "blue",
          },
          CREATOR: {
            name: "CREATOR",
            displayName: "Creator",
            checkoutTier: "PRO",
            price: 99900,
            priceDisplay: "$999 MXN",
            incomeRange: "$15,000 - $30,000 MXN/mes",
            benefits: [
              "Todos los caminos de contenido y productos digitales",
              "Pipeline completo de 12 reels",
              "Plantillas avanzadas de contenido",
              "Bases de datos de afiliados México",
              "Acceso a comunidad PRO",
              "Soporte prioritario",
            ],
            bonuses: ["Calendario de contenido 30 días", "Templates de lead magnets", "SOPs de monetización"],
            icon: "✨",
            color: "purple",
          },
          FREELANCER: {
            name: "FREELANCER",
            displayName: "Freelancer",
            checkoutTier: "PRO",
            price: 99900,
            priceDisplay: "$999 MXN",
            incomeRange: "$15,000 - $50,000 MXN/mes",
            benefits: [
              "Caminos de servicios locales y consultoría",
              "Scripts completos de WhatsApp",
              "Flujos de automatización IG DMs",
              "CRM de prospectos (CSV + Notion)",
              "Discovery call scripts",
              "Acceso a comunidad PRO",
            ],
            bonuses: ["Pack completo de scripts WhatsApp", "SOP Hub Notion", "Templates de contratos"],
            icon: "💼",
            color: "green",
          },
          SCALER: {
            name: "SCALER",
            displayName: "Scaler",
            checkoutTier: "OPERATOR",
            price: 399900,
            priceDisplay: "$3,999 MXN",
            incomeRange: "$30,000+ MXN/mes",
            benefits: [
              "Todos los caminos (incluyendo SaaS)",
              "Workflows done-for-you",
              "Auditorías personalizadas de negocio",
              "Case studies reales y detallados",
              "Sesiones en vivo mensuales",
              "Acceso a comunidad OPERATOR",
              "Soporte VIP prioritario",
            ],
            bonuses: [
              "Done-for-you workflows completos",
              "Live session workbook",
              "Quality control checklist",
              "Mentoría 1:1 (opcional)",
            ],
            icon: "⚡",
            color: "orange",
          },
        },
        final_screen_settings: {
          spotsLeftMin: 15,
          spotsLeftMax: 35,
          urgencyText: "🔥 Solo quedan {spots} cupos para este camino",
        },
      })
    }
  }, [])

  const updateTier = (tierKey: string, field: keyof TierConfig, value: any) => {
    setConfig({
      ...config,
      tier_definitions: {
        ...config.tier_definitions,
        [tierKey]: {
          ...config.tier_definitions![tierKey],
          [field]: value,
        },
      },
    })
  }

  const addBenefit = (tierKey: string) => {
    const currentBenefits = config.tier_definitions![tierKey].benefits || []
    updateTier(tierKey, "benefits", [...currentBenefits, ""])
  }

  const removeBenefit = (tierKey: string, index: number) => {
    const currentBenefits = config.tier_definitions![tierKey].benefits || []
    updateTier(tierKey, "benefits", currentBenefits.filter((_, i) => i !== index))
  }

  const updateBenefit = (tierKey: string, index: number, value: string) => {
    const currentBenefits = [...(config.tier_definitions![tierKey].benefits || [])]
    currentBenefits[index] = value
    updateTier(tierKey, "benefits", currentBenefits)
  }

  const addBonus = (tierKey: string) => {
    const currentBonuses = config.tier_definitions![tierKey].bonuses || []
    updateTier(tierKey, "bonuses", [...currentBonuses, ""])
  }

  const removeBonus = (tierKey: string, index: number) => {
    const currentBonuses = config.tier_definitions![tierKey].bonuses || []
    updateTier(tierKey, "bonuses", currentBonuses.filter((_, i) => i !== index))
  }

  const updateBonus = (tierKey: string, index: number, value: string) => {
    const currentBonuses = [...(config.tier_definitions![tierKey].bonuses || [])]
    currentBonuses[index] = value
    updateTier(tierKey, "bonuses", currentBonuses)
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      // Save tier definitions
      await fetch("/api/admin/quiz-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "tier_definitions",
          value: config.tier_definitions,
        }),
      })

      // Save final screen settings
      await fetch("/api/admin/quiz-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "final_screen_settings",
          value: config.final_screen_settings,
        }),
      })

      alert("Configuración guardada exitosamente")
    } catch (error) {
      console.error("Error saving config:", error)
      alert("Error al guardar la configuración")
    } finally {
      setSaving(false)
    }
  }

  const tiers = config.tier_definitions ? Object.keys(config.tier_definitions) : []

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Quiz</h1>
          <p className="text-gray-600 mt-1">Gestiona los tiers, beneficios y pantalla final del quiz</p>
        </div>
        <Button onClick={saveConfig} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar Todo"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Tier Selector */}
        <div className="flex gap-2 border-b pb-4">
          {tiers.map((tier) => (
            <Button
              key={tier}
              variant="outline"
              onClick={() => setSelectedTier(tier)}
              className={selectedTier === tier ? "bg-blue-100" : ""}
            >
              {config.tier_definitions![tier]?.displayName || tier}
            </Button>
          ))}
        </div>

        {tiers.map((tierKey) => {
          const tier = config.tier_definitions![tierKey]
          if (!tier) return null

          return (
            <div key={tierKey} className={selectedTier === tierKey ? "block" : "hidden"}>
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Tier: {tier.displayName}</CardTitle>
                  <CardDescription>Edita los detalles que se mostrarán en la pantalla final del quiz</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre para mostrar</Label>
                      <Input
                        value={tier.displayName}
                        onChange={(e) => updateTier(tierKey, "displayName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Tier de checkout (STARTER, PRO, OPERATOR)</Label>
                      <Input
                        value={tier.checkoutTier}
                        onChange={(e) => updateTier(tierKey, "checkoutTier", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Precio (en centavos, ej: 29900 = $299)</Label>
                      <Input
                        type="number"
                        value={tier.price}
                        onChange={(e) => updateTier(tierKey, "price", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Precio para mostrar</Label>
                      <Input
                        value={tier.priceDisplay}
                        onChange={(e) => updateTier(tierKey, "priceDisplay", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Rango de ingresos</Label>
                      <Input
                        value={tier.incomeRange}
                        onChange={(e) => updateTier(tierKey, "incomeRange", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Icono (emoji)</Label>
                      <Input
                        value={tier.icon}
                        onChange={(e) => updateTier(tierKey, "icon", e.target.value)}
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label>Color (blue, purple, green, orange)</Label>
                      <Input
                        value={tier.color}
                        onChange={(e) => updateTier(tierKey, "color", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <Label className="text-lg font-semibold">Beneficios</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addBenefit(tierKey)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {tier.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={benefit}
                            onChange={(e) => updateBenefit(tierKey, idx, e.target.value)}
                            placeholder="Beneficio..."
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeBenefit(tierKey, idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bonuses */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <Label className="text-lg font-semibold">Bonuses Exclusivos</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addBonus(tierKey)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {tier.bonuses.map((bonus, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={bonus}
                            onChange={(e) => updateBonus(tierKey, idx, e.target.value)}
                            placeholder="Bonus..."
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeBonus(tierKey, idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Final Screen Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Configuración de la Pantalla Final</CardTitle>
          <CardDescription>Ajustes generales para la pantalla de resultados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Cupos mínimos</Label>
              <Input
                type="number"
                value={config.final_screen_settings?.spotsLeftMin || 15}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    final_screen_settings: {
                      ...config.final_screen_settings,
                      spotsLeftMin: parseInt(e.target.value) || 15,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>Cupos máximos</Label>
              <Input
                type="number"
                value={config.final_screen_settings?.spotsLeftMax || 35}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    final_screen_settings: {
                      ...config.final_screen_settings,
                      spotsLeftMax: parseInt(e.target.value) || 35,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>Texto de urgencia (usa {"{spots}"} para el número)</Label>
              <Input
                value={config.final_screen_settings?.urgencyText || "🔥 Solo quedan {spots} cupos para este camino"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    final_screen_settings: {
                      ...config.final_screen_settings,
                      urgencyText: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

