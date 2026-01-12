"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Download } from "lucide-react"
import { Tier } from "@/lib/types"

export default function AssetsAdmin({ assets: initialAssets }: { assets: any[] }) {
  const [assets, setAssets] = useState(initialAssets)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    category: "",
    requiredTier: Tier.STARTER,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editing ? `/api/admin/assets/${editing.id}` : "/api/admin/assets"
    const method = editing ? "PUT" : "POST"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      const updated = await response.json()
      if (editing) {
        setAssets(assets.map((a) => (a.id === editing.id ? updated : a)))
      } else {
        setAssets([...assets, updated])
      }
      setShowForm(false)
      setEditing(null)
      setFormData({
        title: "",
        description: "",
        fileUrl: "",
        category: "",
        requiredTier: Tier.STARTER,
      })
      window.location.reload()
    } else {
      const error = await response.json()
      alert(error.error || "Error al guardar")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este activo?")) return

    const response = await fetch(`/api/admin/assets/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setAssets(assets.filter((a) => a.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestión de Activos/Plantillas</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                if (!confirm("¿Importar todas las plantillas por tier?\n\nEsto creará:\n- 8 plantillas STARTER\n- 7 plantillas PRO\n- 6 plantillas OPERATOR\n\nNota: Los archivos son placeholders. Debes subir los archivos reales después.")) return
                try {
                  const response = await fetch("/api/admin/assets/import-templates", { method: "POST" })
                  const data = await response.json()
                  if (response.ok) {
                    alert(`✅ ${data.message}\n\nSTARTER: ${data.summary.starter}\nPRO: ${data.summary.pro}\nOPERATOR: ${data.summary.operator}\nTotal: ${data.summary.total}`)
                    window.location.reload()
                  } else {
                    alert(`Error: ${data.error || data.details}`)
                  }
                } catch (error: any) {
                  alert(`Error al importar plantillas: ${error.message}`)
                }
              }}
            >
              📦 Importar Plantillas
            </Button>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Activo
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editing ? "Editar Activo" : "Nuevo Activo"}</CardTitle>
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
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full mt-2 p-2 border rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="fileUrl">URL del Archivo</Label>
                  <Input
                    id="fileUrl"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    required
                    className="mt-2"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-2"
                    placeholder="Template, Checklist, etc."
                  />
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
                        category: "",
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

        <div className="grid md:grid-cols-2 gap-4">
          {assets.map((asset) => (
            <Card key={asset.id}>
              <CardHeader>
                <CardTitle>{asset.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{asset.description}</p>
                <p className="text-xs text-gray-500 mb-4">
                  Categoría: {asset.category} | Tier: {asset.requiredTier}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(asset)
                      setFormData({
                        title: asset.title,
                        description: asset.description || "",
                        fileUrl: asset.fileUrl,
                        category: asset.category || "",
                        requiredTier: asset.requiredTier,
                      })
                      setShowForm(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(asset.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

