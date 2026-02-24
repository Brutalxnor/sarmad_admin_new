import { apiClient } from '@/shared/api/client'
import type { Testimonial } from '../types'

export const testimonialsApi = {
    getAll: async (): Promise<Testimonial[]> => {
        const response = await apiClient.get('/testimonials')
        return response.data.data
    },

    create: async (data: Partial<Testimonial>) => {
        const response = await apiClient.post('/testimonials', data)
        return response.data
    },

    update: async (id: string, data: Partial<Testimonial>) => {
        const response = await apiClient.patch(`/testimonials/${id}`, data)
        return response.data
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/testimonials/${id}`)
        return response.data
    }
}
