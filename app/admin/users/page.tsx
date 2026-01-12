import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import UsersAdmin from "@/components/admin/users-admin"

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  })

  if (!dbUser || (dbUser.role !== "ADMIN" && user.email !== process.env.ADMIN_BOOTSTRAP_EMAIL)) {
    redirect("/dashboard")
  }

  // Obtener todos los usuarios con sus órdenes
  const users = await prisma.user.findMany({
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1, // Solo la última orden
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return <UsersAdmin users={users} />
}





