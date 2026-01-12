"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Plus, Edit, Trash2 } from "lucide-react"

export default function CoursesAdmin({ courses: initialCourses }: { courses: any[] }) {
  const [courses, setCourses] = useState(initialCourses)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    published: false,
    imageUrl: "",
    coverImageUrl: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editing ? `/api/admin/courses/${editing.id}` : "/api/admin/courses"
    const method = editing ? "PUT" : "POST"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      const updated = await response.json()
      if (editing) {
        setCourses(courses.map((c) => (c.id === editing.id ? updated : c)))
      } else {
        setCourses([...courses, updated])
      }
      setShowForm(false)
      setEditing(null)
      setFormData({ title: "", slug: "", description: "", published: false, imageUrl: "", coverImageUrl: "" })
      window.location.reload()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este curso?")) return

    const response = await fetch(`/api/admin/courses/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setCourses(courses.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestión de Cursos</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Curso
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editing ? "Editar Curso" : "Nuevo Curso"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full mt-2 p-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">URL de Imagen</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="mt-2"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="coverImageUrl">URL de Imagen de Portada</Label>
                  <Input
                    id="coverImageUrl"
                    value={formData.coverImageUrl}
                    onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                    className="mt-2"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  />
                  <Label htmlFor="published">Publicado</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editing ? "Actualizar" : "Crear"}</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditing(null)
                      setFormData({ title: "", slug: "", description: "", published: false, imageUrl: "", coverImageUrl: "" })
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.slug}</p>
                    <p className="text-sm text-gray-500 mt-2">{course.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {course.modules.length} módulos,{" "}
                      {course.modules.reduce((acc: number, m: any) => acc + m._count.lessons, 0)}{" "}
                      lecciones
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                        course.published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {course.published ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(course)
                        setFormData({
                          title: course.title,
                          slug: course.slug,
                          description: course.description || "",
                          published: course.published,
                          imageUrl: course.imageUrl || "",
                          coverImageUrl: course.coverImageUrl || "",
                        })
                        setShowForm(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button asChild variant="default" size="sm">
                      <Link href={`/admin/lecciones?courseId=${course.id}`}>
                        Ver Lecciones
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

