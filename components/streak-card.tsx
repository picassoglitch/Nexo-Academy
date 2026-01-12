"use client"

import { Flame } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StreakCardProps {
  streak: number
}

export default function StreakCard({ streak }: StreakCardProps) {
  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-lg hover:shadow-xl transition-all">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Flame className="h-10 w-10 text-white" />
            </div>
            {streak > 0 && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-white text-xs font-bold">{streak}</span>
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{streak} días</p>
          <p className="text-sm text-gray-600">
            {streak === 0
              ? "Comienza tu racha hoy"
              : streak === 1
                ? "¡Buen comienzo!"
                : streak < 7
                  ? "¡Sigue así!"
                  : "¡Racha increíble!"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}



