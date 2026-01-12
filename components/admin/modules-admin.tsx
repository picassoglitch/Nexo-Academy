"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react"

export default function ModulesAdmin({ 
  modules: initialModules, 
  courses 
}: { 
  modules: any[]
  courses: any[]
}) {
  const [modules, setModules] = useState(initialModules)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    order: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editing ? `/api/admin/modules/${editing.id}` : "/api/admin/modules"
    const method = editing ? "PUT" : "POST"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      const updated = await response.json()
      if (editing) {
        setModules(modules.map((m) => (m.id === editing.id ? updated : m)))
      } else {
        setModules([...modules, updated])
      }
      setShowForm(false)
      setEditing(null)
      setFormData({ title: "", description: "", courseId: "", order: 0 })
      window.location.reload()
    } else {
      const error = await response.json()
      alert(error.error || "Error al guardar")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este módulo?")) return

    const response = await fetch(`/api/admin/modules/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setModules(modules.filter((m) => m.id !== id))
    }
  }

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const response = await fetch(`/api/admin/modules/${id}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    })

    if (response.ok) {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestión de Módulos</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Módulo
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editing ? "Editar Módulo" : "Nuevo Módulo"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="courseId">Curso</Label>
                  <select
                    id="courseId"
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    required
                    className="w-full mt-2 p-2 border rounded-md"
                  >
                    <option value="">Seleccionar curso</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
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
                  <Label htmlFor="order">Orden</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editing ? "Actualizar" : "Crear"}</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditing(null)
                      setFormData({ title: "", description: "", courseId: "", order: 0 })
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
          {modules.map((module, index) => (
            <Card key={module.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{module.title}</h3>
                    <p className="text-sm text-gray-600">Curso: {module.course.title}</p>
                    <p className="text-sm text-gray-500 mt-2">{module.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Orden: {module.order} | {module._count.lessons} lecciones
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(module.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(module.id, "down")}
                      disabled={index === modules.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(module)
                        setFormData({
                          title: module.title,
                          description: module.description || "",
                          courseId: module.courseId,
                          order: module.order,
                        })
                        setShowForm(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(module.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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

