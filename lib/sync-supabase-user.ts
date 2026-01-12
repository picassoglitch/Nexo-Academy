/**
 * Sync Supabase Auth data to Prisma User table
 * Ensures User table stays updated with latest Supabase Auth information
 */

import { createServiceClient } from "@/lib/supabase/service"
import { prisma } from "@/lib/prisma"

export interface SupabaseUserData {
  email: string
  supabaseId: string
  emailConfirmed: boolean
  emailConfirmedAt: Date | null
  lastSignInAt: Date | null
  createdAt: Date
  displayName: string | null
}

/**
 * Sync a single user from Supabase Auth to Prisma
 */
export async function syncUserFromSupabase(
  email: string,
  supabaseUserData?: SupabaseUserData
): Promise<void> {
  try {
    // If data not provided, fetch from Supabase
    if (!supabaseUserData) {
      const supabase = createServiceClient()
      const { data: supabaseUsers } = await supabase.auth.admin.listUsers()
      const supabaseUser = supabaseUsers?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      )

      if (!supabaseUser) {
        console.warn(`⚠️ Supabase user not found for email: ${email}`)
        return
      }

      supabaseUserData = {
        email: supabaseUser.email!,
        supabaseId: supabaseUser.id,
        emailConfirmed: !!supabaseUser.email_confirmed_at,
        emailConfirmedAt: supabaseUser.email_confirmed_at
          ? new Date(supabaseUser.email_confirmed_at)
          : null,
        lastSignInAt: supabaseUser.last_sign_in_at
          ? new Date(supabaseUser.last_sign_in_at)
          : null,
        createdAt: new Date(supabaseUser.created_at),
        displayName:
          supabaseUser.user_metadata?.name ||
          supabaseUser.user_metadata?.display_name ||
          null,
      }
    }

    // Find or create user in Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email: supabaseUserData.email },
    })

    const updateData: any = {
      supabaseId: supabaseUserData.supabaseId,
      // Update name if missing in Prisma but available in Supabase
      name: existingUser?.name || supabaseUserData.displayName || null,
      // Try to include new fields (will work after migration)
      emailConfirmed: supabaseUserData.emailConfirmed,
      emailConfirmedAt: supabaseUserData.emailConfirmedAt,
      lastSignInAt: supabaseUserData.lastSignInAt,
    }

    if (existingUser) {
      // Update existing user
      try {
        await prisma.user.update({
          where: { email: supabaseUserData.email },
          data: updateData as any, // Type assertion for optional fields
        })
        console.log(`✅ Synced Supabase data for user: ${supabaseUserData.email}`)
      } catch (updateError: any) {
        // If new fields don't exist in database, update without them
        const errorMessage = updateError?.message || ""
        const isColumnError = 
          errorMessage.includes("column") && 
          (errorMessage.includes("emailConfirmed") || 
           errorMessage.includes("emailConfirmedAt") || 
           errorMessage.includes("lastSignInAt"))
        
        if (isColumnError) {
          console.warn(`⚠️ New fields not in database yet for ${supabaseUserData.email}, updating without them. Run migration first!`)
          const fallbackData: any = {
            supabaseId: supabaseUserData.supabaseId,
            name: existingUser?.name || supabaseUserData.displayName || null,
          }
          await prisma.user.update({
            where: { email: supabaseUserData.email },
            data: fallbackData,
          })
        } else {
          throw updateError
        }
      }
    } else {
      // Create new user (shouldn't happen often, but handle it)
      try {
        await prisma.user.create({
          data: {
            email: supabaseUserData.email,
            supabaseId: supabaseUserData.supabaseId,
            emailConfirmed: supabaseUserData.emailConfirmed,
            emailConfirmedAt: supabaseUserData.emailConfirmedAt,
            lastSignInAt: supabaseUserData.lastSignInAt,
            name: supabaseUserData.displayName,
            tier: 0,
            createdAt: supabaseUserData.createdAt,
          } as any, // Type assertion for optional fields
        })
        console.log(`✅ Created new user from Supabase: ${supabaseUserData.email}`)
      } catch (createError: any) {
        // If new fields don't exist in database, create without them
        const errorMessage = createError?.message || ""
        const isColumnError = 
          errorMessage.includes("column") && 
          (errorMessage.includes("emailConfirmed") || 
           errorMessage.includes("emailConfirmedAt") || 
           errorMessage.includes("lastSignInAt"))
        
        if (isColumnError) {
          console.warn(`⚠️ New fields not in database yet, creating user without them: ${supabaseUserData.email}. Run migration first!`)
          await prisma.user.create({
            data: {
              email: supabaseUserData.email,
              supabaseId: supabaseUserData.supabaseId,
              name: supabaseUserData.displayName,
              tier: 0,
              createdAt: supabaseUserData.createdAt,
            },
          })
        } else {
          throw createError
        }
      }
    }
  } catch (error: any) {
    console.error(`❌ Error syncing user ${email}:`, error)
    throw error
  }
}

/**
 * Sync all users from Supabase Auth to Prisma
 * Useful for bulk updates or admin operations
 */
export async function syncAllUsersFromSupabase(): Promise<{
  synced: number
  errors: number
}> {
  try {
    const supabase = createServiceClient()
    const { data: supabaseUsers, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (error) {
      throw error
    }

    if (!supabaseUsers?.users) {
      return { synced: 0, errors: 0 }
    }

    let synced = 0
    let errors = 0

    for (const supabaseUser of supabaseUsers.users) {
      if (!supabaseUser.email) continue

      try {
        const userData: SupabaseUserData = {
          email: supabaseUser.email,
          supabaseId: supabaseUser.id,
          emailConfirmed: !!supabaseUser.email_confirmed_at,
          emailConfirmedAt: supabaseUser.email_confirmed_at
            ? new Date(supabaseUser.email_confirmed_at)
            : null,
          lastSignInAt: supabaseUser.last_sign_in_at
            ? new Date(supabaseUser.last_sign_in_at)
            : null,
          createdAt: new Date(supabaseUser.created_at),
          displayName:
            supabaseUser.user_metadata?.name ||
            supabaseUser.user_metadata?.display_name ||
            null,
        }

        await syncUserFromSupabase(supabaseUser.email, userData)
        synced++
      } catch (error) {
        console.error(
          `❌ Error syncing user ${supabaseUser.email}:`,
          error
        )
        errors++
      }
    }

    console.log(`✅ Bulk sync complete: ${synced} synced, ${errors} errors`)
    return { synced, errors }
  } catch (error: any) {
    console.error("❌ Error in bulk sync:", error)
    throw error
  }
}
