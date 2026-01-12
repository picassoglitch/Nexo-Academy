export default function ReembolsosPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Política de Reembolsos</h1>
        
        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Período de Reembolso</h2>
            <p className="text-gray-700">
              Ofrecemos reembolsos completos dentro de los primeros 7 días después de la compra,
              siempre que no hayas completado más del 25% del curso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Proceso de Reembolso</h2>
            <p className="text-gray-700">
              Para solicitar un reembolso, envía un email a soporte con tu número de orden.
              Procesaremos tu solicitud dentro de 5-7 días hábiles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Reembolsos Parciales</h2>
            <p className="text-gray-700">
              Si has completado más del 25% del curso, no serás elegible para un reembolso completo.
              Evaluaremos casos especiales individualmente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Método de Reembolso</h2>
            <p className="text-gray-700">
              Los reembolsos se procesarán al método de pago original. Para pagos con OXXO o SPEI,
              puede tomar hasta 10 días hábiles.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

