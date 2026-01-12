import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { prisma } from "@/lib/prisma"
import UsersAdmin from "@/components/admin/users-admin"

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminUsuariosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check admin access via Prisma (or use profiles table if available)
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  })

  if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
    redirect("/dashboard")
  }

  // Fetch users from public.profiles table (mirrors auth.users with triggers)
  const supabaseService = createServiceClient()
  
  // Fetch profiles from public.profiles table
  const { data: profiles, error: profilesError } = await supabaseService
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError)
    // Fallback to Prisma if profiles table doesn't exist yet
    console.warn("⚠️ Falling back to Prisma User table. Run the profiles migration first.")
    const users = await prisma.user.findMany({
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    
    const usersForDisplay = users.map((u: any) => ({
      ...u,
      name: u.name || null,
      emailConfirmed: u.emailConfirmed ?? false,
      lastSignInAt: u.lastSignInAt || null,
    }))
    
    return <UsersAdmin users={usersForDisplay} />
  }

  // Fetch orders from Prisma (profiles table doesn't have orders)
  // Create a map of email -> orders for quick lookup
  const profileEmails = (profiles || []).map((p: any) => p.email).filter(Boolean)
  const ordersByEmail = new Map<string, any[]>()
  
  if (profileEmails.length > 0) {
    const orders = await prisma.order.findMany({
      where: {
        user: {
          email: { in: profileEmails },
        },
      },
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Group orders by email
    for (const order of orders) {
      const email = order.user.email.toLowerCase()
      if (!ordersByEmail.has(email)) {
        ordersByEmail.set(email, [])
      }
      ordersByEmail.get(email)!.push(order)
    }
  }

  // Map profiles to match component expectations
  const usersForDisplay = (profiles || []).map((profile: any) => {
    const email = (profile.email || "").toLowerCase()
    const userOrders = ordersByEmail.get(email) || []
    
    return {
      id: profile.id,
      email: profile.email,
      name: profile.display_name || null, // Map display_name to name
      tier: profile.tier || 0,
      role: profile.role || "user",
      emailConfirmed: profile.email_confirmed || false,
      emailConfirmedAt: profile.email_confirmed_at ? new Date(profile.email_confirmed_at) : null,
      lastSignInAt: profile.last_sign_in_at ? new Date(profile.last_sign_in_at) : null,
      createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
      orders: userOrders.slice(0, 1), // Get last order for "Última Compra"
    }
  })
  
  console.log(`📊 Displaying ${usersForDisplay.length} users from public.profiles table`)

  return <UsersAdmin users={usersForDisplay} />
}

