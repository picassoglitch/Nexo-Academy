import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const leadMagnets = await prisma.leadMagnet.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { subscribers: true } } }
    })

    const stats = {
      totalA: await prisma.leadMagnet.aggregate({ where: { variant: "A", active: true }, _sum: { sendCount: true } }),
      totalB: await prisma.leadMagnet.aggregate({ where: { variant: "B", active: true }, _sum: { sendCount: true } }),
      totalSubscribers: await prisma.emailSubscriber.count(),
      activeSubscribers: await prisma.emailSubscriber.count({ where: { unsubscribed: false } })
    }

    return NextResponse.json({ 
      leadMagnets,
      stats: { sentA: stats.totalA._sum.sendCount || 0, sentB: stats.totalB._sum.sendCount || 0, totalSubscribers: stats.totalSubscribers, activeSubscribers: stats.activeSubscribers }
    })
  } catch (error: any) {
    return NextResponse.json({ error: "Error al obtener los lead magnets", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, fileName, fileUrl, fileSize, variant } = await request.json()
    if (!name || !fileUrl || !variant) return NextResponse.json({ error: "Datos requeridos faltantes" }, { status: 400 })
    if (!["A", "B"].includes(variant)) return NextResponse.json({ error: "Variante debe ser A o B" }, { status: 400 })
    
    const leadMagnet = await prisma.leadMagnet.create({
      data: { name, fileName: fileName || name, fileUrl, fileSize: fileSize || null, variant, active: true }
    })
    return NextResponse.json({ success: true, leadMagnet })
  } catch (error: any) {
    return NextResponse.json({ error: "Error al crear", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, fileName, fileUrl, fileSize, variant, active } = await request.json()
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    
    const leadMagnet = await prisma.leadMagnet.update({
      where: { id },
      data: { ...(name && { name }), ...(fileName && { fileName }), ...(fileUrl && { fileUrl }), ...(fileSize !== undefined && { fileSize }), ...(variant && { variant }), ...(active !== undefined && { active }) }
    })
    return NextResponse.json({ success: true, leadMagnet })
  } catch (error: any) {
    return NextResponse.json({ error: "Error al actualizar", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    await prisma.leadMagnet.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Error al eliminar", details: error.message }, { status: 500 })
  }
}
