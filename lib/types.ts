// Shared types and enums (browser-safe)
// These are extracted from Prisma to avoid importing PrismaClient in client components

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum IncomePath {
  PATH1 = "PATH1",  // AI Services for Local Businesses
  PATH2 = "PATH2",  // AI Content for Creators
  PATH3 = "PATH3",  // AI Digital Products
  PATH4 = "PATH4",  // AI Consulting / Freelancing
  PATH5 = "PATH5",  // SaaS / Herramientas IA
}

export enum Tier {
  STARTER = "STARTER",
  PRO = "PRO",
  OPERATOR = "OPERATOR",
}

export enum PaymentProvider {
  STRIPE = "STRIPE",  // Stripe
}

export enum OrderStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  IN_PROCESS = "IN_PROCESS",
}

export enum CouponType {
  PERCENT = "PERCENT",
  FIXED = "FIXED",
}

export enum ReferralStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

