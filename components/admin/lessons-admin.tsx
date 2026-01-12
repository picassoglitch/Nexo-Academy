"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { Tier } from "@/lib/types"
import AdvancedLessonForm from "./advanced-lesson-form"

export default function LessonsAdmin({ 
  lessons: initialLessons, 
  courses,
  initialCourseId
}: { 
  lessons: any[]
  courses: any[]
  initialCourseId?: string
}) {
  const [lessons, setLessons] = useState(initialLessons)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [filterCourseId, setFilterCourseId] = useState(initialCourseId || "")
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    transcriptMd: "",
    actionChecklistMd: "",
    videoUrl: "",
    courseId: "",
    order: 0,
    requiredTier: Tier.STARTER,
    isFreePreview: false,
  })
  
  const [useAdvancedForm, setUseAdvancedForm] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editing ? `/api/admin/lessons/${editing.id}` : "/api/admin/lessons"
    const method = editing ? "PUT" : "POST"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      const updated = await response.json()
      if (editing) {
        setLessons(lessons.map((l) => (l.id === editing.id ? updated : l)))
      } else {
        setLessons([...lessons, updated])
      }
      setShowForm(false)
      setEditing(null)
      setFormData({
        title: "",
        summary: "",
        transcriptMd: "",
        actionChecklistMd: "",
        videoUrl: "",
        courseId: "",
        order: 0,
        requiredTier: Tier.STARTER,
        isFreePreview: false,
      })
      window.location.reload()
    } else {
      const error = await response.json()
      alert(error.error || "Error al guardar")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta lección?")) return

    const response = await fetch(`/api/admin/lessons/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setLessons(lessons.filter((l) => l.id !== id))
    }
  }

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const response = await fetch(`/api/admin/lessons/${id}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    })

    if (response.ok) {
      window.location.reload()
    }
  }

  // Filter lessons client-side if filter is set (for quick filtering without page reload)
  const filteredLessons = filterCourseId
    ? lessons.filter((l) => l.module.courseId === filterCourseId)
    : lessons

  // Handle filter change - redirect to URL for proper filtering
  const handleFilterChange = (courseId: string) => {
    setFilterCourseId(courseId)
    if (courseId) {
      window.location.href = `/admin/lecciones?courseId=${courseId}`
    } else {
      window.location.href = `/admin/lecciones`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestión de Lecciones</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Lección
            </Button>
          </div>
        </div>

        {showForm && useAdvancedForm ? (
          <AdvancedLessonForm
            courses={courses}
            lessons={lessons}
            initialData={editing}
            isEditing={!!editing}
            onSubmit={async (data) => {
              const url = editing ? `/api/admin/lessons/${editing.id}` : "/api/admin/lessons"
              const method = editing ? "PUT" : "POST"

              const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              })

              if (response.ok) {
                const updated = await response.json()
                if (editing) {
                  setLessons(lessons.map((l) => (l.id === editing.id ? updated : l)))
                } else {
                  setLessons([...lessons, updated])
                }
                setShowForm(false)
                setEditing(null)
                setFormData({
                  title: "",
                  summary: "",
                  transcriptMd: "",
                  actionChecklistMd: "",
                  videoUrl: "",
                  courseId: "",
                  order: 0,
                  requiredTier: Tier.STARTER,
                  isFreePreview: false,
                })
                window.location.reload()
              } else {
                const error = await response.json()
                alert(error.error || "Error al guardar")
              }
            }}
            onCancel={() => {
              setShowForm(false)
              setEditing(null)
              setFormData({
                title: "",
                summary: "",
                transcriptMd: "",
                actionChecklistMd: "",
                videoUrl: "",
                courseId: "",
                order: 0,
                requiredTier: Tier.STARTER,
                isFreePreview: false,
              })
            }}
          />
        ) : showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editing ? "Editar Lección" : "Nueva Lección"}</CardTitle>
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
                  <Label htmlFor="summary">Resumen</Label>
                  <textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full mt-2 p-2 border rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="transcriptMd">Transcripción (Markdown)</Label>
                  <textarea
                    id="transcriptMd"
                    value={formData.transcriptMd}
                    onChange={(e) => setFormData({ ...formData, transcriptMd: e.target.value })}
                    className="w-full mt-2 p-2 border rounded-md font-mono text-sm"
                    rows={8}
                  />
                </div>
                <div>
                  <Label htmlFor="actionChecklistMd">Checklist de Acción (Markdown)</Label>
                  <textarea
                    id="actionChecklistMd"
                    value={formData.actionChecklistMd}
                    onChange={(e) => setFormData({ ...formData, actionChecklistMd: e.target.value })}
                    className="w-full mt-2 p-2 border rounded-md font-mono text-sm"
                    rows={6}
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrl">URL del Video</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="mt-2"
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                <div>
                  <Label htmlFor="requiredTier">Tier Requerido</Label>
                  <select
                    id="requiredTier"
                    value={formData.requiredTier}
                    onChange={(e) => setFormData({ ...formData, requiredTier: e.target.value as Tier })}
                    className="w-full mt-2 p-2 border rounded-md"
                  >
                    <option value="STARTER">Starter</option>
                    <option value="PRO">Pro</option>
                    <option value="OPERATOR">Operator</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFreePreview"
                    checked={formData.isFreePreview}
                    onChange={(e) => setFormData({ ...formData, isFreePreview: e.target.checked })}
                  />
                  <Label htmlFor="isFreePreview">Preview Gratis</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editing ? "Actualizar" : "Crear"}</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditing(null)
                      setFormData({
                        title: "",
                        summary: "",
                        transcriptMd: "",
                        actionChecklistMd: "",
                        videoUrl: "",
                        courseId: "",
                        order: 0,
                        requiredTier: Tier.STARTER,
                        isFreePreview: false,
                      })
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mb-4">
          <Label htmlFor="filterCourse">Filtrar por curso</Label>
          <select
            id="filterCourse"
            value={filterCourseId}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="w-full md:w-64 mt-2 p-2 border rounded-md"
          >
            <option value="">Todos los cursos</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {filteredLessons.map((lesson, index) => (
            <Card key={lesson.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{lesson.title}</h3>
                    <p className="text-sm text-gray-600">
                      {lesson.module.course.title} → {lesson.module.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">{lesson.summary}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Orden: {lesson.order} | Tier: {lesson.requiredTier} |{" "}
                      {lesson.isFreePreview ? "Preview" : "Premium"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(lesson.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(lesson.id, "down")}
                      disabled={index === filteredLessons.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(lesson)
                        setFormData({
                          title: lesson.title,
                          summary: lesson.summary || "",
                          transcriptMd: lesson.transcriptMd || "",
                          actionChecklistMd: lesson.actionChecklistMd || "",
                          videoUrl: lesson.videoUrl || "",
                          courseId: lesson.module.courseId,
                          order: lesson.order,
                          requiredTier: lesson.requiredTier,
                          isFreePreview: lesson.isFreePreview,
                        })
                        setShowForm(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(lesson.id)}
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

