"use client"

import { Zap, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface XPCounterProps {
  xp: number
  level: number
  currentLevelXP: number
  nextLevelXP: number
}

export default function XPCounter({ xp, level, currentLevelXP, nextLevelXP }: XPCounterProps) {
  const progressPercentage = (currentLevelXP / nextLevelXP) * 100

  return (
    <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-orange-50 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-600">Nivel {level}</span>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>
              <Progress value={progressPercentage} className="h-2 mb-1" />
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{currentLevelXP} XP</span>
                <span>{nextLevelXP} XP</span>
              </div>
            </div>
          </div>
          <div className="ml-4 text-right">
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              {xp}
            </p>
            <p className="text-xs text-gray-600">XP Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



