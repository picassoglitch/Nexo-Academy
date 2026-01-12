"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Check, X, ArrowRight } from "lucide-react"
import Link from "next/link"
import { PlanType, PLAN_CONFIG, PLAN_LABELS, PLAN_DESCRIPTIONS } from "@/lib/config/plans"

interface PlanComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan?: PlanType | null
}

export default function PlanComparisonModal({
  isOpen,
  onClose,
  currentPlan,
}: PlanComparisonModalProps) {
  const plans: PlanType[] = ["starter", "pro", "operator"]
  const features: Array<{ key: string; label: string }> = [
    { key: "paths:single", label: "1 Camino a Elección" },
    { key: "paths:all", label: "Todos los Caminos" },
    { key: "community", label: "Comunidad Privada" },
    { key: "templates", label: "Plantillas" },
    { key: "scripts", label: "Scripts" },
    { key: "downloads", label: "Recursos Descargables" },
    { key: "sops", label: "SOPs" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Comparar Planes</DialogTitle>
          <DialogDescription>
            Elige el plan que mejor se adapte a tus necesidades
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b font-semibold">Feature</th>
                  {plans.map((plan) => (
                    <th
                      key={plan}
                      className={`text-center p-3 border-b font-semibold ${
                        currentPlan === plan ? "bg-blue-50" : ""
                      }`}
                    >
                      {PLAN_LABELS[plan]}
                      {currentPlan === plan && (
                        <span className="block text-xs text-blue-600 font-normal mt-1">(Tu plan)</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => (
                  <tr key={feature.key} className="border-b">
                    <td className="p-3">{feature.label}</td>
                    {plans.map((plan) => {
                      const hasFeature = PLAN_CONFIG[plan].features[feature.key as keyof typeof PLAN_CONFIG[typeof plan]["features"]]
                      return (
                        <td key={plan} className="text-center p-3">
                          {hasFeature ? (
                            <Check className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan}
                className={`p-4 border rounded-lg ${
                  currentPlan === plan ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                <h3 className="font-semibold text-lg mb-2">{PLAN_LABELS[plan]}</h3>
                <p className="text-sm text-gray-600 mb-4">{PLAN_DESCRIPTIONS[plan]}</p>
                {currentPlan !== plan && (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/checkout?tier=${plan.toUpperCase()}&skipQuiz=true`} onClick={onClose}>
                      {currentPlan ? "Mejorar" : "Elegir"} {PLAN_LABELS[plan]}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



