import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import { getEmailSender } from "@/lib/email-config"

export const dynamic = "force-dynamic"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

async function getNextVariant(): Promise<"A" | "B"> {
  const lastSubscriber = await prisma.emailSubscriber.findFirst({
    where: { pdfVariant: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { pdfVariant: true }
  })
  return lastSubscriber?.pdfVariant === "A" ? "B" : "A"
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, source } = await request.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalido" }, { status: 400 })
    }

    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || null
    const country = request.headers.get("x-vercel-ip-country") || null

    const existing = await prisma.emailSubscriber.findUnique({ where: { email: email.toLowerCase() } })
    if (existing?.pdfSentAt) {
      return NextResponse.json({ success: true, message: "Ya estas suscrito", alreadySubscribed: true })
    }

    const nextVariant = await getNextVariant()
    const leadMagnet = await prisma.leadMagnet.findFirst({ where: { variant: nextVariant, active: true }, orderBy: { createdAt: "desc" } })

    const subscriber = existing 
      ? await prisma.emailSubscriber.update({
          where: { id: existing.id },
          data: { name: name || existing.name, leadMagnetId: leadMagnet?.id, pdfVariant: nextVariant, pdfSentAt: leadMagnet ? new Date() : null }
        })
      : await prisma.emailSubscriber.create({
          data: { email: email.toLowerCase(), name, source: source || "website", leadMagnetId: leadMagnet?.id, pdfVariant: leadMagnet ? nextVariant : null, pdfSentAt: leadMagnet ? new Date() : null, ipAddress, country }
        })

    if (leadMagnet) {
      await prisma.leadMagnet.update({ where: { id: leadMagnet.id }, data: { sendCount: { increment: 1 } } })
      
      if (resend) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        await resend.emails.send({
          from: getEmailSender(),
          to: email.toLowerCase(),
          subject: "Tu regalo esta listo - Nexo",
          html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px"><h1 style="color:#667eea">Tu Regalo Esta Listo!</h1><p>Hola ${name || ""},</p><p>Gracias por suscribirte. Aqui esta tu <strong>${leadMagnet.name}</strong>:</p><p style="text-align:center;margin:30px 0"><a href="${leadMagnet.fileUrl}" style="background:#667eea;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold">Descargar PDF</a></p><p style="font-size:12px;color:#999;text-align:center"><a href="${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}">Cancelar suscripcion</a></p></div>`
        }).catch(console.error)
      }
    }

    return NextResponse.json({ success: true, message: "Revisa tu email", subscriberId: subscriber.id, variant: nextVariant })
  } catch (error: any) {
    console.error("Subscribe error:", error)
    return NextResponse.json({ error: "Error al suscribir", details: error.message }, { status: 500 })
  }
}
