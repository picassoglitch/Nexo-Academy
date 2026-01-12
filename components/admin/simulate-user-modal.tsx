"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Play, RefreshCw } from "lucide-react"
// Quiz steps imported from quiz page structure

interface SimulateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onPathSelected?: (path: string) => void
  onSimulationComplete?: (answers: Record<string, string>) => void
}

// Simplified quiz steps for simulation
const SIMULATION_STEPS = [
  {
    id: "main-goal",
    question: "¿Cuál es tu principal objetivo con la inteligencia artificial?",
    options: [
      { value: "dinero", label: "Generar ingresos adicionales o principales" },
      { value: "habilidades", label: "Aprender nuevas habilidades profesionales" },
      { value: "negocio", label: "Hacer crecer o automatizar mi negocio" },
      { value: "curiosidad", label: "Satisfacer mi curiosidad y explorar posibilidades" },
    ],
  },
  {
    id: "experience-level",
    question: "¿Cuál es tu nivel de experiencia con inteligencia artificial?",
    options: [
      { value: "ninguna", label: "Ninguna, nunca he usado IA" },
      { value: "basica", label: "Básica, he usado ChatGPT o herramientas similares" },
      { value: "intermedia", label: "Intermedia, uso varias herramientas de IA regularmente" },
      { value: "avanzada", label: "Avanzada, creo prompts complejos o integro IA en mi trabajo" },
    ],
  },
  {
    id: "income-dream",
    question: "¿Qué te emociona más sobre ganar dinero con IA?",
    options: [
      { value: "libertad-tiempo", label: "Tener más tiempo libre y flexibilidad" },
      { value: "ingresos-pasivos", label: "Crear ingresos que funcionen mientras duermo" },
      { value: "independencia", label: "Ser mi propio jefe y trabajar desde donde quiera" },
      { value: "crecimiento-rapido", label: "Escalar rápido y generar más ingresos" },
      { value: "aprender-nuevo", label: "Aprender algo nuevo y estar a la vanguardia" },
    ],
  },
  {
    id: "interest-services",
    question: "¿Te interesa ofrecer servicios de IA a negocios locales?",
    options: [
      { value: "muy-interesado", label: "Muy interesado" },
      { value: "interesado", label: "Interesado" },
      { value: "poco-interesado", label: "Poco interesado" },
      { value: "no-interesado", label: "No me interesa" },
    ],
  },
  {
    id: "interest-content",
    question: "¿Te interesa crear contenido usando IA?",
    options: [
      { value: "muy-interesado", label: "Muy interesado" },
      { value: "interesado", label: "Interesado" },
      { value: "poco-interesado", label: "Poco interesado" },
      { value: "no-interesado", label: "No me interesa" },
    ],
  },
  {
    id: "time-available",
    question: "¿Cuántas horas por semana puedes dedicar?",
    options: [
      { value: "menos-2h", label: "Menos de 2 horas" },
      { value: "2-4h", label: "2-4 horas" },
      { value: "5-10h", label: "5-10 horas" },
      { value: "10-20h", label: "10-20 horas" },
      { value: "20h+", label: "Más de 20 horas" },
    ],
  },
]

function calculateTier(answers: Record<string, string>): string {
  const experience = answers["experience-level"]
  const timeAvailable = answers["time-available"]
  const interestServices = answers["interest-services"]
  const interestContent = answers["interest-content"]

  // SCALER logic
  if (experience === "avanzada" && timeAvailable === "20h+") {
    return "SCALER"
  }

  // FREELANCER logic
  if (interestServices === "muy-interesado" || interestServices === "interesado") {
    return "FREELANCER"
  }

  // CREATOR logic
  if (interestContent === "muy-interesado" || interestContent === "interesado") {
    return "CREATOR"
  }

  // Default
  return "STARTER"
}

export default function SimulateUserModal({ isOpen, onClose, onPathSelected, onSimulationComplete }: SimulateUserModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ tier: string; reasoning: string } | null>(null)

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    
    // Calculate result in real-time after each answer
    const tier = calculateTier(newAnswers)
    const reasoning = getReasoning(tier, newAnswers)
    const resultData = { tier, reasoning }
    setResult(resultData)
    
    // Notify parent component of path selection
    if (onPathSelected && tier) {
      onPathSelected(tier)
    }
    
    // Check if we've completed all questions
    if (currentStep >= SIMULATION_STEPS.length - 1) {
      // All questions answered, trigger completion
      if (onSimulationComplete) {
        onSimulationComplete(newAnswers)
      }
    }
    
    if (currentStep < SIMULATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const getReasoning = (tier: string, finalAnswers: Record<string, string>): string => {
    if (tier === "SCALER") {
      return "Experiencia avanzada con mucho tiempo disponible (20+ horas/semana)"
    }
    if (tier === "FREELANCER") {
      return "Interés claro en ofrecer servicios a negocios"
    }
    if (tier === "CREATOR") {
      return "Interés claro en crear contenido con IA"
    }
    return "Perfil estándar, ideal para empezar con el camino Starter"
  }

  const handleReset = () => {
    setCurrentStep(0)
    setAnswers({})
    setResult(null)
  }

  const currentQuestion = SIMULATION_STEPS[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Simular Usuario - ¿Qué-If?</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Responde las preguntas clave como si fueras un usuario. Verás en tiempo real qué camino se recomienda y por qué.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Real-time Result Preview */}
          {result && currentStep < SIMULATION_STEPS.length && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Resultado en tiempo real:</p>
                    <p className="font-semibold text-blue-900">Camino {result.tier}</p>
                  </div>
                  <Badge className="bg-blue-600">{result.tier}</Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">{result.reasoning}</p>
              </CardContent>
            </Card>
          )}

          {currentStep < SIMULATION_STEPS.length ? (
            <>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Pregunta {currentStep + 1} de {SIMULATION_STEPS.length}</span>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reiniciar
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentQuestion.options.map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => handleAnswer(currentQuestion.id, option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Resultado de la Simulación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Camino Recomendado:</p>
                  <Badge className="text-lg px-4 py-2">{result.tier}</Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Razonamiento:</p>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded-lg">
                    {result.reasoning}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Respuestas del Usuario:</p>
                  <div className="space-y-1">
                    {Object.entries(answers).map(([key, value]) => {
                      const question = SIMULATION_STEPS.find((s) => s.id === key)
                      const option = question?.options.find((o) => o.value === value)
                      return (
                        <div key={key} className="text-xs bg-white p-2 rounded">
                          <span className="font-medium">{question?.question}:</span>{" "}
                          <span className="text-gray-600">{option?.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Simular Otro Usuario
              </Button>
              <Button 
                onClick={() => {
                  if (onSimulationComplete && result) {
                    onSimulationComplete(answers)
                  }
                  onClose()
                }} 
                className="flex-1"
              >
                Ver en Árbol
              </Button>
            </div>
          </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

