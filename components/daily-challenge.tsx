"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, CheckCircle2, Play } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DailyChallengeProps {
  progress: {
    totalLessons: number
    completedLessons: number
    progressPercentage: number
    streak: number
  }
}

export default function DailyChallenge({ progress }: DailyChallengeProps) {
  // Mock: Daily challenge is to complete 1 lesson
  const dailyGoal = 1
  const todayCompleted = progress.completedLessons > 0 ? 1 : 0 // Simplified
  const isCompleted = todayCompleted >= dailyGoal

  return (
    <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center shadow-lg transition-all",
              isCompleted
                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                : "bg-gradient-to-br from-purple-500 to-orange-500"
            )}>
              {isCompleted ? (
                <CheckCircle2 className="h-8 w-8 text-white" />
              ) : (
                <Target className="h-8 w-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Desafío Diario</h3>
              <p className="text-sm text-gray-600 mb-2">
                Completa {dailyGoal} lección hoy
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      isCompleted
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 w-full"
                        : "bg-gradient-to-r from-purple-500 to-orange-500"
                    )}
                    style={{ width: `${(todayCompleted / dailyGoal) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  {todayCompleted}/{dailyGoal}
                </span>
              </div>
            </div>
          </div>
          {!isCompleted && (
            <Button
              asChild
              size="sm"
              className="ml-4 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
            >
              <Link href="/curso">
                <Play className="mr-1 h-4 w-4" />
                Comenzar
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

