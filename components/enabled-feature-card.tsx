"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface EnabledFeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  badge?: string
  count?: number
}

export default function EnabledFeatureCard({
  title,
  description,
  icon,
  href,
  badge,
  count,
}: EnabledFeatureCardProps) {
  return (
    <Card className="group">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-semibold text-slate-900">
          <div className="p-1.5 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition-colors">
            {icon}
          </div>
          {title}
          {badge && (
            <Badge variant="default" className="ml-auto">
              {badge}
            </Badge>
          )}
          {count !== undefined && (
            <span className="ml-auto text-sm text-slate-500">({count})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">{description}</p>
        <Button asChild variant="outline" className="w-full">
          {title === "Comunidad" ? (
            <a href="https://discord.com/invite/KuVCRgKrpM" target="_blank" rel="noopener noreferrer">
              Acceder a Comunidad
            </a>
          ) : (
            <Link href={href}>
              {title === "Caminos" ? "Ver Caminos" : title === "Plantillas" ? "Ver Plantillas" : title === "Scripts" ? "Ver Scripts" : title === "Descargables" ? "Ver Recursos" : "Acceder"}
            </Link>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

