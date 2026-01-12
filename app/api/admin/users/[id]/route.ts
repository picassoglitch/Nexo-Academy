import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { createServiceClient } from "@/lib/supabase/service"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

    // Don't allow deleting yourself
    if (id === dbUser.id) {
      return NextResponse.json({ error: "No puedes borrarte a ti mismo" }, { status: 400 })
    }

    // Get user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id },
    })

    if (!userToDelete) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Delete from Supabase Auth if supabaseId exists
    if (userToDelete.supabaseId) {
      try {
        const supabaseService = createServiceClient()
        await supabaseService.auth.admin.deleteUser(userToDelete.supabaseId)
      } catch (supabaseError) {
        console.error("Error deleting user from Supabase:", supabaseError)
        // Continue with Prisma deletion even if Supabase fails
      }
    }

    // Delete from Prisma (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "Usuario borrado exitosamente" })
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Error al borrar usuario", message: error?.message },
      { status: 500 }
    )
  }
}


