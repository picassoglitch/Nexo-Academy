import { prisma } from "@/lib/prisma"

/**
 * Determines the correct redirect path based on user role
 * - ADMIN users → /admin
 * - Regular users → /dashboard
 */
export async function getRedirectPath(email: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    })

    // If user doesn't exist in Prisma, default to dashboard
    // (dashboard will handle creating the user)
    if (!user) {
      return "/dashboard"
    }

    if (user.role === "ADMIN") {
      return "/admin"
    }

    return "/dashboard"
  } catch (error) {
    console.error("Error getting redirect path:", error)
    // Default to dashboard on error
    return "/dashboard"
  }
}


