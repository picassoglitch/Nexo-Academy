import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import ReferralsContent from "@/components/referrals-content"

export default async function ReferidosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      referralsGiven: {
        include: {
          referred: true,
        },
      },
    },
  })

  if (!dbUser) {
    redirect("/login")
  }

  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL}/signup?ref=${dbUser.id}`

  return <ReferralsContent user={dbUser} referralLink={referralLink} />
}

