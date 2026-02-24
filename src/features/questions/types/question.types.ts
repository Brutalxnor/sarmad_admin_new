import type { Question as DbQuestion } from '../../../shared/types/database'

export type Question = DbQuestion

export interface CreateQuestionDTO {
    question: string
    category?: string
    assess_version?: number
    in_assessment?: boolean
    actual_assess?: boolean
    answers?: {
        answer: string
        percentage: number
    }[]
}
