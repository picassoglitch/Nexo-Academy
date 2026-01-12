import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import OrdersAdmin from "@/components/admin/orders-admin"

export default async function AdminOrdenesPage({
  searchParams,
}: {
  searchParams: { status?: string; email?: string }
}) {
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

  const orders = await prisma.order.findMany({
    where: {
      ...(searchParams.status && searchParams.status !== "ALL" ? { status: searchParams.status as any } : {}),
      ...(searchParams.email
        ? {
            user: {
              email: {
                contains: searchParams.email,
                mode: "insensitive" as any,
              },
            },
          }
        : {}),
    },
    include: {
      user: true,
      coupon: true,
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  })

  return <OrdersAdmin orders={orders} />
}

