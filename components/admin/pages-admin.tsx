"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Edit, Save, X, Loader2 } from "lucide-react"
import Link from "next/link"

interface Page {
  id: string
  name: string
  route: string
  description: string
}

interface PageContent {
  title?: string
  content?: string
  metaTitle?: string
  metaDescription?: string
  [key: string]: any
}

interface PagesAdminProps {
  pages: Page[]
  pageContents: Record<string, PageContent>
}

export default function PagesAdmin({ pages, pageContents }: PagesAdminProps) {
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<PageContent>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const startEditing = (page: Page) => {
    setEditingPageId(page.id)
    setEditedContent(pageContents[page.id] || {})
    setSaved(false)
  }

  const cancelEditing = () => {
    setEditingPageId(null)
    setEditedContent({})
  }

  const handleSave = async (pageId: string) => {
    setSaving(true)
    setSaved(false)

    try {
      const response = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          content: editedContent,
        }),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => {
          setSaved(false)
          setEditingPageId(null)
          window.location.reload() // Reload to show updated content
        }, 1000)
      } else {
        const error = await response.json()
        alert(error.error || "Error al guardar")
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
            <p className="text-gray-600 mt-2">Gestiona el contenido de todas las páginas del sitio</p>
          </div>
        </div>

        <div className="grid gap-6">
          {pages.map((page) => {
            const isEditing = editingPageId === page.id
            const content = pageContents[page.id] || {}
            const currentContent = isEditing ? editedContent : content

            return (
              <Card key={page.id} className="overflow-hidden">
                <CardHeader className="bg-white border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl">{page.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{page.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {!isEditing && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={page.route} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(page)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {isEditing ? (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor={`title-${page.id}`}>Title</Label>
                        <Input
                          id={`title-${page.id}`}
                          value={currentContent.title || ""}
                          onChange={(e) =>
                            setEditedContent({ ...editedContent, title: e.target.value })
                          }
                          placeholder="Título de la página"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`metaTitle-${page.id}`}>Meta Title (SEO)</Label>
                        <Input
                          id={`metaTitle-${page.id}`}
                          value={currentContent.metaTitle || ""}
                          onChange={(e) =>
                            setEditedContent({ ...editedContent, metaTitle: e.target.value })
                          }
                          placeholder="Título para SEO"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`metaDescription-${page.id}`}>Meta Description (SEO)</Label>
                        <Textarea
                          id={`metaDescription-${page.id}`}
                          value={currentContent.metaDescription || ""}
                          onChange={(e) =>
                            setEditedContent({ ...editedContent, metaDescription: e.target.value })
                          }
                          placeholder="Descripción para SEO"
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`content-${page.id}`}>Content</Label>
                        <Textarea
                          id={`content-${page.id}`}
                          value={currentContent.content || ""}
                          onChange={(e) =>
                            setEditedContent({ ...editedContent, content: e.target.value })
                          }
                          placeholder="Contenido de la página (Markdown soportado)"
                          className="mt-1 font-mono"
                          rows={15}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Puedes usar Markdown para formatear el contenido
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={cancelEditing}
                          disabled={saving}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleSave(page.id)}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              {saved ? "Guardado!" : "Save"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {content.title && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                        </div>
                      )}
                      {content.content ? (
                        <div className="prose max-w-none">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded border">
                            {content.content}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">No hay contenido configurado para esta página</p>
                      )}
                      {content.metaTitle && (
                        <div className="text-xs text-gray-500 pt-2 border-t">
                          <strong>Meta Title:</strong> {content.metaTitle}
                        </div>
                      )}
                      {content.metaDescription && (
                        <div className="text-xs text-gray-500">
                          <strong>Meta Description:</strong> {content.metaDescription}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
