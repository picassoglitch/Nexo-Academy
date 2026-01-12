import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import TestimonialsAdmin from "@/components/admin/testimonials-admin"

export default async function AdminTestimoniosPage() {
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

  const testimonials = await prisma.testimonial.findMany({
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return <TestimonialsAdmin testimonials={testimonials} />
}

