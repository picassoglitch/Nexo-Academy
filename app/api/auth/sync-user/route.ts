import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { syncUserFromSupabase } from "@/lib/sync-supabase-user"

export async function POST(request: NextRequest) {
  try {
    const { email, name, supabaseId } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      )
    }

    // Sync user from Supabase Auth to ensure all fields are up-to-date
    // This is non-critical - if it fails, we'll still create/update with provided data
    try {
      await syncUserFromSupabase(email)
      console.log(`✅ Successfully synced user from Supabase: ${email}`)
    } catch (syncError: any) {
      // Log error but continue - we'll create/update with provided data
      const errorMessage = syncError?.message || "Unknown sync error"
      console.error(`⚠️ Error syncing from Supabase (non-critical) for ${email}:`, errorMessage)
      
      // If it's a missing column error, we know the migration hasn't been run
      if (errorMessage.includes("column") && 
          (errorMessage.includes("emailConfirmed") || 
           errorMessage.includes("emailConfirmedAt") || 
           errorMessage.includes("lastSignInAt"))) {
        console.warn("⚠️ Database migration not run yet. User will be created without new fields.")
      }
      
      // Log full error in development
      if (process.env.NODE_ENV === "development") {
        console.error("Full sync error:", syncError)
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Update fields if provided
      const updateData: any = {}
      if (supabaseId && !existingUser.supabaseId) {
        updateData.supabaseId = supabaseId
      }
      if (name && !existingUser.name) {
        updateData.name = name
      }

      if (Object.keys(updateData).length > 0) {
        try {
          await prisma.user.update({
            where: { email },
            data: updateData,
          })
          console.log(`✅ Updated existing user in Prisma: ${email}`)
        } catch (updateError: any) {
          console.error(`⚠️ Error updating user ${email}:`, updateError?.message)
          // Continue even if update fails - user exists
        }
      }

      // Return updated user
      const updatedUser = await prisma.user.findUnique({
        where: { email },
      })
      
      if (!updatedUser) {
        // This shouldn't happen, but handle it
        throw new Error(`User ${email} exists but could not be retrieved`)
      }
      
      return NextResponse.json({ user: updatedUser })
    }

    // Create new user in Prisma (shouldn't happen often since sync creates it)
    // Handle case where new fields might not exist in database yet
    const userData: any = {
      email,
      name: name || null,
      supabaseId: supabaseId || null,
      tier: 0, // Default tier
    }
    
    // Try to include new fields (will work after migration)
    // If they don't exist, Prisma will error and we'll retry without them
    try {
      const user = await prisma.user.create({
        data: {
          ...userData,
          emailConfirmed: false,
        } as any, // Type assertion to allow optional fields
      })
      console.log(`✅ Created new user in Prisma: ${email}`)
      return NextResponse.json({ user })
    } catch (error: any) {
      const errorMessage = error?.message || ""
      const errorCode = error?.code || ""
      
      // Check if error is due to missing column
      const isColumnError = 
        errorMessage.includes("column") && 
        (errorMessage.includes("emailConfirmed") || 
         errorMessage.includes("emailConfirmedAt") || 
         errorMessage.includes("lastSignInAt"))
      
      // Check if user already exists (unique constraint violation)
      const isUniqueError = 
        errorCode === "P2002" || 
        errorMessage.includes("Unique constraint") ||
        errorMessage.includes("duplicate key")
      
      if (isColumnError) {
        console.warn("⚠️ New fields not in database yet, creating user without them. Run migration first!")
        // Retry without new fields
        try {
          const user = await prisma.user.create({
            data: userData,
          })
          console.log(`✅ Created new user in Prisma (without new fields): ${email}`)
          return NextResponse.json({ user })
        } catch (retryError: any) {
          // If retry also fails, check if user already exists
          if (retryError?.code === "P2002" || retryError?.message?.includes("Unique constraint")) {
            // User already exists, fetch and return it
            const existingUser = await prisma.user.findUnique({
              where: { email },
            })
            if (existingUser) {
              console.log(`✅ User already exists, returning existing user: ${email}`)
              return NextResponse.json({ user: existingUser })
            }
          }
          throw retryError
        }
      } else if (isUniqueError) {
        // User already exists (maybe created by syncUserFromSupabase)
        console.log(`ℹ️ User already exists in Prisma, fetching: ${email}`)
        const existingUser = await prisma.user.findUnique({
          where: { email },
        })
        if (existingUser) {
          return NextResponse.json({ user: existingUser })
        }
        // If we can't find it, something is wrong
        throw new Error(`User with email ${email} already exists but could not be found`)
      }
      
      // Re-throw if it's a different error
      console.error(`❌ Unexpected error creating user ${email}:`, errorMessage, errorCode)
      throw error
    }
  } catch (error: any) {
    console.error("Error syncing user:", error)
    
    // Provide more detailed error information
    const errorMessage = error?.message || "Unknown error"
    const isColumnError = 
      errorMessage.includes("column") && 
      (errorMessage.includes("emailConfirmed") || 
       errorMessage.includes("emailConfirmedAt") || 
       errorMessage.includes("lastSignInAt"))
    
    if (isColumnError) {
      return NextResponse.json(
        { 
          error: "Database migration required", 
          details: "New fields not in database yet. Please run the migration first.",
          migrationHint: "See prisma/migrations/add-supabase-sync-fields.sql"
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: "Error al crear usuario", 
        details: errorMessage,
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}

