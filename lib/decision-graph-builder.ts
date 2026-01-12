// Decision Graph Builder
// Maps quiz questions to decision tree structure

export type NodeType = "start" | "question" | "decisive" | "adjuster" | "path"

export interface DecisionNode {
  id: string
  type: NodeType
  label: string
  section?: string
  questionId?: string
  meta?: {
    question?: string
    description?: string
    options?: Array<{ value: string; label: string }>
    isDecisive?: boolean
    paths?: string[] // Which paths this node can lead to
  }
}

export interface DecisionEdge {
  from: string
  to: string
  answerLabel: string
  answerValue: string
  isDecisive?: boolean
  userCount?: number // For analytics view
}

export interface DecisionGraph {
  nodes: DecisionNode[]
  edges: DecisionEdge[]
}

// Identify which questions are decisive for path assignment
const DECISIVE_QUESTIONS = [
  "experience-level",
  "time-available",
  "income-type",
  "interest-services",
  "interest-content",
  "interest-products",
  "interest-freelance",
]

// Questions that adjust but don't define the path
const ADJUSTER_QUESTIONS = [
  "main-goal",
  "time-horizon",
  "seriousness",
  "technical-level",
  "readiness",
]

// Final paths
const FINAL_PATHS = ["STARTER", "CREATOR", "FREELANCER", "SCALER"]

// Calculate which path a user would get based on answers
export function calculatePath(answers: Record<string, string | string[]>): string {
  const experience = answers["experience-level"] as string
  const timeAvailable = answers["time-available"] as string
  const incomeType = answers["income-type"] as string
  const interestServices = answers["interest-services"] as string
  const interestContent = answers["interest-content"] as string
  const interestProducts = answers["interest-products"] as string
  const interestFreelance = answers["interest-freelance"] as string

  // SCALER: Advanced experience + high time commitment OR main income goal + advanced
  if (
    (experience === "avanzada" && timeAvailable === "20h+") ||
    (incomeType === "ingresos-principales" && experience === "avanzada") ||
    (incomeType === "ingresos-principales" && timeAvailable === "20h+")
  ) {
    return "SCALER"
  }

  // FREELANCER: Interested in services or freelance
  if (
    interestServices === "muy-interesado" ||
    interestServices === "interesado" ||
    interestFreelance === "muy-interesado" ||
    interestFreelance === "interesado"
  ) {
    return "FREELANCER"
  }

  // CREATOR: Interested in content or products
  if (
    interestContent === "muy-interesado" ||
    interestContent === "interesado" ||
    interestProducts === "muy-interesado" ||
    interestProducts === "interesado"
  ) {
    return "CREATOR"
  }

  // Default: STARTER
  return "STARTER"
}

