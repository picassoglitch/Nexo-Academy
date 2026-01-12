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
 * IMPORTANT: Mexico always uses MXN, others get their local currency
 */
export function detectCurrencyFromRequest(request: Request): string {
  // Try Vercel's country header first (most reliable)
  const countryHeader = request.headers.get("x-vercel-ip-country") || 
                        request.headers.get("cf-ipcountry") || // Cloudflare
                        request.headers.get("x-country-code")
  
  if (countryHeader) {
    const country = countryHeader.toUpperCase()
    
    // Mexico always uses MXN
    if (country === "MX") {
      return "mxn"
    }
    
    // For other countries, use their local currency
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
      
      // Mexico always uses MXN
      if (country === "MX") {
        return "mxn"
      }
      
      const currency = COUNTRY_TO_CURRENCY[country]
      if (currency) {
        return currency
      }
    }
  }

  // Default to MXN (base currency for the site)
  return "mxn"
}

/**
 * Check if user is from Mexico
 */
export function isUserFromMexico(request: Request): boolean {
  const countryHeader = request.headers.get("x-vercel-ip-country") || 
                        request.headers.get("cf-ipcountry") || 
                        request.headers.get("x-country-code")
  
  if (countryHeader) {
    return countryHeader.toUpperCase() === "MX"
  }

  // Try Accept-Language header
  const acceptLanguage = request.headers.get("accept-language")
  if (acceptLanguage) {
    const localeMatch = acceptLanguage.match(/([a-z]{2})-([A-Z]{2})/i)
    if (localeMatch && localeMatch[2] === "MX") {
      return true
    }
  }

  return false
}

/**
 * Convert MXN amount to another currency (approximate rates)
 * For production, you should use a real-time exchange rate API
 */
export function convertMXNToCurrency(amountMXN: number, targetCurrency: string): number {
  // Approximate exchange rates (update these or use an API)
  const exchangeRates: Record<string, number> = {
    usd: 0.06, // 1 MXN ≈ 0.06 USD (approximate, update regularly)
    eur: 0.055,
    gbp: 0.047,
    cad: 0.08,
    ars: 50,
    clp: 55,
    cop: 240,
    pen: 0.22,
    brl: 0.30,
    jpy: 9,
    cny: 0.43,
    inr: 5,
  }

  const rate = exchangeRates[targetCurrency.toLowerCase()] || 0.06 // Default to USD rate
  return Math.round(amountMXN * rate)
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
export function formatCurrency(amount: number, currency: string = "mxn"): string {
  const symbol = getCurrencySymbol(currency)
  const amountInMainUnit = amount / 100 // Convert from cents/centavos
  
  // Format based on currency
  if (currency === "jpy" || currency === "krw") {
    // No decimals for JPY/KRW
    return `${symbol}${Math.round(amountInMainUnit).toLocaleString()}`
  }
  
  // For MXN, no decimals (e.g., $299 instead of $299.00)
  if (currency === "mxn") {
    return `${symbol}${Math.round(amountInMainUnit).toLocaleString("es-MX")}`
  }
  
  return `${symbol}${amountInMainUnit.toFixed(2)}`
}

/**
 * Format MXN price with conversion for non-Mexico users
 */
export function formatPriceWithConversion(amountMXN: number, userCurrency: string, isFromMexico: boolean): string {
  if (isFromMexico || userCurrency === "mxn") {
    return formatCurrency(amountMXN, "mxn")
  }
  
  // Convert and show both
  const convertedAmount = convertMXNToCurrency(amountMXN, userCurrency)
  const mxnDisplay = formatCurrency(amountMXN, "mxn")
  const convertedDisplay = formatCurrency(convertedAmount * 100, userCurrency) // Convert back to cents for formatting
  
  return `${convertedDisplay} (${mxnDisplay} MXN)`
}
