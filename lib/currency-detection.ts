/**
 * Currency detection utility
 * Detects user's currency based on their location/headers
 */

// Map of country codes to currency codes
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // Latin America
  MX: "mxn", // Mexico
  AR: "ars", // Argentina
  CL: "clp", // Chile
  CO: "cop", // Colombia
  PE: "pen", // Peru
  BR: "brl", // Brazil
  // Europe
  ES: "eur", // Spain
  FR: "eur", // France
  DE: "eur", // Germany
  IT: "eur", // Italy
  GB: "gbp", // United Kingdom
  // North America
  US: "usd", // United States
  CA: "cad", // Canada
  // Asia
  JP: "jpy", // Japan
  CN: "cny", // China
  IN: "inr", // India
  // Default to USD for unknown countries
}

/**
 * Detects currency from request headers
 * Uses Vercel's x-vercel-ip-country header or Accept-Language
 */
export function detectCurrencyFromRequest(request: Request): string {
  // Try Vercel's country header first (most reliable)
  const countryHeader = request.headers.get("x-vercel-ip-country") || 
                        request.headers.get("cf-ipcountry") || // Cloudflare
                        request.headers.get("x-country-code")
  
  if (countryHeader) {
    const country = countryHeader.toUpperCase()
    const currency = COUNTRY_TO_CURRENCY[country]
    if (currency) {
      return currency
    }
  }

  // Try Accept-Language header as fallback
  const acceptLanguage = request.headers.get("accept-language")
  if (acceptLanguage) {
    // Extract country from locale (e.g., "es-MX" -> "MX")
    const localeMatch = acceptLanguage.match(/([a-z]{2})-([A-Z]{2})/i)
    if (localeMatch) {
      const country = localeMatch[2]
      const currency = COUNTRY_TO_CURRENCY[country]
      if (currency) {
        return currency
      }
    }
  }

  // Default to USD
  return "usd"
}

/**
 * Get currency symbol for display
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    usd: "$",
    mxn: "$",
    eur: "€",
    gbp: "£",
    cad: "C$",
    ars: "$",
    clp: "$",
    cop: "$",
    pen: "S/",
    brl: "R$",
    jpy: "¥",
    cny: "¥",
    inr: "₹",
  }
  return symbols[currency.toLowerCase()] || "$"
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency)
  const amountInMainUnit = amount / 100 // Convert from cents
  
  // Format based on currency
  if (currency === "jpy" || currency === "krw") {
    // No decimals for JPY/KRW
    return `${symbol}${Math.round(amountInMainUnit).toLocaleString()}`
  }
  
  return `${symbol}${amountInMainUnit.toFixed(2)}`
}
