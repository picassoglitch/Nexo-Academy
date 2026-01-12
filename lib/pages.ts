import { prisma } from "@/lib/prisma"

export interface PageContent {
  title?: string
  content?: string
  metaTitle?: string
  metaDescription?: string
  [key: string]: any
}

/**
 * Load page content from database
 */
export async function getPageContent(pageId: string): Promise<PageContent | null> {
  try {
    const configRecord = await prisma.quizConfig.findUnique({
      where: { key: `page_${pageId}` },
    })

    if (configRecord && configRecord.value) {
      const content = typeof configRecord.value === "string" 
        ? JSON.parse(configRecord.value) 
        : configRecord.value
      return content as PageContent
    }

    return null
  } catch (error) {
    console.error(`Error loading page content for ${pageId}:`, error)
    return null
  }
}

/**
 * Render markdown-like content to HTML (simple implementation)
 * For more advanced markdown, consider using a library like 'react-markdown'
 */
export function renderContent(content: string): string {
  if (!content) return ""
  
  // Simple markdown-like rendering
  let html = content
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-3 mt-6">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-4 mt-6">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 mt-6">$1</h1>')
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
  
  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
  
  // Line breaks
  html = html.replace(/\n\n/gim, '</p><p class="text-gray-700 mb-4">')
  html = html.replace(/\n/gim, '<br />')
  
  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
  html = html.replace(/(<li.*<\/li>)/s, '<ul class="list-disc list-inside space-y-2 mb-4">$1</ul>')
  
  return `<p class="text-gray-700 mb-4">${html}</p>`
}
