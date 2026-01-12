"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Save,
  X,
  FileText,
  Video,
  Zap,
  BookOpen,
  Clock,
} from "lucide-react"
import Link from "next/link"

interface Lesson {
  id?: string
  slug: string
  title: string
  summary: string | null
  lessonType: string | null
  videoUrl: string | null
  transcriptMd: string | null
  actionChecklistMd: string | null
  quizQuestions: string | null
  assignments: string | null
  estimatedDuration: number | null
  requiredTier: string
  isFreePreview: boolean
  moduleId: string
}

interface LessonEditProps {
  lesson?: Lesson | null
  courseId: string
  modules: Array<{ id: string; title: string }>
}

export default function LessonEdit({ lesson, courseId, modules }: LessonEditProps) {
  const router = useRouter()
  const isEditing = !!lesson
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"texto" | "video" | "interactivo">(
    lesson?.lessonType === "Video Principal"
      ? "video"
      : lesson?.lessonType === "Interactivo"
        ? "interactivo"
        : "texto"
  )

  // Convert single tier to array for backward compatibility
  const getInitialTiers = () => {
    if (!lesson?.requiredTier) return ["ALL"]
    if (Array.isArray(lesson.requiredTier)) return lesson.requiredTier
    if (lesson.requiredTier === "ALL") return ["ALL", "STARTER", "PRO", "OPERATOR"]
    return [lesson.requiredTier]
  }

  const [formData, setFormData] = useState({
    title: lesson?.title || "",
    slug: lesson?.slug || "",
    summary: lesson?.summary || "",
    moduleId: lesson?.moduleId || modules[0]?.id || "",
    lessonType: lesson?.lessonType || "Texto Principal",
    requiredTiers: getInitialTiers(),
    isFreePreview: lesson?.isFreePreview || false,
    estimatedDuration: lesson?.estimatedDuration || 10,
    // Texto
    transcriptMd: lesson?.transcriptMd || "",
    actionChecklistMd: lesson?.actionChecklistMd || "",
    // Video
    videoUrl: lesson?.videoUrl || "",
    // Interactivo
    quizQuestions: lesson?.quizQuestions || "",
    assignments: lesson?.assignments || "",
  })

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData((prev) => {
      const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      return { ...prev, title, slug: isEditing ? prev.slug : slug }
    })
  }

  const handleTabChange = (tab: "texto" | "video" | "interactivo") => {
    setActiveTab(tab)
    const typeMap = {
      texto: "Texto Principal",
      video: "Video Principal",
      interactivo: "Interactivo",
    }
    setFormData({ ...formData, lessonType: typeMap[tab] })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing ? `/api/admin/lessons/${lesson.id}` : "/api/admin/lessons"
      const method = isEditing ? "PUT" : "POST"

      // Use first module if moduleId is not set (for new lessons)
      const submitData = {
        ...formData,
        moduleId: formData.moduleId || modules[0]?.id || "",
        courseId,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        router.push(`/admin/cursos/${courseId}/lecciones`)
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || "Error al guardar la lección"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al guardar la lección")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/cursos/${courseId}/lecciones`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Editar Lección" : "Nueva Lección"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? "Modifica el contenido de la lección" : "Crea una nueva lección"}
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
                  <Label htmlFor="title">Título de la Lección *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Ej: Introducción a ChatGPT"
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
                    placeholder="introduccion-chatgpt"
                    required
                    disabled={isEditing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="summary">Resumen</Label>
                  <textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Breve descripción de lo que aprenderán en esta lección..."
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

              </CardContent>
            </Card>

            {/* Content Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Contenido de la Lección</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="texto">
                      <FileText className="mr-2 h-4 w-4" />
                      Texto
                    </TabsTrigger>
                    <TabsTrigger value="video">
                      <Video className="mr-2 h-4 w-4" />
                      Video
                    </TabsTrigger>
                    <TabsTrigger value="interactivo">
                      <Zap className="mr-2 h-4 w-4" />
                      Interactivo
                    </TabsTrigger>
                  </TabsList>

                  {/* Texto Tab */}
                  <TabsContent value="texto" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="transcriptMd">Contenido Principal (Markdown)</Label>
                      <textarea
                        id="transcriptMd"
                        value={formData.transcriptMd}
                        onChange={(e) => setFormData({ ...formData, transcriptMd: e.target.value })}
                        placeholder="Escribe el contenido principal de la lección en Markdown..."
                        rows={12}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Soporta Markdown: **negrita**, *cursiva*, listas, enlaces, etc.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="actionChecklistMd">Lista de Acciones (Markdown)</Label>
                      <textarea
                        id="actionChecklistMd"
                        value={formData.actionChecklistMd}
                        onChange={(e) =>
                          setFormData({ ...formData, actionChecklistMd: e.target.value })
                        }
                        placeholder="- [ ] Acción 1&#10;- [ ] Acción 2&#10;- [ ] Acción 3"
                        rows={6}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                      />
                    </div>
                  </TabsContent>

                  {/* Video Tab */}
                  <TabsContent value="video" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="videoUrl">URL del Video *</Label>
                      <Input
                        id="videoUrl"
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                        required={activeTab === "video"}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Soporta YouTube, Vimeo, o cualquier URL de video embebible
                      </p>
                    </div>

                    {formData.videoUrl && (
                      <div className="mt-4">
                        <Label>Vista Previa</Label>
                        <div className="mt-2 aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center">
                            <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Vista previa del video</p>
                            <p className="text-xs text-gray-400 mt-1">{formData.videoUrl}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="transcriptMd">Transcripción (Opcional)</Label>
                      <textarea
                        id="transcriptMd"
                        value={formData.transcriptMd}
                        onChange={(e) => setFormData({ ...formData, transcriptMd: e.target.value })}
                        placeholder="Transcripción del video en Markdown..."
                        rows={8}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                      />
                    </div>
                  </TabsContent>

                  {/* Interactivo Tab */}
                  <TabsContent value="interactivo" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="quizQuestions">Preguntas del Quiz (JSON)</Label>
                      <textarea
                        id="quizQuestions"
                        value={formData.quizQuestions}
                        onChange={(e) => setFormData({ ...formData, quizQuestions: e.target.value })}
                        placeholder='[{"question": "¿Qué es la IA?", "options": ["A", "B", "C"], "correct": 0}]'
                        rows={10}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formato JSON: array de objetos con question, options, correct
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="assignments">Tareas/Asignaciones (Markdown)</Label>
                      <textarea
                        id="assignments"
                        value={formData.assignments}
                        onChange={(e) => setFormData({ ...formData, assignments: e.target.value })}
                        placeholder="Instrucciones para las tareas prácticas..."
                        rows={6}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
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
                  <p className="text-xs text-gray-500 mb-3">Selecciona los tiers que pueden acceder a esta lección</p>
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

                <div>
                  <Label htmlFor="estimatedDuration">Duración Estimada (minutos)</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    min="1"
                    value={formData.estimatedDuration}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 10 })
                    }
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="isFreePreview" className="font-semibold">
                      Vista Previa Gratuita
                    </Label>
                    <p className="text-xs text-gray-500">Visible sin suscripción</p>
                  </div>
                  <input
                    type="checkbox"
                    id="isFreePreview"
                    checked={formData.isFreePreview}
                    onChange={(e) =>
                      setFormData({ ...formData, isFreePreview: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Guardando..." : "Guardar Lección"}
              </Button>
              <Button asChild variant="outline" type="button">
                <Link href={`/admin/cursos/${courseId}/lecciones`}>
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

