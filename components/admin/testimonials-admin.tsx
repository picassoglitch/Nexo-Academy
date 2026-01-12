"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"

export default function TestimonialsAdmin({ testimonials: initialTestimonials }: { testimonials: any[] }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials)

  const handleToggleApproval = async (id: string, approved: boolean) => {
    const response = await fetch(`/api/admin/testimonials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !approved }),
    })

    if (response.ok) {
      setTestimonials(
        testimonials.map((t) => (t.id === id ? { ...t, approved: !approved } : t))
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Testimonios</h1>

        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-700 mb-2">{testimonial.content}</p>
                    {testimonial.user && (
                      <p className="text-sm text-gray-600">
                        — {testimonial.user.name || testimonial.user.email}
                      </p>
                    )}
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                        testimonial.approved
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {testimonial.approved ? "Aprobado" : "Pendiente"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleApproval(testimonial.id, testimonial.approved)}
                  >
                    {testimonial.approved ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {testimonials.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-gray-600">
              No hay testimonios aún
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

