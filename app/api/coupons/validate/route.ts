import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json({ valid: false })
    }

    // Check if coupon is active
    if (!coupon.active) {
      return NextResponse.json({ valid: false })
    }

    // Check if expired
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ valid: false })
    }

    // Check max redemptions
    if (
      coupon.maxRedemptions &&
      coupon.redeemedCount >= coupon.maxRedemptions
    ) {
      return NextResponse.json({ valid: false })
    }

    return NextResponse.json({ valid: true, coupon })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}