// Build decision graph from quiz structure
export function buildDecisionGraph(
  quizSteps: Array<{
    id: string
    section: string
    question: string
    description?: string
    type: "single" | "multiple" | "text" | "scale"
    options?: Array<{ value: string; label: string }>
  }>,
  quizResponses?: Array<{ payload: any }>
): DecisionGraph {
  const nodes: DecisionNode[] = []
  const edges: DecisionEdge[] = []

  // Add start node
  nodes.push({
    id: "start",
    type: "start",
    label: "Inicio",
  })

  // Process each question - create a linear flow first
  let previousNodeId = "start"
  const questionNodes: string[] = []
  const questionNodeMap: Record<string, string> = {} // Maps question ID to node ID
  const processedQuestionIds = new Set<string>() // Track processed questions to avoid duplicates

  quizSteps.forEach((step, index) => {
    // Skip text-only questions (name, email) for tree, but keep income-dream and success-visualization
    if (step.type === "text" && !["income-dream", "success-visualization"].includes(step.id)) {
      return
    }

    // Skip if we've already processed this question ID
    if (processedQuestionIds.has(step.id)) {
      return
    }
    processedQuestionIds.add(step.id)

    const isDecisive = DECISIVE_QUESTIONS.includes(step.id)
    const isAdjuster = ADJUSTER_QUESTIONS.includes(step.id)
    const nodeType: NodeType = isDecisive ? "decisive" : isAdjuster ? "adjuster" : "question"

    const nodeId = `q-${step.id}`
    questionNodes.push(nodeId)
    questionNodeMap[step.id] = nodeId

    nodes.push({
      id: nodeId,
      type: nodeType,
      label: step.question.length > 50 ? step.question.substring(0, 50) + "..." : step.question,
      section: step.section,
      questionId: step.id,
      meta: {
        question: step.question,
        description: step.description,
        options: step.options,
        isDecisive,
      },
    })

    // Create sequential edge from previous node to this question
    if (previousNodeId) {
      edges.push({
        from: previousNodeId,
        to: nodeId,
        answerLabel: "→",
        answerValue: "next",
      })
    }

    previousNodeId = nodeId
  })

  // Add final path nodes
  FINAL_PATHS.forEach((path) => {
    nodes.push({
      id: `path-${path}`,
      type: "path",
      label: path,
      meta: {
        paths: [path],
      },
    })
  })

  // Connect decisive questions to paths based on logic
  // Note: In reality, paths are determined by evaluating ALL answers together
  // But for visualization, we show which questions can lead to which paths
  
  // SCALER: Can be triggered by experience-level + time-available OR income-type
  const scalerQuestionIds = ["experience-level", "time-available", "income-type"]
  scalerQuestionIds.forEach((qId) => {
    const nodeId = questionNodeMap[qId]
    if (nodeId) {
      const step = quizSteps.find((s) => s.id === qId)
      if (step?.options) {
        step.options.forEach((option) => {
          // Only connect if this answer could contribute to SCALER
          if (
            (qId === "experience-level" && option.value === "avanzada") ||
            (qId === "time-available" && option.value === "20h+") ||
            (qId === "income-type" && option.value === "ingresos-principales")
          ) {
            // Check if edge already exists
            const exists = edges.some((e) => e.from === nodeId && e.to === "path-SCALER" && e.answerValue === option.value)
            if (!exists) {
              edges.push({
                from: nodeId,
                to: "path-SCALER",
                answerLabel: getAnswerLabel(qId, option.value),
                answerValue: option.value,
                isDecisive: true,
              })
            }
          }
        })
      }
    }
  })

  // FREELANCER: Triggered by interest-services or interest-freelance
  const freelancerQuestionIds = ["interest-services", "interest-freelance"]
  freelancerQuestionIds.forEach((qId) => {
    const nodeId = questionNodeMap[qId]
    if (nodeId) {
      const step = quizSteps.find((s) => s.id === qId)
      if (step?.options) {
        step.options.forEach((option) => {
          if (option.value === "muy-interesado" || option.value === "interesado") {
            const exists = edges.some((e) => e.from === nodeId && e.to === "path-FREELANCER" && e.answerValue === option.value)
            if (!exists) {
              edges.push({
                from: nodeId,
                to: "path-FREELANCER",
                answerLabel: getAnswerLabel(qId, option.value),
                answerValue: option.value,
                isDecisive: true,
              })
            }
          }
        })
      }
    }
  })

  // CREATOR: Triggered by interest-content or interest-products
  const creatorQuestionIds = ["interest-content", "interest-products"]
  creatorQuestionIds.forEach((qId) => {
    const nodeId = questionNodeMap[qId]
    if (nodeId) {
      const step = quizSteps.find((s) => s.id === qId)
      if (step?.options) {
        step.options.forEach((option) => {
          if (option.value === "muy-interesado" || option.value === "interesado") {
            const exists = edges.some((e) => e.from === nodeId && e.to === "path-CREATOR" && e.answerValue === option.value)
            if (!exists) {
              edges.push({
                from: nodeId,
                to: "path-CREATOR",
                answerLabel: getAnswerLabel(qId, option.value),
                answerValue: option.value,
                isDecisive: true,
              })
            }
          }
        })
      }
    }
  })

  // Connect last question to STARTER (default path) - only if no decisive path was taken
  if (questionNodes.length > 0) {
    const lastQuestion = questionNodes[questionNodes.length - 1]
    // Only add default edge if there's no direct path connection from last question
    const hasPathConnection = edges.some((e) => e.from === lastQuestion && e.to.startsWith("path-"))
    if (!hasPathConnection) {
      edges.push({
        from: lastQuestion,
        to: "path-STARTER",
        answerLabel: "Por defecto",
        answerValue: "default",
      })
    }
  }

  // Calculate user counts for edges if quizResponses provided
  if (quizResponses) {
    quizResponses.forEach((response) => {
      const answers = response.payload as Record<string, string | string[]>
      const path = calculatePath(answers)

      // Trace through the decision path
      // This is simplified - in a real implementation, we'd trace each answer
      const pathEdge = edges.find((e) => e.to === `path-${path}`)
      if (pathEdge) {
        pathEdge.userCount = (pathEdge.userCount || 0) + 1
      }
    })
  }

  return { nodes, edges }
}


// Helper to get answer label
function getAnswerLabel(questionId: string, value: string): string {
  // Simplified labels for decisive answers
  if (value === "muy-interesado") return "Muy interesado"
  if (value === "interesado") return "Interesado"
  if (value === "avanzada") return "Avanzada"
  if (value === "20h+") return "20+ horas"
  if (value === "ingresos-principales") return "Ingresos principales"
  return value.substring(0, 20) // Truncate long values
}

// Quiz step structure type
export interface QuizStep {
  id: string
  section: string
  question: string
  description?: string
  type: "single" | "multiple" | "text" | "scale"
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

