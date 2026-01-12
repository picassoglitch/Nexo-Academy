import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

export default function CheckoutPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <Clock className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <CardTitle className="text-3xl">Pago Pendiente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-gray-700">
              Tu pago está siendo procesado. Esto puede tardar unos minutos.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold mb-2">Próximos Pasos:</h3>
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>Si pagaste con OXXO, completa el pago en la tienda</li>
                <li>Si pagaste con SPEI, confirma la transferencia</li>
                <li>Recibirás un email cuando tu pago sea confirmado</li>
                <li>Una vez confirmado, tendrás acceso inmediato al curso</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600">
              Te enviaremos un email de confirmación en cuanto tu pago sea procesado.
            </p>

            <Button asChild size="lg">
              <Link href="/dashboard">Ir a mi Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

