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
import { Lock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { PlanType, PLAN_LABELS, PLAN_DESCRIPTIONS, TIER_TO_PLAN } from "@/lib/config/plans"

interface UpsellModalProps {
  isOpen: boolean
  onClose: () => void
  featureTitle: string
  featureDescription: string
  targetPlan: PlanType
  currentPlan?: PlanType | null
}

export default function UpsellModal({
  isOpen,
  onClose,
  featureTitle,
  featureDescription,
  targetPlan,
  currentPlan,
}: UpsellModalProps) {
  // Ensure targetPlan is always higher than currentPlan
  const planOrder: Record<PlanType, number> = { starter: 1, pro: 2, operator: 3 }
  const currentPlanOrder = currentPlan ? planOrder[currentPlan] : 0
  const targetPlanOrder = planOrder[targetPlan] || 0

  // If targetPlan is not higher than currentPlan, find the next available plan
  let finalTargetPlan = targetPlan
  if (targetPlanOrder <= currentPlanOrder) {
    if (currentPlanOrder < 1) finalTargetPlan = "starter"
    else if (currentPlanOrder < 2) finalTargetPlan = "pro"
    else if (currentPlanOrder < 3) finalTargetPlan = "operator"
    else finalTargetPlan = "operator" // Already at highest
  }

  const planLabel = PLAN_LABELS[finalTargetPlan]
  const planDescription = PLAN_DESCRIPTIONS[finalTargetPlan]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border-slate-200/60 shadow-lift">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-100 rounded-xl">
              <Lock className="h-6 w-6 text-brand-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-slate-900">{featureTitle}</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2 text-slate-600">
            {featureDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gradient-to-r from-brand-50 to-indigo-50 p-4 rounded-2xl border border-brand-200/60">
            <h3 className="font-semibold text-lg mb-1 text-slate-900">Disponible en {planLabel}</h3>
            <p className="text-sm text-slate-600">{planDescription}</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Tal vez después
          </Button>
          <Button asChild variant="primary" className="w-full sm:w-auto">
            <Link href={`/checkout?tier=${finalTargetPlan.toUpperCase()}`} onClick={onClose}>
              Mejorar a {planLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

