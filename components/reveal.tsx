"use client"

import { ReactNode } from "react"
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll"
import { cn } from "@/lib/utils"

interface RevealProps {
  children: ReactNode
  delay?: number
  once?: boolean
  className?: string
  threshold?: number
}

export default function Reveal({
  children,
  delay = 0,
  once = true,
  className,
  threshold = 0.1,
}: RevealProps) {
  const { elementRef, isVisible } = useRevealOnScroll({ delay, once, threshold })

  // Check for reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <div
      ref={elementRef}
      className={cn(
        "transition-all duration-700 ease-out",
        prefersReducedMotion
          ? isVisible
            ? "opacity-100"
            : "opacity-0"
          : isVisible
            ? "opacity-100 translate-y-0 blur-0"
            : "opacity-0 translate-y-6 blur-[2px]",
        className
      )}
    >
      {children}
    </div>
  )
}





