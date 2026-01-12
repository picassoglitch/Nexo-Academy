import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-slate-900">404</CardTitle>
          <p className="text-slate-600 mt-2">Página no encontrada</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-6">
            La página que buscas no existe o ha sido movida.
          </p>
          <Button asChild variant="primary">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}





