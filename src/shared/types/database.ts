export interface Question {
    id: string
    created_at: string
    question: string
    category: string
    answers?: Answer[] // From your repository
    in_assessment?: boolean
    assess_version?: number
    actual_assess?: boolean
}

export interface Answer {
    id: string
    created_at: string
    answer: string
    percentage: number
    question_id: string
}

export interface Assessment {
    id: string
    created_at: string
    user_id: string
    answers: string[] // Array of answer IDs
    scores_by_condition: Record<string, number>
    risk_levels: Record<string, 'high' | 'medium' | 'low'>
    routing_outcome: 'specialist' | 'self_care'
    message_idui: string
}

export interface Message {
    id: string
    created_at: string
    text: string
    level: string
}

export interface Content {
    id: string
    created_at: string
    type: string
    title: string
    language: string
    topic: string
    tags: string[]
    segment: string
    status: string
    version: number
}
