"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Download, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LessonPlayer({
  lesson,
  course,
  progress,
  nextLesson,
  userId,
}: {
  lesson: any
  course: any
  progress: any
  nextLesson: any
  userId: string
}) {
  const router = useRouter()
  const [completed, setCompleted] = useState(progress?.completed || false)
  const [markingComplete, setMarkingComplete] = useState(false)

  const handleMarkComplete = async () => {
    setMarkingComplete(true)
    try {
      const response = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          completed: !completed,
        }),
      })

      if (response.ok) {
        setCompleted(!completed)
        router.refresh()
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error)
    } finally {
      setMarkingComplete(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/curso"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Volver al curso
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{lesson.title}</CardTitle>
            {lesson.summary && (
              <p className="text-gray-600">{lesson.summary}</p>
            )}
          </CardHeader>
          <CardContent>
            {lesson.videoUrl && (
              <div className="mb-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={lesson.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {lesson.transcriptMd && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Transcripción</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.transcriptMd }}
                />
              </div>
            )}

            {lesson.actionChecklistMd && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Checklist de Acción</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.actionChecklistMd }}
                />
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleMarkComplete}
                disabled={markingComplete}
                variant={completed ? "outline" : "default"}
              >
                {completed ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completada
                  </>
                ) : (
                  "Marcar como Completada"
                )}
              </Button>

              {nextLesson && (
                <Button asChild>
                  <Link href={`/curso/${course.slug}/leccion/${nextLesson.slug}`}>
                    Siguiente Lección
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Downloads section if applicable */}
        {lesson.downloads && lesson.downloads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Descargas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lesson.downloads.map((download: any, index: number) => (
                  <a
                    key={index}
                    href={download.url}
                    download
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Download className="h-4 w-4" />
                    {download.name}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

