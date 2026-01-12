"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  BookOpen,
  Video,
  FileText,
  Zap,
  ArrowLeft,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Lesson {
  id: string
  slug: string
  title: string
  order: number
  lessonType: string | null
  module: {
    id: string
    title: string
    course: {
      id: string
      title: string
    }
  }
}

interface LessonsListProps {
  lessons: Lesson[]
  courseId: string
  courseTitle: string
}

export default function LessonsList({ lessons: initialLessons, courseId, courseTitle }: LessonsListProps) {
  const [lessons, setLessons] = useState(initialLessons)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const draggedLesson = lessons[draggedIndex]
    const newLessons = [...lessons]
    newLessons.splice(draggedIndex, 1)
    newLessons.splice(dropIndex, 0, draggedLesson)

    // Update order
    const updatedLessons = newLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
    }))

    setLessons(updatedLessons)
    setDraggedIndex(null)

    // Save new order to server
    try {
      await fetch(`/api/admin/lessons/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          lessons: updatedLessons.map((l) => ({ id: l.id, order: l.order })),
        }),
      })
    } catch (error) {
      console.error("Error reordering lessons:", error)
      // Revert on error
      setLessons(initialLessons)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta lección?")) return

    const response = await fetch(`/api/admin/lessons/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setLessons(lessons.filter((l) => l.id !== id))
    } else {
      alert("Error al eliminar la lección")
    }
  }

  const getLessonTypeIcon = (type: string | null) => {
    switch (type) {
      case "Video Principal":
        return <Video className="h-4 w-4" />
      case "Interactivo":
        return <Zap className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getLessonTypeBadge = (type: string | null) => {
    switch (type) {
      case "Video Principal":
        return <Badge className="bg-red-100 text-red-800">Video</Badge>
      case "Interactivo":
        return <Badge className="bg-purple-100 text-purple-800">Interactivo</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800">Texto</Badge>
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{courseTitle}</h1>
          <p className="text-gray-600 mt-1">Gestiona las lecciones de este curso</p>
        </div>
        <Button asChild>
          <Link href={`/admin/cursos/${courseId}/lecciones/nueva`}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Lección
          </Link>
        </Button>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No hay lecciones en este curso aún</p>
            <Button asChild>
              <Link href={`/admin/cursos/${courseId}/lecciones/nueva`}>
                <Plus className="mr-2 h-4 w-4" />
                Crear primera lección
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lecciones ({lessons.length})</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Arrastra las lecciones para reordenarlas
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-move ${
                    draggedIndex === index ? "opacity-50" : ""
                  }`}
                >
                  <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-500">#{lesson.order}</span>
                      <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                      {getLessonTypeBadge(lesson.lessonType)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {lesson.module.title} • {lesson.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/cursos/${courseId}/lecciones/${lesson.id}/editar`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(lesson.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



