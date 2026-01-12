import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-3xl">Pago No Procesado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-gray-700">
              Hubo un problema al procesar tu pago. Por favor, intenta de nuevo.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">💡 Oferta Especial</h3>
              <p className="text-sm text-gray-700 mb-4">
                Si tienes problemas con el pago, contáctanos y te ayudamos a completar tu compra.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/pricing">Ver Planes Nuevamente</Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="flex-1">
                <Link href="/checkout">Intentar de Nuevo</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="/">Volver al Inicio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
