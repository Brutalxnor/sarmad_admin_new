import { apiClient } from '../../../shared/api/client'
import type { Question, CreateQuestionDTO } from '../types/question.types'

export const questionApi = {
    // POST /api/v1/questions
    create: async (data: CreateQuestionDTO) => {
        const response = await apiClient.post('/questions', data)
        return response.data
    },

    // GET /api/v1/questions
    getAll: async (): Promise<{
        status: string
        message: string
        data: Question[]
    }> => {
        const response = await apiClient.get('/questions')
        return response.data
    },

    // GET /api/v1/questions/assessment
    getAssessmentQuestions: async (): Promise<{
        status: string
        message: string
        data: Question[]
    }> => {
        const response = await apiClient.get('/questions/assessment')
        return response.data
    },

    // PATCH /api/v1/questions/:id
    update: async (id: string, data: CreateQuestionDTO) => {
        const response = await apiClient.patch(`/questions/${id}`, data)
        return response.data
    },

    // PATCH /api/v1/questions/:id/assessment-status
    updateAssessmentStatus: async (id: string, in_assessment: boolean) => {
        const response = await apiClient.patch(`/questions/${id}/assessment-status`, { in_assessment })
        return response.data
    },

    // PATCH /api/v1/questions/version/:version/actual
    setActualVersion: async (version: number) => {
        const response = await apiClient.patch(`/questions/version/${version}/actual`)
        return response.data
    },

    // DELETE /api/v1/questions/:id
    delete: async (id: string) => {
        const response = await apiClient.delete(`/questions/${id}`)
        return response.data
    },

    // PATCH /api/v1/answer/:id
    updateAnswer: async (id: string, data: { answer: string; percentage: number; question_id?: string }) => {
        const response = await apiClient.patch(`/answer/${id}`, data)
        return response.data
    },
}
