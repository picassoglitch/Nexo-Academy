/**
 * Generate a unique activation code
 * Format: NEXO-XXXX-XXXX (e.g., NEXO-A3B7-K9M2)
 */
export function generateActivationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Removed confusing chars: 0, O, I, 1
  const segments = [4, 4] // Two segments of 4 characters
  
  const segmentsArray = segments.map(length => {
    let segment = ""
    for (let i = 0; i < length; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return segment
  })
  
  return `NEXO-${segmentsArray.join("-")}`
}

/**
 * Validate activation code format
 */
export function isValidActivationCodeFormat(code: string): boolean {
  const pattern = /^NEXO-[A-Z0-9]{4}-[A-Z0-9]{4}$/
  return pattern.test(code)
}
