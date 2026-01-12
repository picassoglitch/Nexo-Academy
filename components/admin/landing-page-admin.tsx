"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save, Loader2 } from "lucide-react"

interface LandingPageConfig {
  heroTitle: string
  heroSubtitle: string
  heroCtaText: string
  heroCtaLink: string
  heroSecondaryCtaText: string
  videoUrl: string
  videoTitle: string
  videoDescription: string
  aboutTitle: string
  aboutDescription: string
  aboutFeature1: string
  aboutFeature2: string
  aboutFeature3: string
}

export default function LandingPageAdmin({ initialConfig }: { initialConfig: LandingPageConfig }) {
  const [config, setConfig] = useState<LandingPageConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    try {
      const response = await fetch("/api/admin/landing-page-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Configuración del Landing Page</h1>
            <p className="text-gray-600 mt-1">Personaliza los mensajes y contenido del inicio</p>
          </div>
          {saved && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              ✓ Guardado
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Hero Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sección Hero (Principal)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="heroTitle">Título Principal</Label>
                <Textarea
                  id="heroTitle"
                  value={config.heroTitle}
                  onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                  rows={3}
                  placeholder="Aprende a usar IA para generar ingresos reales..."
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El título principal que aparece en la parte superior
                </p>
              </div>

              <div>
                <Label htmlFor="heroSubtitle">Subtítulo</Label>
                <Textarea
                  id="heroSubtitle"
                  value={config.heroSubtitle}
                  onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                  rows={2}
                  placeholder="Educación práctica enfocada en ejecución..."
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Texto descriptivo debajo del título
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="heroCtaText">Texto del Botón Principal</Label>
                  <Input
                    id="heroCtaText"
                    value={config.heroCtaText}
                    onChange={(e) => setConfig({ ...config, heroCtaText: e.target.value })}
                    placeholder="Empieza a ganar dinero"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="heroCtaLink">Link del Botón Principal</Label>
                  <Input
                    id="heroCtaLink"
                    value={config.heroCtaLink}
                    onChange={(e) => setConfig({ ...config, heroCtaLink: e.target.value })}
                    placeholder="/quiz"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="heroSecondaryCtaText">Texto del Botón Secundario</Label>
                  <Input
                    id="heroSecondaryCtaText"
                    value={config.heroSecondaryCtaText}
                    onChange={(e) => setConfig({ ...config, heroSecondaryCtaText: e.target.value })}
                    placeholder="Ver Cómo Funciona"
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sección "Sobre Nosotros"</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="aboutTitle">Título</Label>
                <Input
                  id="aboutTitle"
                  value={config.aboutTitle}
                  onChange={(e) => setConfig({ ...config, aboutTitle: e.target.value })}
                  placeholder="Somos un equipo de ingenieros en IA con experiencia real en startups"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Título principal de la sección "Sobre Nosotros"
                </p>
              </div>

              <div>
                <Label htmlFor="aboutDescription">Descripción</Label>
                <Textarea
                  id="aboutDescription"
                  value={config.aboutDescription}
                  onChange={(e) => setConfig({ ...config, aboutDescription: e.target.value })}
                  rows={3}
                  placeholder="Hemos construido y escalado productos con IA que generan ingresos reales. Ahora compartimos ese conocimiento contigo."
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Texto descriptivo debajo del título
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="aboutFeature1">Característica 1</Label>
                  <Input
                    id="aboutFeature1"
                    value={config.aboutFeature1}
                    onChange={(e) => setConfig({ ...config, aboutFeature1: e.target.value })}
                    placeholder="+10 años de experiencia en IA"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="aboutFeature2">Característica 2</Label>
                  <Input
                    id="aboutFeature2"
                    value={config.aboutFeature2}
                    onChange={(e) => setConfig({ ...config, aboutFeature2: e.target.value })}
                    placeholder="Productos escalados a miles de usuarios"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="aboutFeature3">Característica 3</Label>
                  <Input
                    id="aboutFeature3"
                    value={config.aboutFeature3}
                    onChange={(e) => setConfig({ ...config, aboutFeature3: e.target.value })}
                    placeholder="Con visión global y experiencia internacional"
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sección de Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="videoUrl">URL del Video</Label>
                <Input
                  id="videoUrl"
                  value={config.videoUrl}
                  onChange={(e) => setConfig({ ...config, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/embed/... o https://www.youtube.com/watch?v=..."
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL del video (YouTube, Vimeo, etc.). Puedes usar URL de YouTube normal o embed. Si usas URL normal (watch?v=...), se convertirá automáticamente a embed.
                </p>
              </div>

              <div>
                <Label htmlFor="videoTitle">Título del Video</Label>
                <Input
                  id="videoTitle"
                  value={config.videoTitle}
                  onChange={(e) => setConfig({ ...config, videoTitle: e.target.value })}
                  placeholder="Video: Conoce más sobre Nexo y nuestro enfoque"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Título que aparece sobre el video
                </p>
              </div>

              <div>
                <Label htmlFor="videoDescription">Descripción del Video</Label>
                <Textarea
                  id="videoDescription"
                  value={config.videoDescription}
                  onChange={(e) => setConfig({ ...config, videoDescription: e.target.value })}
                  rows={3}
                  placeholder="Descripción del video..."
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={saving} className="min-w-[120px]">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}



