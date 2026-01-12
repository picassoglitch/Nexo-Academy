"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import UpsellModal from "./upsell-modal"
import { FeatureKey, getLockedReason, getUserPlan } from "@/lib/access-control"
import type { User } from "@/lib/access-control"

interface LockedFeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  featureKey: FeatureKey
  user: User
  href?: string
}

export default function LockedFeatureCard({
  title,
  description,
  icon,
  featureKey,
  user,
  href,
}: LockedFeatureCardProps) {
  const [showUpsell, setShowUpsell] = useState(false)
  const lockedReason = getLockedReason(featureKey, user)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (lockedReason) {
      setShowUpsell(true)
    }
  }

  return (
    <>
      <Card className="opacity-75 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 font-semibold text-slate-700">
            <div className="text-slate-400">{icon}</div>
            <span>{title}</span>
            <Lock className="h-4 w-4 text-slate-400 ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-sm text-slate-600 mb-4">{description}</p>
          {lockedReason && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">{lockedReason.body}</p>
              <Button
                onClick={handleClick}
                variant="outline"
                className="w-full border-brand-300 text-brand-700 hover:bg-brand-50 hover:border-brand-400"
              >
                <Lock className="h-4 w-4 mr-2" />
                {lockedReason.ctaText}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {lockedReason && (
        <UpsellModal
          isOpen={showUpsell}
          onClose={() => setShowUpsell(false)}
          featureTitle={lockedReason.title}
          featureDescription={lockedReason.body}
          targetPlan={lockedReason.ctaPlan}
          currentPlan={getUserPlan(user)}
        />
      )}
    </>
  )
}

