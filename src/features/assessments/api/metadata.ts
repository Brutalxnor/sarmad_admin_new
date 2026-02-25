import { apiClient } from '@/shared/api/client'

export interface AssessmentMetadata {
    id?: string
    name: string
    version: number
    description?: string
    category?: string
    is_active: boolean
    estimated_time?: string
    created_at?: string
    updated_at?: string
}

export const metadataApi = {
    create: async (data: AssessmentMetadata) => {
        const response = await apiClient.post('/assessment-metadata', data)
        return response.data
    },
    getAll: async () => {
        const response = await apiClient.get('/assessment-metadata')
        return response.data
    },
    getById: async (id: string) => {
        const response = await apiClient.get(`/assessment-metadata/${id}`)
        return response.data
    },
    update: async (id: string, data: Partial<AssessmentMetadata>) => {
        const response = await apiClient.patch(`/assessment-metadata/${id}`, data)
        return response.data
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/assessment-metadata/${id}`)
        return response.data
    },
    toggleStatus: async (id: string, is_active: boolean) => {
        const response = await apiClient.patch(`/assessment-metadata/${id}/status`, { is_active })
        return response.data
    }
}
