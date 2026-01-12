import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const email = new URL(request.url).searchParams.get("email")
    if (!email) return NextResponse.redirect(new URL("/?unsubscribed=error", request.url))

    const subscriber = await prisma.emailSubscriber.findUnique({ where: { email: email.toLowerCase() } })
    if (subscriber) {
      await prisma.emailSubscriber.update({
        where: { id: subscriber.id },
        data: { unsubscribed: true, unsubscribedAt: new Date() }
      })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    return NextResponse.redirect(`${siteUrl}/?unsubscribed=success`)
  } catch (error: any) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    return NextResponse.redirect(`${siteUrl}/?unsubscribed=error`)
  }
}
