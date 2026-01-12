"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PlanFeature {
  text: string
  included: boolean
  badge?: string
}

export interface PlanOptionCardProps {
  name: string
  icon?: string
  tagline: string
  price: number
  oldPrice?: number
  currency?: string
  features: PlanFeature[]
  href: string
  onClick?: () => void
  variant?: "primary" | "secondary"
  isRecommended?: boolean
  msiText?: string
  className?: string
}

export default function PlanOptionCard({
  name,
  icon,
  tagline,
  price,
  oldPrice,
  currency = "MXN",
  features,
  href,
  onClick,
  variant = "secondary",
  isRecommended = false,
  msiText,
  className,
}: PlanOptionCardProps) {
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
        "bg-white border border-slate-200/60",
        "rounded-2xl",
        isRecommended && "ring-2 ring-brand-400/30 shadow-glow scale-[1.02]",
        className
      )}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg">
            Recomendado
          </div>
        </div>
      )}

      <CardHeader className="pb-4 pt-6">
        {/* Header: Icon + Name */}
        <div className="flex items-center gap-3 mb-2">
          {icon && <span className="text-3xl">{icon}</span>}
          <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
        </div>

        {/* Tagline */}
        <p className="text-sm text-gray-600 font-medium">{tagline}</p>

        {/* Recommended Message */}
        {isRecommended && (
          <p className="text-xs text-blue-600 font-medium mt-1">Mejor match por tu quiz</p>
        )}
      </CardHeader>

      <CardContent className="flex flex-col flex-1 pt-0 pb-6">
        {/* Features List */}
        <ul className="space-y-2.5 mb-6 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2.5">
              {feature.included ? (
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <span className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs">✗</span>
                </span>
              )}
              <span
                className={cn(
                  "text-sm leading-relaxed",
                  feature.included ? "text-gray-700" : "text-gray-400 line-through"
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

        {/* Price */}
        <div className="mb-4">
          {oldPrice && (
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(oldPrice).replace("MX$", "$").replace(/\s/g, "")}
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900 tracking-tight">
              {formatPrice(price).replace("MX$", "$").replace(/\s/g, "")}
            </span>
            <span className="text-sm text-gray-500 ml-1">{currency}</span>
          </div>
          {/* MSI Text */}
          {msiText && (
            <p className="text-sm text-gray-600 text-center mt-2 font-medium">
              {msiText}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <div className="space-y-2 mt-auto">
          <Button
            asChild
            className={cn(
              "w-full h-12 text-base font-semibold transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-offset-2",
              variant === "primary"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                : "bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-900 hover:border-gray-400",
              isRecommended && variant === "secondary" && "border-blue-500 text-blue-700 hover:bg-blue-50"
            )}
            size="lg"
            onClick={onClick}
          >
            <Link href={href}>Elegir {name}</Link>
          </Button>
          <p className="text-xs text-center text-gray-500">
            Acceso inmediato • Pago seguro
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

