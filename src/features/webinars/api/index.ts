import { apiClient } from '@/shared/api/client'
import type { Webinar } from '../types'

export const webinarsApi = {
    getAll: async () => {
        const response = await apiClient.get('/webinars')
        return response.data.data
    },

    create: async (body: Partial<Webinar>) => {
        const formData = new FormData()
        Object.entries(body).forEach(([key, value]) => {
            if (value === undefined || value === null) return

            if (key === 'thumbnail_image') {
                if (value instanceof File) {
                    formData.append('thumbnail_image', value)
                }
            } else {
                formData.append(key, String(value))
            }
        })

        const response = await apiClient.post('/webinars', formData)
        return response.data.data
    },

    update: async (id: string, body: Partial<Webinar>) => {
        const formData = new FormData()
        Object.entries(body).forEach(([key, value]) => {
            if (value === undefined || value === null) return

            if (key === 'thumbnail_image') {
                if (value instanceof File) {
                    formData.append('thumbnail_image', value)
                } else if (typeof value === 'string') {
                    formData.append('thumbnail_image', value)
                }
            } else {
                formData.append(key, String(value))
            }
        })

        const response = await apiClient.patch(`/webinars/${id}`, formData)
        return response.data.data
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/webinars/${id}`)
        return response.data.data
    },

    getAttendees: async (webinarId: string) => {
        const response = await apiClient.get(`/webinars/${webinarId}/enrollees`)
        // Map backend 'users' to frontend 'user' and handle date mapping
        return response.data.data.map((item: any) => ({
            ...item,
            user: item.users,
            registered_at: item.registered_at || item.created_at
        }))
    }
}
