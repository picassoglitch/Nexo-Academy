import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/profiles
 * 
 * Fetches all user profiles from public.profiles table.
 * Uses service_role key for admin access (server-side only).
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 * - search: Search by email or display_name
 * - role: Filter by role
 * - tier: Filter by tier
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin via Prisma
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL
    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== adminEmail)) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    // Use service role client to query public.profiles
    const supabaseService = createServiceClient()
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const tier = searchParams.get("tier") || ""

    // Build query
    let query = supabaseService
      .from("profiles")
      .select("*", { count: "exact" })

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`)
    }
    if (role) {
      query = query.eq("role", role)
    }
    if (tier) {
      query = query.eq("tier", parseInt(tier, 10))
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order("created_at", { ascending: false })

    const { data: profiles, error, count } = await query

    if (error) {
      console.error("Error fetching profiles:", error)
      return NextResponse.json(
        { error: "Failed to fetch profiles", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      profiles: profiles || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error("Error in GET /api/admin/profiles:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/profiles
 * 
 * Updates a user profile in public.profiles table.
 * Uses service_role key for admin access (server-side only).
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin access
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin via Prisma
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL
    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== adminEmail)) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const { id, ...updates } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 })
    }

    // Use service role client to update public.profiles
    const supabaseService = createServiceClient()
    
    const { data: profile, error } = await supabaseService
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      return NextResponse.json(
        { error: "Failed to update profile", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/profiles:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
