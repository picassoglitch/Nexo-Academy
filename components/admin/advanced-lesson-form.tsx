"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp, Plus, X, Eye, Trophy, Star, FileText, Video, Zap, Settings } from "lucide-react"
import { Tier } from "@/lib/types"

// Declare marked for TypeScript
declare const marked: any

interface AdvancedLessonFormProps {
  courses: any[]
  lessons: any[]
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

export default function AdvancedLessonForm({
  courses,
  lessons,
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: AdvancedLessonFormProps) {
  const [formData, setFormData] = useState({
    courseId: initialData?.module?.courseId || "",
    title: initialData?.title || "",
    summary: initialData?.summary || "",
    transcriptMd: initialData?.transcriptMd || "",
    actionChecklistMd: initialData?.actionChecklistMd || "",
    videoUrl: initialData?.videoUrl || "",
    order: initialData?.order || 0,
    requiredTier: initialData?.requiredTier || "STARTER",
    isFreePreview: initialData?.isFreePreview || false,
    // New fields
    lessonType: initialData?.lessonType || "Texto Principal",
    estimatedDuration: initialData?.estimatedDuration || 0,
    quizQuestions: initialData?.quizQuestions ? JSON.parse(initialData.quizQuestions) : [],
    assignments: initialData?.assignments || "",
    interactionPoints: initialData?.interactionPoints || 0,
    completionPoints: initialData?.completionPoints || 100,
    badgeName: initialData?.badgeName || "",
    badgeIcon: initialData?.badgeIcon || "",
    completionMessage: initialData?.completionMessage || "",
    additionalReward: initialData?.additionalReward || "",
    prerequisites: initialData?.prerequisites ? JSON.parse(initialData.prerequisites) : [],
    tags: initialData?.tags ? JSON.parse(initialData.tags) : [],
    status: initialData?.status || "Borrador",
    attachments: initialData?.attachments ? JSON.parse(initialData.attachments) : [],
  })

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    content: true,
    interactive: false,
    files: false,
    gamification: false,
    advanced: false,
  })

  const [videoThumbnail, setVideoThumbnail] = useState("")
  const [videoDuration, setVideoDuration] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const badgeInputRef = useRef<HTMLInputElement>(null)

  const suggestedTags = ["IA Básica", "Automatización", "Marketing", "Ventas", "Productos Digitales", "Servicios", "Freelance", "SaaS"]

