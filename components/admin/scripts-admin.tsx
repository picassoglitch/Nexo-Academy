"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Download, FileText } from "lucide-react"
import { Tier } from "@/lib/types"

export default function ScriptsAdmin({ scripts: initialScripts }: { scripts: any[] }) {
  const [scripts, setScripts] = useState(initialScripts)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    requiredTier: Tier.STARTER,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editing ? `/api/admin/assets/${editing.id}` : "/api/admin/assets"
    const method = editing ? "PUT" : "POST"

    // Always set category to "Scripts" for scripts
    const payload = {
      ...formData,
      category: "Scripts",
    }

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const updated = await response.json()
      if (editing) {
        setScripts(scripts.map((s) => (s.id === editing.id ? updated : s)))
      } else {
        setScripts([...scripts, updated])
      }
      setShowForm(false)
      setEditing(null)
      setFormData({
        title: "",
        description: "",
        fileUrl: "",
        requiredTier: Tier.STARTER,
      })
      window.location.reload()
    } else {
      const error = await response.json()
      alert(error.error || "Error al guardar")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este script?")) return

    const response = await fetch(`/api/admin/assets/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setScripts(scripts.filter((s) => s.id !== id))
      window.location.reload()
    }
  }

  const handleEdit = (script: any) => {
    setEditing(script)
    setFormData({
      title: script.title,
      description: script.description || "",
      fileUrl: script.fileUrl,
      requiredTier: script.requiredTier,
    })
    setShowForm(true)
  }

  const getTierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      STARTER: "Starter",
      PRO: "Pro",
      OPERATOR: "Operator",
    }
    return labels[tier] || tier
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Scripts</h1>
            <p className="text-gray-600 mt-1">Administra los scripts disponibles para los usuarios</p>
          </div>
          <Button onClick={() => {
            setShowForm(!showForm)
            setEditing(null)
            setFormData({
              title: "",
              description: "",
              fileUrl: "",
              requiredTier: Tier.STARTER,
            })
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Script
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editing ? "Editar Script" : "Nuevo Script"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Ej: Script WhatsApp inicial"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción del script"
                  />
                </div>

                <div>
                  <Label htmlFor="fileUrl">URL del Archivo *</Label>
                  <Input
                    id="fileUrl"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    required
                    placeholder="/scripts/script-whatsapp-inicial.docx"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL del archivo (puede ser relativa o absoluta)
                  </p>
                </div>

                <div>
                  <Label htmlFor="requiredTier">Tier Requerido *</Label>
                  <select
                    id="requiredTier"
                    value={formData.requiredTier}
                    onChange={(e) => setFormData({ ...formData, requiredTier: e.target.value as Tier })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value={Tier.STARTER}>Starter</option>
                    <option value={Tier.PRO}>Pro</option>
                    <option value={Tier.OPERATOR}>Operator</option>
                  </select>
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
                        description: "",
                        fileUrl: "",
                        requiredTier: Tier.STARTER,
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

        {scripts.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay scripts creados aún</p>
              <p className="text-sm text-gray-500 mt-2">
                Crea tu primer script usando el botón "Nuevo Script"
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scripts.map((script) => (
              <Card key={script.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{script.title}</CardTitle>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {getTierLabel(script.requiredTier)}
                    </span>
                  </div>
                  {script.description && (
                    <p className="text-sm text-gray-600 mt-2">{script.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <a
                      href={script.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      {script.fileUrl}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(script)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(script.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href={script.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



