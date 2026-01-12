"use client"

import { useState, useEffect, useRef } from "react"
import { Clock } from "lucide-react"

/**
 * Sistema de Urgencia Dinámica con FOMO y Escasez
 * 
 * Características:
 * - Inicia en 37 cupos (impar, específico)
 * - Bajadas de 1-3 cupos cada 5-15 minutos aleatorios
 * - A <10: Cambia a "¡Últimos cupos! 🔥" con animación
 * - A 0: Deshabilita CTA por 20-25 minutos con countdown
 * - Reset a número impar aleatorio entre 21-39
 * - Persistencia con localStorage
 * - Bajadas más rápidas al inicio (máximo FOMO)
 */

const URGENCY_CONFIG = {
  INITIAL_CUPS: 37,
  MIN_CUPS: 21,
  MAX_CUPS: 39,
  LOW_THRESHOLD: 10,
  MIN_INTERVAL_MINUTES: 5,
  MAX_INTERVAL_MINUTES: 15,
  MIN_DROP: 1,
  MAX_DROP: 3,
  RESET_WAIT_MIN_MINUTES: 20,
  RESET_WAIT_MAX_MINUTES: 25,
  // Probabilidad de bajar más rápido al inicio (primeros 20 cupos)
  FAST_DROP_PROBABILITY: 0.4, // 40% chance cada minuto cuando >20
  NORMAL_DROP_PROBABILITY: 0.15, // 15% chance cada minuto cuando <=20
}

type UrgencyState = {
  currentCups: number
  lastUpdate: number
  resetTime: number | null
  lowWarning: boolean
  isDisabled: boolean
}

