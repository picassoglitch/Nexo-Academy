import { getPageContent } from "@/lib/pages"
import { DISCLAIMER_TEXT } from "@/lib/constants"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

const DEFAULT_CONTENT = {
  title: "Disclaimer de Ingresos",
  content: `## No Garantizamos Resultados

Nexo es un curso educativo que enseña estrategias y técnicas para generar ingresos con IA. No garantizamos que obtendrás ingresos específicos, ni que los resultados mostrados por otros participantes serán replicables en tu situación.

## Factores que Afectan los Resultados

- Tu nivel de esfuerzo y dedicación
- Tu experiencia previa y habilidades
- Las condiciones del mercado local
- Tu capacidad de ejecutar las estrategias enseñadas
- Factores económicos y de competencia

## Testimonios y Casos de Estudio

Los testimonios y casos de estudio compartidos son experiencias reales de participantes, pero no son garantía de resultados futuros. Cada situación es única.

## Responsabilidad

Al participar en este curso, reconoces que eres responsable de tus propias decisiones de negocio y que Nexo no se hace responsable por pérdidas financieras o resultados no obtenidos.`,
}

export async function generateMetadata(): Promise<Metadata> {
  const pageContent = await getPageContent("disclaimer")
  const title = pageContent?.metaTitle || pageContent?.title || DEFAULT_CONTENT.title
  const description = pageContent?.metaDescription || DISCLAIMER_TEXT

  return {
    title,
    description,
  }
}

export default async function DisclaimerPage() {
  const pageContent = await getPageContent("disclaimer")
  const title = pageContent?.title || DEFAULT_CONTENT.title
  const content = pageContent?.content || DEFAULT_CONTENT.content

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{title}</h1>
        
        <div className="prose max-w-none space-y-6">
          <section className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
            <p className="text-lg font-semibold text-yellow-800 mb-4">
              {DISCLAIMER_TEXT}
            </p>
          </section>
          
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
                  if (paragraph.startsWith('- ')) {
                    const items = paragraph.split('\n').filter(line => line.startsWith('- '))
                    return `<ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">${items.map(item => `<li>${item.replace(/^- /, '')}</li>`).join('')}</ul>`
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

