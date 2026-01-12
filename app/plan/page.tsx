import { Suspense } from "react"
import PlanContent from "@/components/plan-content"
import { DISCLAIMER_TEXT } from "@/lib/constants"

export default function PlanPage({
  searchParams,
}: {
  searchParams: { planId?: string }
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <Suspense fallback={<div>Cargando tu plan...</div>}>
        <PlanContent planId={searchParams.planId} />
      </Suspense>
    </div>
  )
}

