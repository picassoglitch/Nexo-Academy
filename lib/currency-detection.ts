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
 * IMPORTANT: Always returns MXN - this is our base currency
 * Stripe will handle currency conversion display for non-Mexico users
 */
export function detectCurrencyFromRequest(request: Request): string {
  // Always return MXN - this is our base currency
  // Stripe checkout will display in MXN for all users
  // For non-Mexico users, Stripe may show conversion, but charge is in MXN
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
 * Convert MXN amount (in centavos) to another currency (in cents/centavos)
 * For production, you should use a real-time exchange rate API
 * 
 * @param amountMXN - Amount in MXN centavos
 * @param targetCurrency - Target currency code
 * @returns Amount in target currency's smallest unit (cents/centavos)
 */
export function convertMXNToCurrency(amountMXN: number, targetCurrency: string): number {
  // Convert centavos to pesos first
  const pesosMXN = amountMXN / 100
  
  // Approximate exchange rates (update these regularly or use an API)
  // Rates are: 1 MXN = X targetCurrency
  const exchangeRates: Record<string, number> = {
    usd: 0.06, // 1 MXN ≈ 0.06 USD (approximate, update regularly)
    eur: 0.055, // 1 MXN ≈ 0.055 EUR
    gbp: 0.047, // 1 MXN ≈ 0.047 GBP
    cad: 0.08, // 1 MXN ≈ 0.08 CAD
    ars: 50, // 1 MXN ≈ 50 ARS
    clp: 55, // 1 MXN ≈ 55 CLP
    cop: 240, // 1 MXN ≈ 240 COP
    pen: 0.22, // 1 MXN ≈ 0.22 PEN
    brl: 0.30, // 1 MXN ≈ 0.30 BRL
    jpy: 9, // 1 MXN ≈ 9 JPY
    cny: 0.43, // 1 MXN ≈ 0.43 CNY
    inr: 5, // 1 MXN ≈ 5 INR
  }

  const rate = exchangeRates[targetCurrency.toLowerCase()] || 0.06 // Default to USD rate
  
  // Convert pesos to target currency
  const targetAmount = pesosMXN * rate
  
  // Convert back to cents/centavos (smallest unit)
  // For JPY, no decimals, so round to nearest integer
  if (targetCurrency.toLowerCase() === "jpy") {
    return Math.round(targetAmount)
  }
  
  // For other currencies, multiply by 100 to get cents
  return Math.round(targetAmount * 100)
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
