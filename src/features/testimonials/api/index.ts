import { apiClient } from '@/shared/api/client'
import type { Testimonial } from '../types'

export const testimonialsApi = {
    getAll: async (): Promise<Testimonial[]> => {
        const response = await apiClient.get('/testimonials')
        return response.data.data
    },

    create: async (data: Partial<Testimonial>) => {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) return
            if (key === 'image_url' && (value as unknown) instanceof File) {
                formData.append('image', value as unknown as File)
            } else {
                formData.append(key, String(value))
            }
        })
        const response = await apiClient.post('/testimonials', formData)
        return response.data
    },

    update: async (id: string, data: Partial<Testimonial>) => {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) return
            if (key === 'image_url' && (value as unknown) instanceof File) {
                formData.append('image', value as unknown as File)
            } else {
                formData.append(key, String(value))
            }
        })
        const response = await apiClient.patch(`/testimonials/${id}`, formData)
        return response.data
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/testimonials/${id}`)
        return response.data
    }
}
