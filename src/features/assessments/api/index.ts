import { apiClient } from '@/shared/api/client'

export interface Assessment {
    id: string
    user_id: string
    score: number
    created_at: string
    user?: {
        name: string
        email: string
    }
}

export interface GroupedAssessment {
    version: string
    questionCount: number
    questions: any[]
}

export const assessmentsApi = {
    getAll: async (): Promise<{ status: string; data: Assessment[] }> => {
        const response = await apiClient.get('/assessment')
        return response.data
    },

    getById: async (id: string): Promise<{ status: string; data: Assessment }> => {
        const response = await apiClient.get(`/assessment/get-assessment/${id}`)
        return response.data
    },

    getUserAssessments: async (userId: string): Promise<{ status: string; data: Assessment[] }> => {
        const response = await apiClient.get(`/assessment/user/${userId}`)
        return response.data
    },

    getVersions: async (): Promise<{ status: string; data: GroupedAssessment[] }> => {
        const response = await apiClient.get('/assessment/versions')
        return response.data
    },

    getByVersion: async (version: string): Promise<{ status: string; data: any[] }> => {
        const response = await apiClient.get(`/assessment/assessment-version/${version}`)
        return response.data
    },
}


