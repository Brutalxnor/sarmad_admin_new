import { apiClient } from '@/shared/api/client'
import type { FAQ } from '../types'

export const faqsApi = {
    getAll: async (): Promise<FAQ[]> => {
        const response = await apiClient.get('/faqs')
        return response.data.data
    },

    create: async (data: Partial<FAQ>) => {
        const response = await apiClient.post('/faqs', data)
        return response.data
    },

    update: async (id: string, data: Partial<FAQ>) => {
        const response = await apiClient.patch(`/faqs/${id}`, data)
        return response.data
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/faqs/${id}`)
        return response.data
    }
}
