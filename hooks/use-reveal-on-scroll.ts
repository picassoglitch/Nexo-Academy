"use client"

import { useEffect, useRef, useState } from "react"

interface UseRevealOnScrollOptions {
  delay?: number
  once?: boolean
  threshold?: number
  rootMargin?: string
}

export function useRevealOnScroll({
  delay = 0,
  once = true,
  threshold = 0.1,
  rootMargin = "0px 0px -50px 0px",
}: UseRevealOnScrollOptions = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // If reduced motion, show immediately without animation
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => {
                setIsVisible(true)
                if (once) setHasAnimated(true)
              }, delay)
            } else {
              setIsVisible(true)
              if (once) setHasAnimated(true)
            }

            if (once && hasAnimated) {
              observer.disconnect()
            }
          } else if (!once) {
            setIsVisible(false)
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [delay, once, threshold, rootMargin, hasAnimated])

  return { elementRef, isVisible }
}





