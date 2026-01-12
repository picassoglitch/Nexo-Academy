"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Check, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PlanFeature {
  text: string
  included: boolean
  badge?: string
}

export interface PlanCardProps {
  name: string
  price: number
  oldPrice?: number
  tagline?: string
  features: PlanFeature[]
  isPopular?: boolean
  ctaText: string
  ctaHref: string
  ctaVariant?: "primary" | "secondary"
  msiText?: string
  className?: string
}

export default function PlanCard({
  name,
  price,
  oldPrice,
  tagline,
  features,
  isPopular = false,
  ctaText,
  ctaHref,
  ctaVariant = "secondary",
  msiText,
  className,
}: PlanCardProps) {
  const formatPrice = (amount: number) => {
    // Amount is in centavos, convert to pesos
    const pesos = amount / 100
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(pesos)
  }

  return (
    <Card
      className={cn(
        "relative flex flex-col h-full",
        "bg-white/10 backdrop-blur-md border border-white/20",
        isPopular && "scale-[1.02] border-white/40 shadow-glow ring-2 ring-brand-400/30",
        className
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-yellow-400/90 to-orange-400/90 backdrop-blur-sm text-gray-900 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lift">
            <span className="text-sm">⭐</span>
            Más popular
          </div>
        </div>
      )}

      <CardHeader className="pb-4">
        {/* Plan Name */}
        <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>

        {/* Tagline */}
        {tagline && (
          <p className="text-sm text-white/80 mb-4 font-medium">{tagline}</p>
        )}

        {/* Price */}
        <div className="mb-2">
          {oldPrice && (
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-lg text-white/60 line-through">
                {formatPrice(oldPrice).replace("MX$", "$").replace(/\s/g, "")}
              </span>
            </div>
          )}
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl md:text-6xl font-bold text-white tracking-tight">
              {formatPrice(price).replace("MX$", "$").replace(/\s/g, "")}
            </span>
            <span className="text-sm text-white/70 ml-1">MXN</span>
          </div>
          {/* MSI Text */}
          {msiText && (
            <p className="text-sm text-white/80 text-center mt-2 font-medium">
              {msiText}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 pt-0">
        {/* Features List */}
        <ul className="space-y-3 mb-6 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2.5">
              {feature.included ? (
                <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <span className="h-5 w-5 text-white/40 mt-0.5 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs">✗</span>
                </span>
              )}
              <span
                className={cn(
                  "text-sm leading-relaxed",
                  feature.included
                    ? "text-white/90"
                    : "text-white/50 line-through"
                )}
              >
                {feature.text}
                {feature.badge && (
                  <span className="ml-2 bg-green-500/90 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    {feature.badge}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <div className="space-y-2">
          <Button
            asChild
            className={cn(
              "w-full h-12 text-base font-semibold transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600",
              ctaVariant === "primary"
                ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl"
                : "bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-sm"
            )}
            size="lg"
          >
            <Link href={ctaHref}>{ctaText}</Link>
          </Button>
          <p className="text-xs text-center text-white/60">
            Pago seguro • Acceso inmediato
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

