import { NextRequest, NextResponse } from "next/server"

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)

function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip")
  
  if (forwardedFor) return forwardedFor.split(",")[0].trim()
  if (cfConnectingIp) return cfConnectingIp
  if (realIp) return realIp
  return "127.0.0.1"
}

export function checkRateLimit(
  request: NextRequest,
  action: string,
  limit: number = 10,
  windowSeconds: number = 60
): { success: boolean; remaining: number; resetTime: number } {
  const clientId = getClientIdentifier(request)
  const key = `${action}:${clientId}`
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  
  const entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetTime <= now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, newEntry)
    return { success: true, remaining: limit - 1, resetTime: newEntry.resetTime }
  }
  
  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetTime: entry.resetTime }
  }
  
  entry.count++
  rateLimitStore.set(key, entry)
  return { success: true, remaining: limit - entry.count, resetTime: entry.resetTime }
}

export function rateLimitExceededResponse(resetTime: number): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
  
  return NextResponse.json(
    { error: "Demasiadas solicitudes. Por favor, espera.", retryAfter },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
      },
    }
  )
}

export const RATE_LIMITS = {
  login: { limit: 5, window: 60 },
  signup: { limit: 3, window: 60 },
  forgotPassword: { limit: 3, window: 300 },
  resendConfirmation: { limit: 3, window: 300 },
  createCheckout: { limit: 10, window: 60 },
  general: { limit: 100, window: 60 },
} as const

export type RateLimitAction = keyof typeof RATE_LIMITS