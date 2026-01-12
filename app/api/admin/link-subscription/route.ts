import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, tier, stripeCustomerId, stripeSessionId, adminKey } = body

    const validAdminKey = process.env.ADMIN_API_KEY
    if (!validAdminKey || adminKey !== validAdminKey) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!email || typeof tier !== 'number' || tier < 0 || tier > 3) {
      return NextResponse.json({ error: 'Email y tier valido requeridos' }, { status: 400 })
    }

    let dbUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: { email: email.toLowerCase(), tier, mpCustomerId: stripeCustomerId || null }
      })
    } else {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { tier, mpCustomerId: stripeCustomerId || dbUser.mpCustomerId }
      })
    }

    try {
      const supabase = createServiceClient()
      const { data: users } = await supabase.auth.admin.listUsers()
      const supabaseUser = users?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
      if (supabaseUser) {
        const tierName = tier === 1 ? 'STARTER' : tier === 2 ? 'PRO' : tier === 3 ? 'OPERATOR' : 'FREE'
        await supabase.auth.admin.updateUserById(supabaseUser.id, {
          user_metadata: { ...supabaseUser.user_metadata, tier, tier_name: tierName, manually_linked: true }
        })
      }
    } catch (e) { console.warn('Supabase update failed:', e) }

    if (stripeSessionId) {
      try {
        const existing = await prisma.order.findUnique({ where: { externalId: stripeSessionId } })
        if (!existing) {
          await prisma.order.create({
            data: { userId: dbUser.id, externalId: stripeSessionId, status: 'APPROVED', amount: 0, currency: 'MXN' }
          })
        }
      } catch (e) { console.warn('Order creation failed:', e) }
    }

    const tierName = tier === 1 ? 'STARTER' : tier === 2 ? 'PRO' : tier === 3 ? 'OPERATOR' : 'FREE'
    return NextResponse.json({
      success: true,
      message: 'Usuario ' + email + ' actualizado a tier ' + tierName,
      user: { id: dbUser.id, email: dbUser.email, tier: dbUser.tier, tierName }
    })
  } catch (error) {
    console.error('Admin link error:', error)
    return NextResponse.json({ error: 'Error al vincular' }, { status: 500 })
  }
}
