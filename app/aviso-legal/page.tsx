import { getPageContent } from "@/lib/pages"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

const DEFAULT_CONTENT = {
  title: "Aviso Legal",
  content: `## Información General

Nexo es un programa educativo diseñado para enseñar el uso de inteligencia artificial para generar ingresos.

## Disclaimer de Ingresos

Los resultados dependen de la ejecución, habilidades, contexto y mercado de cada persona. Este programa no garantiza ingresos ni resultados específicos. El objetivo es enseñar sistemas reales y ejecutables utilizados en el mercado.

## Uso del Contenido

Todo el contenido es propiedad de Nexo. Está prohibida la redistribución, venta o uso comercial sin autorización.

## Contacto

Para consultas legales, contáctanos a través de WhatsApp o email.`,
}

export async function generateMetadata(): Promise<Metadata> {
  const pageContent = await getPageContent("aviso-legal")
  const title = pageContent?.metaTitle || pageContent?.title || DEFAULT_CONTENT.title
  const description = pageContent?.metaDescription || "Aviso legal de Nexo"

  return {
    title,
    description,
  }
}

export default async function AvisoLegalPage() {
  const pageContent = await getPageContent("aviso-legal")
  const title = pageContent?.title || DEFAULT_CONTENT.title
  const content = pageContent?.content || DEFAULT_CONTENT.content

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{title}</h1>
        
        <div className="prose max-w-none space-y-6">
          <div 
            className="prose-content"
            dangerouslySetInnerHTML={{ 
              __html: content
                .split('\n\n')
                .map((paragraph) => {
                  if (paragraph.startsWith('## ')) {
                    return `<h2 class="text-2xl font-semibold mb-4 mt-6">${paragraph.replace(/^## /, '')}</h2>`
                  }
                  if (paragraph.startsWith('### ')) {
                    return `<h3 class="text-xl font-semibold mb-3 mt-4">${paragraph.replace(/^### /, '')}</h3>`
                  }
                  return `<p class="text-gray-700 mb-4">${paragraph.replace(/\n/g, '<br />')}</p>`
                })
                .join('')
            }} 
          />
        </div>
      </div>
    </div>
  )
}