  // Load marked.js for Markdown preview
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).markedLoaded) {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"
      script.onload = () => {
        ;(window as any).markedLoaded = true
        if (marked) {
          marked.setOptions({
            breaks: true,
            gfm: true,
          })
        }
      }
      document.head.appendChild(script)
    }
  }, [])

  // Auto-detect video duration and thumbnail
  useEffect(() => {
    if (formData.videoUrl) {
      const youtubeMatch = formData.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      const vimeoMatch = formData.videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/)

      if (youtubeMatch) {
        const videoId = youtubeMatch[1]
        setVideoThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
        // YouTube API would be needed for duration, using placeholder
        setVideoDuration(0)
      } else if (vimeoMatch) {
        const videoId = vimeoMatch[1]
        setVideoThumbnail(`https://vumbnail.com/${videoId}.jpg`)
        setVideoDuration(0)
      } else {
        setVideoThumbnail("")
        setVideoDuration(0)
      }
    } else {
      setVideoThumbnail("")
      setVideoDuration(0)
    }
  }, [formData.videoUrl])

  // Auto-increment order
  useEffect(() => {
    if (!isEditing && formData.courseId && formData.order === 0) {
      const courseLessons = lessons.filter((l) => l.module?.courseId === formData.courseId)
      const maxOrder = courseLessons.length > 0 ? Math.max(...courseLessons.map((l: any) => l.order || 0)) : 0
      setFormData((prev) => ({ ...prev, order: maxOrder + 1 }))
    }
  }, [formData.courseId, lessons, isEditing])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const addQuizQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      quizQuestions: [
        ...prev.quizQuestions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ],
    }))
  }

  const removeQuizQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      quizQuestions: prev.quizQuestions.filter((_: any, i: number) => i !== index),
    }))
  }

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.quizQuestions]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, quizQuestions: updated }
    })
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t: string) => t !== tagToRemove) }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          url: event.target?.result || "",
          uploadedAt: new Date().toISOString(),
        }
        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, fileData],
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_: any, i: number) => i !== index),
    }))
  }

  const handleBadgeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          badgeIcon: event.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.courseId) newErrors.courseId = "Curso es requerido"
    if (!formData.title || formData.title.length > 80) {
      newErrors.title = formData.title.length > 80 ? "Máximo 80 caracteres" : "Título es requerido"
    }
    if (!formData.lessonType) newErrors.lessonType = "Tipo de lección es requerido"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()

    if (!validate()) {
      alert("Por favor corrige los errores en el formulario")
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        ...formData,
        quizQuestions: JSON.stringify(formData.quizQuestions),
        prerequisites: JSON.stringify(formData.prerequisites),
        tags: JSON.stringify(formData.tags),
        attachments: JSON.stringify(formData.attachments),
        status: publish ? "Publicada" : formData.status,
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error("Error submitting:", error)
      alert("Error al guardar la lección")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderMarkdownPreview = (markdown: string) => {
    if (typeof window !== "undefined" && (window as any).marked) {
      try {
        return { __html: marked.parse(markdown || "") }
      } catch (e) {
        return { __html: markdown }
      }
    }
    return { __html: markdown }
  }

  const renderFullPreview = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Vista Previa Completa</h2>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{formData.title || "Título de la Lección"}</h1>
              <p className="text-gray-600">{formData.summary || "Resumen de la lección"}</p>
            </div>

            {formData.videoUrl && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Video</h3>
                {videoThumbnail ? (
                  <img src={videoThumbnail} alt="Video thumbnail" className="w-full rounded-lg" />
                ) : (
                  <div className="bg-gray-200 p-8 text-center rounded-lg">Video: {formData.videoUrl}</div>
                )}
              </div>
            )}

            {formData.transcriptMd && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Contenido</h3>
                <div className="prose max-w-none" dangerouslySetInnerHTML={renderMarkdownPreview(formData.transcriptMd)} />
              </div>
            )}

            {formData.actionChecklistMd && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Checklist de Acción</h3>
                <div className="prose max-w-none" dangerouslySetInnerHTML={renderMarkdownPreview(formData.actionChecklistMd)} />
              </div>
            )}

            {formData.quizQuestions.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Quiz</h3>
                {formData.quizQuestions.map((q: any, i: number) => (
                  <div key={i} className="mb-4 p-4 border rounded-lg">
                    <p className="font-semibold mb-2">{q.question || `Pregunta ${i + 1}`}</p>
                    <ul className="list-disc list-inside">
                      {q.options.map((opt: string, j: number) => (
                        <li key={j} className={j === q.correctAnswer ? "text-green-600 font-semibold" : ""}>
                          {opt || `Opción ${j + 1}`} {j === q.correctAnswer && "✓"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {formData.completionPoints > 0 && (
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-6 w-6" />
                  <h3 className="text-xl font-semibold">¡Lección Completada!</h3>
                </div>
                <p className="mb-2">Ganaste {formData.completionPoints} puntos</p>
                {formData.badgeName && (
                  <div className="flex items-center gap-2">
                    {formData.badgeIcon && <img src={formData.badgeIcon} alt="Badge" className="w-12 h-12" />}
                    <span className="font-semibold">Badge: {formData.badgeName}</span>
                  </div>
                )}
                {formData.completionMessage && (
                  <p className="mt-2 italic">{formData.completionMessage}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const SectionHeader = ({
    title,
    icon: Icon,
    section,
    required = false,
  }: {
    title: string
    icon: any
    section: keyof typeof expandedSections
    required?: boolean
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {required && <span className="text-red-500 text-sm">*</span>}
      </div>
      {expandedSections[section] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
    </button>
  )

  return (
    <>
      <Card className="mb-8 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {isEditing ? "Editar Lección" : "Nueva Lección"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            {/* Sección 1: Información Básica */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader title="Información Básica" icon={FileText} section="basic" required />
              {expandedSections.basic && (
                <div className="p-6 space-y-4 bg-white">
                  <div>
                    <Label htmlFor="courseId" className="flex items-center gap-2">
                      Curso <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="courseId"
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      required
                      className={`w-full mt-2 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${errors.courseId ? "border-red-500" : ""}`}
                    >
                      <option value="">Seleccionar curso</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>}
                  </div>

                  <div>
                    <Label htmlFor="title" className="flex items-center gap-2">
                      Título <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500">({formData.title.length}/80)</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      maxLength={80}
                      className={`mt-2 ${errors.title ? "border-red-500" : ""}`}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="summary">Resumen (Markdown)</Label>
                      <textarea
                        id="summary"
                        value={formData.summary}
                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        className="w-full mt-2 p-3 border rounded-md font-mono text-sm"
                        rows={4}
                        placeholder="Breve descripción de la lección..."
                      />
                    </div>
                    <div>
                      <Label>Preview del Resumen</Label>
                      <div className="mt-2 p-3 border rounded-md bg-gray-50 min-h-[100px] prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={renderMarkdownPreview(formData.summary)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="lessonType" className="flex items-center gap-2">
                      Tipo de Lección <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="lessonType"
                      value={formData.lessonType}
                      onChange={(e) => setFormData({ ...formData, lessonType: e.target.value })}
                      required
                      className={`w-full mt-2 p-3 border rounded-md ${errors.lessonType ? "border-red-500" : ""}`}
                    >
                      <option value="Texto Principal">Texto Principal</option>
                      <option value="Video Principal">Video Principal</option>
                      <option value="Interactivo">Interactivo</option>
                      <option value="Mixto">Mixto</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estimatedDuration">Duración Estimada (minutos)</Label>
                      <Input
                        id="estimatedDuration"
                        type="number"
                        value={formData.estimatedDuration}
                        onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                        min={0}
                      />
                      {videoDuration > 0 && (
                        <p className="text-sm text-gray-500 mt-1">Duración detectada: {videoDuration} min</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="order">Orden</Label>
                      <Input
                        id="order"
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                        min={0}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requiredTier">Tier Requerido</Label>
                    <select
                      id="requiredTier"
                      value={formData.requiredTier}
                      onChange={(e) => setFormData({ ...formData, requiredTier: e.target.value as Tier })}
                      className="w-full mt-2 p-3 border rounded-md"
                    >
                      <option value="STARTER">Starter</option>
                      <option value="PRO">Pro</option>
                      <option value="OPERATOR">Operator</option>
                      <option value="FREE">Gratis</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFreePreview"
                      checked={formData.isFreePreview}
                      onChange={(e) => setFormData({ ...formData, isFreePreview: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isFreePreview">Preview Gratis</Label>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 2: Contenido Principal */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader title="Contenido Principal" icon={FileText} section="content" />
              {expandedSections.content && (
                <div className="p-6 space-y-4 bg-white">
                  <div>
                    <Label htmlFor="transcriptMd">Contenido de Texto Principal (Markdown)</Label>
                    <textarea
                      id="transcriptMd"
                      value={formData.transcriptMd}
                      onChange={(e) => setFormData({ ...formData, transcriptMd: e.target.value })}
                      className="w-full mt-2 p-3 border rounded-md font-mono text-sm"
                      rows={12}
                      placeholder="# Título&#10;&#10;Contenido en Markdown..."
                    />
                    <div className="mt-4">
                      <Label>Preview del Contenido (Actualización en Tiempo Real)</Label>
                      <div className="mt-2 p-4 border rounded-md bg-gray-50 prose max-w-none max-h-96 overflow-y-auto">
                        <div dangerouslySetInnerHTML={renderMarkdownPreview(formData.transcriptMd)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="actionChecklistMd">Checklist de Acción (Markdown)</Label>
                    <textarea
                      id="actionChecklistMd"
                      value={formData.actionChecklistMd}
                      onChange={(e) => setFormData({ ...formData, actionChecklistMd: e.target.value })}
                      className="w-full mt-2 p-3 border rounded-md font-mono text-sm"
                      rows={6}
                      placeholder="- [ ] Tarea 1&#10;- [ ] Tarea 2..."
                    />
                    <div className="mt-4">
                      <Label>Preview del Checklist</Label>
                      <div className="mt-2 p-4 border rounded-md bg-gray-50 prose max-w-none">
                        <div dangerouslySetInnerHTML={renderMarkdownPreview(formData.actionChecklistMd)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="videoUrl">URL del Video (YouTube/Vimeo)</Label>
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="mt-2"
                      placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                    />
                    {videoThumbnail && (
                      <div className="mt-4">
                        <Label>Preview del Video</Label>
                        <img src={videoThumbnail} alt="Video thumbnail" className="mt-2 w-full max-w-md rounded-lg border" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sección 3: Interactivo */}
            {(formData.lessonType === "Interactivo" || formData.lessonType === "Mixto") && (
              <div className="border rounded-lg overflow-hidden">
                <SectionHeader title="Interactivo" icon={Zap} section="interactive" />
                {expandedSections.interactive && (
                  <div className="p-6 space-y-4 bg-white">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Preguntas de Quiz</Label>
                        <Button type="button" onClick={addQuizQuestion} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar Pregunta
                        </Button>
                      </div>
                      {formData.quizQuestions.map((q: any, index: number) => (
                        <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">Pregunta {index + 1}</span>
                            <Button type="button" onClick={() => removeQuizQuestion(index)} variant="outline" size="sm">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            placeholder="Pregunta..."
                            value={q.question}
                            onChange={(e) => updateQuizQuestion(index, "question", e.target.value)}
                            className="mb-2"
                          />
                          {q.options.map((opt: string, optIndex: number) => (
                            <div key={optIndex} className="flex items-center gap-2 mb-2">
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={q.correctAnswer === optIndex}
                                onChange={() => updateQuizQuestion(index, "correctAnswer", optIndex)}
                                className="w-4 h-4"
                              />
                              <Input
                                placeholder={`Opción ${optIndex + 1}`}
                                value={opt}
                                onChange={(e) => {
                                  const newOptions = [...q.options]
                                  newOptions[optIndex] = e.target.value
                                  updateQuizQuestion(index, "options", newOptions)
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label htmlFor="assignments">Tareas o Assignments (Markdown)</Label>
                      <textarea
                        id="assignments"
                        value={formData.assignments}
                        onChange={(e) => setFormData({ ...formData, assignments: e.target.value })}
                        className="w-full mt-2 p-3 border rounded-md font-mono text-sm"
                        rows={6}
                        placeholder="Instrucciones para tareas o entregables..."
                      />
                      <div className="mt-4">
                        <Label>Preview de Tareas</Label>
                        <div className="mt-2 p-4 border rounded-md bg-gray-50 prose max-w-none">
                          <div dangerouslySetInnerHTML={renderMarkdownPreview(formData.assignments)} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="interactionPoints">Puntos por Interacción</Label>
                      <Input
                        id="interactionPoints"
                        type="number"
                        value={formData.interactionPoints}
                        onChange={(e) => setFormData({ ...formData, interactionPoints: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                        min={0}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sección 4: Archivos y Recursos */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader title="Archivos y Recursos" icon={FileText} section="files" />
              {expandedSections.files && (
                <div className="p-6 space-y-4 bg-white">
                  <div>
                    <Label>Archivos Adjuntos</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Subir Archivos
                    </Button>
                    {formData.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.attachments.map((att: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {att.type?.startsWith("image/") && att.url && (
                                <img src={att.url} alt={att.name} className="w-12 h-12 object-cover rounded" />
                              )}
                              <div>
                                <p className="font-medium">{att.name}</p>
                                <p className="text-sm text-gray-500">{(att.size / 1024).toFixed(2)} KB</p>
                              </div>
                            </div>
                            <Button type="button" onClick={() => removeAttachment(index)} variant="outline" size="sm">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sección 5: Gamificación */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader title="Gamificación" icon={Trophy} section="gamification" />
              {expandedSections.gamification && (
                <div className="p-6 space-y-4 bg-white">
                  <div>
                    <Label htmlFor="completionPoints" className="flex items-center gap-2">
                      Puntos por Completar Lección
                      <span className="text-xs text-gray-500" title="Los puntos motivan al alumno como en un juego">
                        (ℹ️)
                      </span>
                    </Label>
                    <Input
                      id="completionPoints"
                      type="number"
                      value={formData.completionPoints}
                      onChange={(e) => setFormData({ ...formData, completionPoints: parseInt(e.target.value) || 0 })}
                      className="mt-2"
                      min={0}
                    />
                  </div>

                  <div>
                    <Label htmlFor="badgeName">Nombre del Badge</Label>
                    <Input
                      id="badgeName"
                      value={formData.badgeName}
                      onChange={(e) => setFormData({ ...formData, badgeName: e.target.value })}
                      className="mt-2"
                      placeholder="Ej: Automatizador, Experto IA..."
                    />
                  </div>

                  <div>
                    <Label>Icono del Badge</Label>
                    <input
                      ref={badgeInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBadgeUpload}
                      className="hidden"
                    />
                    <div className="mt-2 flex items-center gap-4">
                      <Button
                        type="button"
                        onClick={() => badgeInputRef.current?.click()}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Subir Icono
                      </Button>
                      {formData.badgeIcon && (
                        <div className="flex items-center gap-2">
                          <img src={formData.badgeIcon} alt="Badge" className="w-16 h-16 object-cover rounded-full border-2 border-yellow-400" />
                          <span className="text-sm text-gray-600">Preview del Badge</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="completionMessage">Mensaje de Felicitación</Label>
                    <textarea
                      id="completionMessage"
                      value={formData.completionMessage}
                      onChange={(e) => setFormData({ ...formData, completionMessage: e.target.value })}
                      className="w-full mt-2 p-3 border rounded-md"
                      rows={3}
                      placeholder="¡Felicitaciones! Ganaste 100 puntos y el badge 'Automatizador' 🎉"
                    />
                    {formData.completionMessage && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg">
                        <div dangerouslySetInnerHTML={{ __html: formData.completionMessage.replace(/\n/g, "<br />") }} />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="additionalReward">Recompensa Adicional</Label>
                    <textarea
                      id="additionalReward"
                      value={formData.additionalReward}
                      onChange={(e) => setFormData({ ...formData, additionalReward: e.target.value })}
                      className="w-full mt-2 p-3 border rounded-md"
                      rows={2}
                      placeholder="Ej: Desbloquea template exclusiva, Acceso a bonus..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sección 6: Avanzado */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader title="Avanzado" icon={Settings} section="advanced" />
              {expandedSections.advanced && (
                <div className="p-6 space-y-4 bg-white">
                  <div>
                    <Label htmlFor="prerequisites">Prerrequisitos (Selecciona lecciones del mismo curso)</Label>
                    <select
                      id="prerequisites"
                      multiple
                      value={formData.prerequisites}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, (option) => option.value)
                        setFormData({ ...formData, prerequisites: selected })
                      }}
                      className="w-full mt-2 p-3 border rounded-md min-h-[100px]"
                    >
                      {lessons
                        .filter((l) => l.module?.courseId === formData.courseId && l.id !== initialData?.id)
                        .map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.title}
                          </option>
                        ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Mantén presionado Ctrl/Cmd para seleccionar múltiples</p>
                  </div>

                  <div>
                    <Label>Etiquetas/Tags</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                          {formData.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-blue-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="mt-2">
                      <Label className="text-sm text-gray-600">Sugerencias:</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {suggestedTags
                          .filter((tag) => !formData.tags.includes(tag))
                          .map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addTag(tag)}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                            >
                              + {tag}
                            </button>
                          ))}
                      </div>
                      <Input
                        type="text"
                        placeholder="Agregar tag personalizado..."
                        className="mt-2"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            const input = e.target as HTMLInputElement
                            if (input.value.trim()) {
                              addTag(input.value.trim())
                              input.value = ""
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full mt-2 p-3 border rounded-md"
                    >
                      <option value="Borrador">Borrador</option>
                      <option value="Publicada">Publicada</option>
                      <option value="Archivada">Archivada</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Guardando..." : "Guardar como Borrador"}
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                Publicar Lección
              </Button>
              <Button type="button" onClick={() => setShowPreview(true)} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa Completa
              </Button>
              <Button type="button" onClick={onCancel} variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showPreview && renderFullPreview()}
    </>
  )
}

