"use client"

import { useMemo } from "react"

// Character component with smooth animations
const CHARACTER_STYLES = {
  container: "transition-all duration-300 ease-out",
  svg: "drop-shadow-lg",
}

interface QuizCharacterProps {
  section: string
  className?: string
}

// Character poses by section
const CHARACTER_VARIANTS = {
  Contexto: "thinking",
  Habilidades: "working",
  Intereses: "comparing",
  Barreras: "overcoming",
  Compromiso: "ready",
} as const

type CharacterVariant = typeof CHARACTER_VARIANTS[keyof typeof CHARACTER_VARIANTS]

export default function QuizCharacter({ section, className = "" }: QuizCharacterProps) {
  const variant = useMemo(() => {
    if (section.includes("Contexto")) return "thinking"
    if (section.includes("Habilidades")) return "working"
    if (section.includes("Intereses")) return "comparing"
    if (section.includes("Barreras")) return "overcoming"
    if (section.includes("Compromiso")) return "ready"
    return "thinking"
  }, [section])

  return (
    <div className={`quiz-character ${CHARACTER_STYLES.container} ${className}`}>
      <CharacterSVG variant={variant} />
    </div>
  )
}

function CharacterSVG({ variant }: { variant: CharacterVariant }) {
  // Modern editorial illustration style - semi-flat, professional
  // Neutral, inclusive, confident expressions

  switch (variant) {
    case "thinking":
      // Personaje reflexionando, explorando
      return (
        <svg
          viewBox="0 0 200 200"
          className={`w-full h-full ${CHARACTER_STYLES.svg}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Head */}
          <circle cx="100" cy="60" r="28" fill="#F4D03F" />
          {/* Hair */}
          <path
            d="M 75 50 Q 100 35 125 50 Q 130 40 120 35 Q 100 25 80 35 Q 70 40 75 50 Z"
            fill="#2C3E50"
          />
          {/* Body - sitting, leaning forward */}
          <ellipse cx="100" cy="140" rx="35" ry="45" fill="#3498DB" />
          {/* Arms - one hand on chin (thinking pose) */}
          <ellipse cx="75" cy="110" rx="8" ry="25" fill="#F4D03F" transform="rotate(-20 75 110)" />
          <ellipse cx="125" cy="110" rx="8" ry="25" fill="#F4D03F" transform="rotate(20 125 110)" />
          {/* Hand on chin */}
          <circle cx="85" cy="75" r="6" fill="#F4D03F" />
          {/* Legs - crossed */}
          <ellipse cx="90" cy="175" rx="10" ry="20" fill="#2C3E50" />
          <ellipse cx="110" cy="175" rx="10" ry="20" fill="#2C3E50" />
          {/* Thought bubble */}
          <circle cx="140" cy="50" r="12" fill="white" opacity="0.9" />
          <circle cx="150" cy="40" r="6" fill="white" opacity="0.7" />
          <circle cx="155" cy="30" r="4" fill="white" opacity="0.5" />
        </svg>
      )

    case "working":
      // Personaje trabajando con laptop/notas
      return (
        <svg
          viewBox="0 0 200 200"
          className={`w-full h-full ${CHARACTER_STYLES.svg}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Head */}
          <circle cx="100" cy="55" r="26" fill="#E8B4B8" />
          {/* Hair */}
          <path
            d="M 78 48 Q 100 32 122 48 Q 125 38 115 33 Q 100 23 85 33 Q 75 38 78 48 Z"
            fill="#1A1A1A"
          />
          {/* Body - sitting at desk */}
          <ellipse cx="100" cy="135" rx="32" ry="40" fill="#5DADE2" />
          {/* Arms - typing/working */}
          <ellipse cx="70" cy="115" rx="7" ry="22" fill="#E8B4B8" transform="rotate(-15 70 115)" />
          <ellipse cx="130" cy="115" rx="7" ry="22" fill="#E8B4B8" transform="rotate(15 130 115)" />
          {/* Laptop/desk */}
          <rect x="60" y="140" width="80" height="30" rx="4" fill="#34495E" opacity="0.8" />
          <rect x="65" y="145" width="70" height="20" rx="2" fill="#1A1A1A" />
          {/* Legs */}
          <ellipse cx="90" cy="170" rx="9" ry="18" fill="#2C3E50" />
          <ellipse cx="110" cy="170" rx="9" ry="18" fill="#2C3E50" />
          {/* Focus expression - slight smile */}
          <path d="M 90 65 Q 100 70 110 65" stroke="#2C3E50" strokeWidth="2" fill="none" />
        </svg>
      )

    case "comparing":
      // Personaje comparando opciones/caminos
      return (
        <svg
          viewBox="0 0 200 200"
          className={`w-full h-full ${CHARACTER_STYLES.svg}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Head */}
          <circle cx="100" cy="58" r="27" fill="#F7DC6F" />
          {/* Hair */}
          <path
            d="M 76 50 Q 100 33 124 50 Q 128 39 118 34 Q 100 24 82 34 Q 72 39 76 50 Z"
            fill="#1A1A1A"
          />
          {/* Body - standing, arms out */}
          <ellipse cx="100" cy="138" rx="34" ry="42" fill="#85C1E2" />
          {/* Arms - holding/pointing at options */}
          <ellipse cx="65" cy="120" rx="8" ry="28" fill="#F7DC6F" transform="rotate(-25 65 120)" />
          <ellipse cx="135" cy="120" rx="8" ry="28" fill="#F7DC6F" transform="rotate(25 135 120)" />
          {/* Hands pointing */}
          <circle cx="60" cy="100" r="5" fill="#F7DC6F" />
          <circle cx="140" cy="100" r="5" fill="#F7DC6F" />
          {/* Cards/options being compared */}
          <rect x="40" y="85" width="25" height="18" rx="2" fill="white" opacity="0.9" />
          <rect x="135" y="85" width="25" height="18" rx="2" fill="white" opacity="0.9" />
          {/* Legs */}
          <ellipse cx="90" cy="175" rx="10" ry="20" fill="#2C3E50" />
          <ellipse cx="110" cy="175" rx="10" ry="20" fill="#2C3E50" />
          {/* Curious expression */}
          <circle cx="92" cy="60" r="2" fill="#2C3E50" />
          <circle cx="108" cy="60" r="2" fill="#2C3E50" />
        </svg>
      )

    case "overcoming":
      // Personaje superando obstáculo (abstracto, positivo)
      return (
        <svg
          viewBox="0 0 200 200"
          className={`w-full h-full ${CHARACTER_STYLES.svg}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Head */}
          <circle cx="100" cy="60" r="28" fill="#F1948A" />
          {/* Hair */}
          <path
            d="M 74 50 Q 100 34 126 50 Q 130 39 120 34 Q 100 24 80 34 Q 70 39 74 50 Z"
            fill="#1A1A1A"
          />
          {/* Body - confident stance */}
          <ellipse cx="100" cy="140" rx="36" ry="44" fill="#7FB3D3" />
          {/* Arms - determined, pushing forward */}
          <ellipse cx="68" cy="115" rx="9" ry="26" fill="#F1948A" transform="rotate(-30 68 115)" />
          <ellipse cx="132" cy="115" rx="9" ry="26" fill="#F1948A" transform="rotate(30 132 115)" />
          {/* Legs - strong stance */}
          <ellipse cx="88" cy="175" rx="11" ry="22" fill="#2C3E50" />
          <ellipse cx="112" cy="175" rx="11" ry="22" fill="#2C3E50" />
          {/* Abstract obstacle (gentle curve) */}
          <path
            d="M 30 160 Q 100 140 170 160"
            stroke="#E8E8E8"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
            strokeDasharray="5,5"
          />
          {/* Confident expression */}
          <path d="M 88 70 Q 100 75 112 70" stroke="#2C3E50" strokeWidth="2.5" fill="none" />
        </svg>
      )

    case "ready":
      // Personaje avanzando, listo para empezar
      return (
        <svg
          viewBox="0 0 200 200"
          className={`w-full h-full ${CHARACTER_STYLES.svg}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Head */}
          <circle cx="100" cy="58" r="29" fill="#AED6F1" />
          {/* Hair */}
          <path
            d="M 73 48 Q 100 31 127 48 Q 132 37 122 32 Q 100 22 78 32 Q 68 37 73 48 Z"
            fill="#1A1A1A"
          />
          {/* Body - forward-leaning, ready */}
          <ellipse cx="105" cy="138" rx="35" ry="43" fill="#52BE80" />
          {/* Arms - one forward (pointing ahead) */}
          <ellipse cx="70" cy="118" rx="8" ry="27" fill="#AED6F1" transform="rotate(-35 70 118)" />
          <ellipse cx="135" cy="112" rx="8" ry="27" fill="#AED6F1" transform="rotate(10 135 112)" />
          {/* Hand pointing forward */}
          <circle cx="140" cy="95" r="6" fill="#AED6F1" />
          {/* Legs - walking forward */}
          <ellipse cx="95" cy="175" rx="10" ry="21" fill="#2C3E50" transform="rotate(-5 95 175)" />
          <ellipse cx="115" cy="175" rx="10" ry="21" fill="#2C3E50" transform="rotate(5 115 175)" />
          {/* Path/arrow ahead */}
          <path
            d="M 150 120 L 170 100 L 165 105 L 170 110 Z"
            fill="#52BE80"
            opacity="0.7"
          />
          {/* Confident, ready expression */}
          <path d="M 90 68 Q 100 73 110 68" stroke="#2C3E50" strokeWidth="3" fill="none" />
        </svg>
      )

    default:
      return null
  }
}

