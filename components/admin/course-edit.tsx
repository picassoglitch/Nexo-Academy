"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"

interface Course {
  id?: string
  slug: string
  title: string
  description: string | null
  published: boolean
  requiredTier?: string
}

interface CourseEditProps {
  course?: Course | null
}

export default function CourseEdit({ course }: CourseEditProps) {
  const router = useRouter()
  const isEditing = !!course
  const [loading, setLoading] = useState(false)
  // Get initial tiers from course (stored as JSON array)
  const getInitialTiers = () => {
    if (!course?.requiredTiers) return ["ALL"]
    // requiredTiers is stored as JSON, so it might be a string or already parsed
    if (typeof course.requiredTiers === "string") {
      try {
        const parsed = JSON.parse(course.requiredTiers)
        return Array.isArray(parsed) ? parsed : ["ALL"]
      } catch {
        return ["ALL"]
      }
    }
    if (Array.isArray(course.requiredTiers)) return course.requiredTiers
    return ["ALL"]
  }

  const [formData, setFormData] = useState({
    title: course?.title || "",
    slug: course?.slug || "",
    description: course?.description || "",
    published: course?.published || false,
    requiredTiers: getInitialTiers(),
  })

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.title, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing ? `/api/admin/courses/${course.id}` : "/api/admin/courses"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/cursos")
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || "Error al guardar el curso"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al guardar el curso")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/cursos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Editar Curso" : "Nuevo Curso"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? "Modifica los detalles del curso" : "Crea un nuevo curso educativo"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título del Curso *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Introducción a la IA para Negocios"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="introduccion-ia-negocios"
                    required
                    disabled={isEditing}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL amigable. Solo letras, números y guiones. No se puede cambiar después.
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe el curso, sus objetivos y qué aprenderán los estudiantes..."
                    rows={8}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usa Markdown para formatear el texto. Soporta negritas, listas, enlaces, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tiers Disponibles</Label>
                  <p className="text-xs text-gray-500 mb-3">Selecciona los tiers que pueden acceder a este curso</p>
                  <div className="space-y-2 mt-2">
                    {[
                      { value: "ALL", label: "Todos" },
                      { value: "STARTER", label: "Starter" },
                      { value: "PRO", label: "PRO" },
                      { value: "OPERATOR", label: "Operator" },
                    ].map((tier) => (
                      <label
                        key={tier.value}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.requiredTiers.includes(tier.value)}
                          onChange={(e) => {
                            if (tier.value === "ALL") {
                              // If "Todos" is selected, select all others
                              setFormData({
                                ...formData,
                                requiredTiers: e.target.checked
                                  ? ["ALL", "STARTER", "PRO", "OPERATOR"]
                                  : [],
                              })
                            } else {
                              // Remove "ALL" if selecting specific tiers
                              const newTiers = e.target.checked
                                ? [...formData.requiredTiers.filter((t) => t !== "ALL"), tier.value]
                                : formData.requiredTiers.filter((t) => t !== tier.value)
                              setFormData({
                                ...formData,
                                requiredTiers: newTiers.length > 0 ? newTiers : ["ALL"],
                              })
                            }
                          }}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{tier.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="published" className="font-semibold">
                      Publicar Curso
                    </Label>
                    <p className="text-xs text-gray-500">Hacer visible para los estudiantes</p>
                  </div>
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Guardando..." : "Guardar Curso"}
              </Button>
              <Button asChild variant="outline" type="button">
                <Link href="/admin/cursos">
                  <X className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

