import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const variant = searchParams.get("variant") || ""

    const where: any = {}
    if (search) { where.OR = [{ email: { contains: search, mode: "insensitive" } }, { name: { contains: search, mode: "insensitive" } }] }
    if (variant) { where.pdfVariant = variant }

    const [subscribers, total] = await Promise.all([
      prisma.emailSubscriber.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { leadMagnet: { select: { name: true, variant: true } } } }),
      prisma.emailSubscriber.count({ where })
    ])

    return NextResponse.json({ subscribers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error: any) {
    return NextResponse.json({ error: "Error al obtener suscriptores", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id, ids } = await request.json()
    if (ids && Array.isArray(ids)) {
      await prisma.emailSubscriber.deleteMany({ where: { id: { in: ids } } })
      return NextResponse.json({ success: true, deleted: ids.length })
    }
    if (id) {
      await prisma.emailSubscriber.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: "ID requerido" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: "Error al eliminar", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    if (action === "export") {
      const subscribers = await prisma.emailSubscriber.findMany({ where: { unsubscribed: false }, orderBy: { createdAt: "desc" } })
      const csv = ["Email,Nombre,Fuente,Variante,Fecha", ...subscribers.map(s => `${s.email},${s.name || ""},${s.source || ""},${s.pdfVariant || ""},${s.createdAt.toISOString()}`)].join("\n")
      return NextResponse.json({ success: true, csv, filename: `subscribers-${new Date().toISOString().split("T")[0]}.csv` })
    }
    return NextResponse.json({ error: "Accion no valida" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: "Error al exportar", details: error.message }, { status: 500 })
  }
}