export default function UrgencyCounter() {
  const [cups, setCups] = useState<number>(URGENCY_CONFIG.INITIAL_CUPS)
  const [lowWarning, setLowWarning] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [resetCountdown, setResetCountdown] = useState<number | null>(null)
  const [shouldShake, setShouldShake] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Inicializar desde localStorage o valores por defecto
  useEffect(() => {
    const loadState = (): UrgencyState => {
      if (typeof window === "undefined") {
        return {
          currentCups: URGENCY_CONFIG.INITIAL_CUPS,
          lastUpdate: Date.now(),
          resetTime: null,
          lowWarning: false,
          isDisabled: false,
        }
      }

      const stored = localStorage.getItem("urgencyState")
      if (stored) {
        try {
          const state: UrgencyState = JSON.parse(stored)
          // Validar que no sea muy viejo (más de 24 horas)
          const hoursSinceUpdate = (Date.now() - state.lastUpdate) / (1000 * 60 * 60)
          if (hoursSinceUpdate > 24) {
            // Reset si es muy viejo
            return {
              currentCups: URGENCY_CONFIG.INITIAL_CUPS,
              lastUpdate: Date.now(),
              resetTime: null,
              lowWarning: false,
              isDisabled: false,
            }
          }
          return state
        } catch {
          // Si hay error parseando, usar defaults
        }
      }

      return {
        currentCups: URGENCY_CONFIG.INITIAL_CUPS,
        lastUpdate: Date.now(),
        resetTime: null,
        lowWarning: false,
        isDisabled: false,
      }
    }

    const state = loadState()
    setCups(state.currentCups)
    setLowWarning(state.lowWarning)
    setIsDisabled(state.isDisabled)

    // Si está en modo reset (disabled), calcular countdown
    if (state.isDisabled && state.resetTime) {
      const remaining = Math.max(0, Math.ceil((state.resetTime - Date.now()) / 1000 / 60))
      if (remaining > 0) {
        setResetCountdown(remaining)
        startCountdown(state.resetTime)
      } else {
        // Ya pasó el tiempo, resetear
        resetCups()
      }
    } else {
      // Aplicar bajadas pendientes desde última actualización
      applyPendingDrops(state)
    }
  }, [])

  // Guardar estado en localStorage
  const saveState = (state: Partial<UrgencyState>) => {
    if (typeof window === "undefined") return

    const current = localStorage.getItem("urgencyState")
    const currentState: UrgencyState = current
      ? JSON.parse(current)
      : {
          currentCups: URGENCY_CONFIG.INITIAL_CUPS,
          lastUpdate: Date.now(),
          resetTime: null,
          lowWarning: false,
          isDisabled: false,
        }

    const newState: UrgencyState = {
      ...currentState,
      ...state,
      lastUpdate: Date.now(),
    }

    localStorage.setItem("urgencyState", JSON.stringify(newState))
  }

  // Aplicar bajadas pendientes desde última actualización
  const applyPendingDrops = (state: UrgencyState) => {
    const now = Date.now()
    const minutesSinceUpdate = (now - state.lastUpdate) / (1000 * 60)

    if (minutesSinceUpdate < 1) return // Muy reciente, no aplicar nada

    // Calcular cuántos intervalos pasaron (cada 5-15 min)
    const avgInterval = (URGENCY_CONFIG.MIN_INTERVAL_MINUTES + URGENCY_CONFIG.MAX_INTERVAL_MINUTES) / 2
    const intervalsPassed = Math.floor(minutesSinceUpdate / avgInterval)

    if (intervalsPassed > 0 && state.currentCups > 0) {
      let newCups = state.currentCups
      let totalDropped = 0

      // Aplicar bajadas con probabilidad más alta al inicio
      for (let i = 0; i < intervalsPassed && newCups > 0; i++) {
        const shouldDrop =
          newCups > 20
            ? Math.random() < URGENCY_CONFIG.FAST_DROP_PROBABILITY
            : Math.random() < URGENCY_CONFIG.NORMAL_DROP_PROBABILITY

        if (shouldDrop) {
          const dropAmount = Math.floor(
            Math.random() * (URGENCY_CONFIG.MAX_DROP - URGENCY_CONFIG.MIN_DROP + 1) +
              URGENCY_CONFIG.MIN_DROP
          )
          newCups = Math.max(0, newCups - dropAmount)
          totalDropped += dropAmount
        }
      }

      if (totalDropped > 0) {
        setCups(newCups)
        updateLowWarning(newCups)
        saveState({ currentCups: newCups, lowWarning: newCups < URGENCY_CONFIG.LOW_THRESHOLD })
      }
    }
  }

  // Actualizar estado de advertencia baja
  const updateLowWarning = (newCups: number) => {
    const isLow = newCups < URGENCY_CONFIG.LOW_THRESHOLD && newCups > 0
    setLowWarning(isLow)
  }

  // Bajar cupos
  const dropCups = () => {
    setCups((prev) => {
      if (prev <= 0) return prev

      // Calcular probabilidad basada en cupos restantes (más rápido al inicio)
      const dropProbability =
        prev > 20 ? URGENCY_CONFIG.FAST_DROP_PROBABILITY : URGENCY_CONFIG.NORMAL_DROP_PROBABILITY

      // Solo bajar si pasa la probabilidad
      if (Math.random() < dropProbability) {
        const dropAmount = Math.floor(
          Math.random() * (URGENCY_CONFIG.MAX_DROP - URGENCY_CONFIG.MIN_DROP + 1) +
            URGENCY_CONFIG.MIN_DROP
        )
        const newCups = Math.max(0, prev - dropAmount)

        // Animación shake
        setShouldShake(true)
        setTimeout(() => setShouldShake(false), 500)

        updateLowWarning(newCups)
        saveState({ currentCups: newCups, lowWarning: newCups < URGENCY_CONFIG.LOW_THRESHOLD })

        // Si llegó a 0, iniciar reset
        if (newCups === 0) {
          startReset()
        }

        return newCups
      }

      return prev
    })
  }

  // Iniciar proceso de reset
  const startReset = () => {
    setIsDisabled(true)
    const waitMinutes =
      Math.floor(
        Math.random() *
          (URGENCY_CONFIG.RESET_WAIT_MAX_MINUTES - URGENCY_CONFIG.RESET_WAIT_MIN_MINUTES + 1)
      ) + URGENCY_CONFIG.RESET_WAIT_MIN_MINUTES

    const resetTime = Date.now() + waitMinutes * 60 * 1000
    setResetCountdown(waitMinutes)
    saveState({ isDisabled: true, resetTime, currentCups: 0 })

    startCountdown(resetTime)
  }

  // Iniciar countdown
  const startCountdown = (targetTime: number) => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }

    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000 / 60))
      setResetCountdown(remaining)

      if (remaining === 0) {
        if (countdownRef.current) {
          clearInterval(countdownRef.current)
        }
        resetCups()
      }
    }, 1000) // Actualizar cada segundo
  }

  // Resetear cupos
  const resetCups = () => {
    // Generar número impar aleatorio entre MIN y MAX
    const randomEven = Math.floor(
      Math.random() * (URGENCY_CONFIG.MAX_CUPS - URGENCY_CONFIG.MIN_CUPS + 1) +
        URGENCY_CONFIG.MIN_CUPS
    )
    const newCups = randomEven % 2 === 0 ? randomEven + 1 : randomEven
    // Asegurar que esté en el rango
    const finalCups = Math.max(
      URGENCY_CONFIG.MIN_CUPS,
      Math.min(URGENCY_CONFIG.MAX_CUPS, newCups)
    )

    setCups(finalCups)
    setIsDisabled(false)
    setLowWarning(false)
    setResetCountdown(null)
    saveState({
      currentCups: finalCups,
      isDisabled: false,
      resetTime: null,
      lowWarning: false,
    })

    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }
  }

  // Interval principal: check cada minuto si debe bajar
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!isDisabled && cups > 0) {
        dropCups()
      }
    }, 60000) // Cada minuto

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [cups, isDisabled])

  // Deshabilitar CTAs cuando está disabled
  useEffect(() => {
    const ctas = document.querySelectorAll('[data-urgency-cta]')
    ctas.forEach((cta) => {
      if (isDisabled) {
        cta.classList.add("disabled")
        cta.setAttribute("disabled", "true")
        if (cta instanceof HTMLAnchorElement) {
          cta.style.pointerEvents = "none"
          cta.style.opacity = "0.6"
        }
      } else {
        cta.classList.remove("disabled")
        cta.removeAttribute("disabled")
        if (cta instanceof HTMLAnchorElement) {
          cta.style.pointerEvents = "auto"
          cta.style.opacity = "1"
        }
      }
    })
  }, [isDisabled])

  // Texto dinámico según estado
  const getUrgencyText = () => {
    if (cups === 0 && isDisabled) {
      return "Cupos agotados por alta demanda 🔥"
    }
    if (lowWarning) {
      return "¡Últimos cupos! 🔥"
    }
    return "Oferta Limitada"
  }

  const getCupsText = () => {
    if (cups === 0 && isDisabled) {
      return `¡Liberando más en ${resetCountdown || 0} minutos!`
    }
    return `Solo quedan ${cups} cupos`
  }

  const getSubtext = () => {
    if (cups === 0 && isDisabled) {
      return "No te quedes fuera."
    }
    if (lowWarning) {
      return "¡Apúrate! Se están agotando rápido"
    }
    return "Esta oferta expira pronto"
  }

  return (
    <>
      {/* CSS para animaciones */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        .urgency-shake {
          animation: shake 0.5s;
        }

        .urgency-low {
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
          border-color: #7f1d1d !important;
          box-shadow: 0 0 20px rgba(220, 38, 38, 0.5) !important;
        }

        .urgency-disabled {
          opacity: 0.7;
          filter: grayscale(0.3);
        }

        [data-urgency-cta].disabled {
          pointer-events: none !important;
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }
      `}</style>

      {/* Contador de cupos */}
      <div
        className={`bg-red-600 border-4 border-red-400 rounded-xl p-6 mb-8 max-w-md mx-auto shadow-2xl transition-all duration-300 ${
          shouldShake ? "urgency-shake" : ""
        } ${lowWarning ? "urgency-low" : ""} ${isDisabled ? "urgency-disabled" : ""}`}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Clock className="h-6 w-6 text-white animate-pulse" />
          <p className="text-white font-bold text-lg">{getUrgencyText()}</p>
        </div>
        <p className="text-4xl md:text-5xl font-bold text-white mb-2 text-center">
          {getCupsText()}
        </p>
        <p className="text-red-100 text-sm text-center">{getSubtext()}</p>
      </div>
    </>
  )
}





