import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getRedirectPath } from "@/lib/auth-redirect"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ redirect: "/login" }, { headers: { "Content-Type": "application/json" } })
    }

    // Check if user exists in Prisma
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { role: true },
    })

    if (!dbUser) {
      return NextResponse.json(
        { redirect: "/login", error: "account_not_created" },
        { headers: { "Content-Type": "application/json" } }
      )
    }

    const redirectPath = await getRedirectPath(user.email)
    return NextResponse.json({ redirect: redirectPath }, { headers: { "Content-Type": "application/json" } })
  } catch (error: any) {
    console.error("Error getting redirect:", error)
    return NextResponse.json(
      { redirect: "/login", error: error?.message },
      { headers: { "Content-Type": "application/json" } }
    )
  }
}


