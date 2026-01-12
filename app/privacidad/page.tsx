import { getPageContent } from "@/lib/pages"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

const DEFAULT_CONTENT = {
  title: "Política de Privacidad",
  content: `## 1. Información que Recopilamos

Recopilamos información que nos proporcionas directamente, como nombre, email, y respuestas del quiz. También recopilamos datos de uso a través de herramientas de analytics.

## 2. Uso de la Información

Usamos tu información para proporcionar el servicio, procesar pagos, enviar comunicaciones relacionadas con el curso, y mejorar nuestra plataforma.

## 3. Compartir Información

No vendemos tu información. Compartimos datos con proveedores de servicios necesarios (Supabase, Stripe, Resend) para operar la plataforma.

## 4. Seguridad

Implementamos medidas de seguridad para proteger tu información, pero ningún sistema es 100% seguro.

## 5. Tus Derechos

Tienes derecho a acceder, corregir o eliminar tu información personal. Contáctanos para ejercer estos derechos.`,
}

export async function generateMetadata(): Promise<Metadata> {
  const pageContent = await getPageContent("privacy")
  const title = pageContent?.metaTitle || pageContent?.title || DEFAULT_CONTENT.title
  const description = pageContent?.metaDescription || "Política de privacidad de Nexo"

  return {
    title,
    description,
  }
}

export default async function PrivacidadPage() {
  const pageContent = await getPageContent("privacy")
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

