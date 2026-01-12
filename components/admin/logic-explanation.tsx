"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Save, X } from "lucide-react"

interface LogicExplanationProps {
  selectedNode: string | null
  editMode: boolean
}

const DEFAULT_EXPLANATIONS: Record<string, string> = {
  starter: `Para que un usuario termine en STARTER, necesita:
• Tener poca o ninguna experiencia con IA
• Buscar ingresos extra (no principales)
• Tener nivel técnico básico o principiante

Si alguien tiene experiencia avanzada o busca ingresos principales, NO irá aquí.

El sistema los dirige aquí porque necesitan más apoyo y un camino más estructurado para empezar.`,

  creator: `Para que un usuario termine en CREATOR, necesita:
• Estar MUY interesado en crear contenido O productos digitales
• Tener experiencia intermedia con IA
• Buscar monetizar su creatividad

Si alguien está más interesado en servicios o consultoría, irá a FREELANCER en su lugar.

El sistema los dirige aquí porque sus intereses y habilidades se alinean con la creación de contenido y productos digitales.`,

  freelancer: `Para que un usuario termine en FREELANCER, necesita:
• Estar MUY interesado en ofrecer servicios O consultoría
• Tener experiencia intermedia a avanzada
• Querer trabajar con clientes directamente

Si alguien está más interesado en contenido, irá a CREATOR. Si tiene experiencia avanzada + mucho tiempo, podría ir a SCALER.

El sistema los dirige aquí porque muestran interés claro en servicios y tienen la experiencia para trabajar con clientes.`,

  scaler: `Para que un usuario termine en SCALER, necesita:
• Tener experiencia AVANZADA con IA
• Y tener 20+ horas por semana disponibles
• O buscar ingresos principales (no solo extra) con experiencia avanzada

Si alguien tiene experiencia básica o intermedia, NO irá aquí, sin importar cuánto tiempo tenga.

El sistema los dirige aquí porque tienen los recursos, experiencia y ambición para escalar rápidamente.`,
}

export default function LogicExplanation({ selectedNode, editMode }: LogicExplanationProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState("")

  let nodeType = selectedNode?.toLowerCase() || ""
  if (nodeType.includes("starter")) nodeType = "starter"
  else if (nodeType.includes("creator")) nodeType = "creator"
  else if (nodeType.includes("freelancer")) nodeType = "freelancer"
  else if (nodeType.includes("scaler")) nodeType = "scaler"
  
  const explanation = DEFAULT_EXPLANATIONS[nodeType] || 
    "Selecciona un camino para ver qué tendría que contestar alguien para llegar ahí."

  const handleEdit = () => {
    setEditedText(explanation)
    setIsEditing(true)
  }

  const handleSave = () => {
    // In a real implementation, save to database
    setIsEditing(false)
    // TODO: Save editedText to database
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedText("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">¿Qué tendría que contestar alguien para caer en este camino?</h4>
        {editMode && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8"
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="min-h-[200px]"
            placeholder="Explica cómo funciona la lógica de recomendación..."
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="flex-1"
            >
              <Save className="h-3 w-3 mr-1" />
              Guardar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
            >
              <X className="h-3 w-3 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {explanation}
          </p>
        </Card>
      )}

      {editMode && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Nota:</strong> Los cambios en la lógica afectarán las recomendaciones futuras. 
            Se recomienda probar con el simulador antes de guardar.
          </p>
        </div>
      )}
    </div>
  )
}

