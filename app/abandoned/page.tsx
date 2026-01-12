import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AbandonedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">¿Te fuiste sin completar tu compra?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700">
              Notamos que comenzaste el proceso de compra pero no lo completaste.
              ¿Hay algo en lo que podamos ayudarte?
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">💡 Oferta Especial</h3>
              <p className="text-sm text-gray-700 mb-4">
                Completa tu compra ahora y recibe un bonus adicional de plantillas.
              </p>
              <Button asChild>
                <Link href="/pricing">Ver Planes</Link>
              </Button>
            </div>

            <div>
              <h3 className="font-semibold mb-2">¿Tienes preguntas?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Estamos aquí para ayudarte. Contáctanos si tienes dudas sobre:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Qué plan es mejor para ti</li>
                <li>Métodos de pago</li>
                <li>Contenido del curso</li>
                <li>Cualquier otra pregunta</li>
              </ul>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

