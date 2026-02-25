import { apiClient } from '@/shared/api/client'
import type { ContentItem, Topic } from '../types'

export const contentApi = {
    getAll: async () => {
        const response = await apiClient.get('/content')
        return response.data.data as ContentItem[]
    },

    getTopics: async () => {
        const response = await apiClient.get('/topics')
        return response.data.data as Topic[]
    },

    create: async (body: Partial<ContentItem>) => {
        const formData = new FormData()
        Object.entries(body).forEach(([key, value]) => {
            if (value === undefined || value === null) return

            if (key === 'tags' || key === 'segments') {
                formData.append(key, JSON.stringify(value))
            } else if (key === 'thumbnail_image') {
                if (value instanceof File) {
                    formData.append('thumbnail_image', value)
                }
            } else {
                formData.append(key, String(value))
            }
        })

        const response = await apiClient.post('/content', formData)
        return response.data.data
    },

    update: async (id: string, body: Partial<ContentItem>) => {
        const formData = new FormData()
        Object.entries(body).forEach(([key, value]) => {
            if (value === undefined || value === null) return

            if (key === 'tags' || key === 'segments') {
                formData.append(key, JSON.stringify(value))
            } else if (key === 'thumbnail_image') {
                if (value instanceof File) {
                    formData.append('thumbnail_image', value)
                } else if (typeof value === 'string') {
                    formData.append('thumbnail_image', value)
                }
            } else {
                formData.append(key, String(value))
            }
        })

        const response = await apiClient.patch(`/content/${id}`, formData)
        return response.data.data
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/content/${id}`)
        return response.data.data
    }
}
