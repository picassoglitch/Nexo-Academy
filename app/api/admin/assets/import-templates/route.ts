import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { Tier } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401, headers: { "Content-Type": "application/json" } })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: { "Content-Type": "application/json" } })
    }

    const results: any[] = []

    // STARTER Assets
    const starterAssets = [
      {
        title: "Oferta 1-pager",
        description: "Plantilla para crear ofertas de servicios en 1 página",
        category: "Ofertas",
        requiredTier: Tier.STARTER,
        fileUrl: "/templates/starter/oferta-1-pager.pdf", // Placeholder - subir archivo real después
      },
      {
        title: "Script WhatsApp inicial",
        description: "Script para primer contacto por WhatsApp",
        category: "Scripts",
        requiredTier: Tier.STARTER,
        fileUrl: "/templates/starter/script-whatsapp-inicial.docx",
      },
      {
        title: "Script seguimiento",
        description: "Script para seguimiento de prospectos",
        category: "Scripts",
        requiredTier: Tier.STARTER,
        fileUrl: "/templates/starter/script-seguimiento.docx",
      },
      {
        title: "Checklist onboarding",
        description: "Checklist para onboarding de clientes",
        category: "Checklists",
        requiredTier: Tier.STARTER,
        fileUrl: "/templates/starter/checklist-onboarding.pdf",
      },
      {
        title: "Propuesta PDF",
        description: "Plantilla de propuesta profesional en PDF",
        category: "Propuestas",
        requiredTier: Tier.STARTER,
        fileUrl: "/templates/starter/propuesta-pdf.pdf",
      },
      {
        title: "Contrato básico",
        description: "Plantilla de contrato básico para servicios",
        category: "Contratos",
        requiredTier: Tier.STARTER,
        fileUrl: "/templates/starter/contrato-basico.docx",
      },
      {
        title: "Guía pricing MX",
        description: "Guía de precios para mercado mexicano",
        category: "Guías",
        requiredTier: Tier.STARTER,
        fileUrl: "/templates/starter/guia-pricing-mx.pdf",
      },
      {
        title: "SOP entrega",
        description: "Procedimiento estándar para entrega de servicios",
        category: "SOPs",
        requiredTier: Tier.STARTER,
        fileUrl: "/templates/starter/sop-entrega.pdf",
      },
    ]

    // PRO Assets
    const proAssets = [
      {
        title: "WhatsApp scripts pack",
        description: "Pack completo de scripts para WhatsApp",
        category: "Scripts",
        requiredTier: Tier.PRO,
        fileUrl: "/templates/pro/whatsapp-scripts-pack.zip",
      },
      {
        title: "IG DM flows",
        description: "Flujos de automatización para Instagram DMs",
        category: "Automatización",
        requiredTier: Tier.PRO,
        fileUrl: "/templates/pro/ig-dm-flows.pdf",
      },
      {
        title: "CRM prospectos (CSV + Notion)",
        description: "Sistema CRM simple con CSV y template Notion",
        category: "CRM",
        requiredTier: Tier.PRO,
        fileUrl: "/templates/pro/crm-prospectos.zip",
      },
      {
        title: "Discovery call script",
        description: "Script completo para discovery calls",
        category: "Scripts",
        requiredTier: Tier.PRO,
        fileUrl: "/templates/pro/discovery-call-script.docx",
      },
      {
        title: "Calendario contenido 30 días",
        description: "Plantilla de calendario editorial para 30 días",
        category: "Contenido",
        requiredTier: Tier.PRO,
        fileUrl: "/templates/pro/calendario-contenido-30d.xlsx",
      },
      {
        title: "Pipeline 12 reels",
        description: "Pipeline completo para crear 12 reels",
        category: "Contenido",
        requiredTier: Tier.PRO,
        fileUrl: "/templates/pro/pipeline-12-reels.pdf",
      },
      {
        title: "Lead magnet template",
        description: "Plantilla para crear lead magnets efectivos",
        category: "Marketing",
        requiredTier: Tier.PRO,
        fileUrl: "/templates/pro/lead-magnet-template.pdf",
      },
    ]

    // OPERATOR Assets
    const operatorAssets = [
      {
        title: "Audit checklist negocio",
        description: "Checklist completo para auditar negocios",
        category: "Auditorías",
        requiredTier: Tier.OPERATOR,
        fileUrl: "/templates/operator/audit-checklist-negocio.pdf",
      },
      {
        title: "Case study template",
        description: "Plantilla para crear case studies profesionales",
        category: "Marketing",
        requiredTier: Tier.OPERATOR,
        fileUrl: "/templates/operator/case-study-template.docx",
      },
      {
        title: "SOP Hub Notion",
        description: "Hub completo de SOPs en Notion",
        category: "SOPs",
        requiredTier: Tier.OPERATOR,
        fileUrl: "/templates/operator/sop-hub-notion.zip",
      },
      {
        title: "Done-for-you workflows",
        description: "Workflows completos done-for-you",
        category: "Workflows",
        requiredTier: Tier.OPERATOR,
        fileUrl: "/templates/operator/dfy-workflows.zip",
      },
      {
        title: "Live session workbook",
        description: "Workbook para sesiones en vivo",
        category: "Sesiones",
        requiredTier: Tier.OPERATOR,
        fileUrl: "/templates/operator/live-session-workbook.pdf",
      },
      {
        title: "Quality control checklist",
        description: "Checklist de control de calidad",
        category: "Calidad",
        requiredTier: Tier.OPERATOR,
        fileUrl: "/templates/operator/quality-control-checklist.pdf",
      },
    ]

    // Create all assets
    const allAssets = [
      ...starterAssets.map((a) => ({ ...a, tier: "STARTER" })),
      ...proAssets.map((a) => ({ ...a, tier: "PRO" })),
      ...operatorAssets.map((a) => ({ ...a, tier: "OPERATOR" })),
    ]

    for (const assetData of allAssets) {
      const { tier, ...asset } = assetData
      const existing = await prisma.asset.findFirst({
        where: {
          title: asset.title,
        },
      })

      if (existing) {
        await prisma.asset.update({
          where: { id: existing.id },
          data: asset,
        })
        results.push({ tier, action: "updated", asset: asset.title })
      } else {
        await prisma.asset.create({
          data: asset,
        })
        results.push({ tier, action: "created", asset: asset.title })
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Plantillas importadas correctamente",
        results,
        summary: {
          starter: starterAssets.length,
          pro: proAssets.length,
          operator: operatorAssets.length,
          total: allAssets.length,
        },
      },
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    console.error("Error importing templates:", error)
    return NextResponse.json(
      { error: "Error al importar plantillas", details: error.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}


