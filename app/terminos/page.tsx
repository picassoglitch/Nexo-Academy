import { getPageContent } from "@/lib/pages"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

const DEFAULT_CONTENT = {
  title: "Términos y Condiciones",
  content: `## 1. Aceptación de Términos

Al acceder y usar AI Ingresos 30D, aceptas estos términos y condiciones.

## 2. Uso del Servicio

El contenido del curso es para uso educativo y personal. No puedes redistribuir, revender o compartir el contenido sin autorización.

## 3. No Garantías

No garantizamos resultados específicos. Tus resultados dependen de tu esfuerzo, habilidades y mercado. Consulta nuestra política de reembolsos para más información.

## 4. Propiedad Intelectual

Todo el contenido del curso es propiedad de Nexo y está protegido por derechos de autor.

## 5. Modificaciones

Nos reservamos el derecho de modificar estos términos en cualquier momento.`,
}

export async function generateMetadata(): Promise<Metadata> {
  const pageContent = await getPageContent("terms")
  const title = pageContent?.metaTitle || pageContent?.title || DEFAULT_CONTENT.title
  const description = pageContent?.metaDescription || "Términos y condiciones de uso de Nexo"

  return {
    title,
    description,
  }
}

export default async function TerminosPage() {
  const pageContent = await getPageContent("terms")
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

