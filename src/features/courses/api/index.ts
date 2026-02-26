import { apiClient } from '@/shared/api/client'
import type { Course, Section, Lesson } from '../types'

export const coursesApi = {
    getAll: async () => {
        const response = await apiClient.get('/courses')
        return response.data.data as Course[]
    },

    getById: async (id: string) => {
        const response = await apiClient.get(`/courses/${id}`)
        return response.data.data as Course
    },

    create: async (data: Partial<Course>) => {
        const formData = new FormData()

        // Define allowed fields for the course table
        const allowedFields = [
            'title', 'description', 'thumbnail_url', 'price',
            'access_type', 'topic_id', 'author_id', 'cerificate',
            'rate', 'register', 'duration', 'category'
        ]

        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) return

            // Map thumbnail_image to thumbnail_url if provided
            const apiKey = key === 'thumbnail_image' ? 'thumbnail_url' : key

            // Only append valid columns
            if (!allowedFields.includes(apiKey)) return

            if (apiKey === 'thumbnail_url' && value instanceof File) {
                formData.append(apiKey, value)
            } else if (apiKey === 'duration') {
                // Ensure duration is a number if it's a string like "0 Sections"
                const numericDuration = typeof value === 'string'
                    ? (parseInt(value.replace(/[^0-9]/g, '')) || 0)
                    : value
                formData.append(apiKey, String(numericDuration))
            } else {
                formData.append(apiKey, String(value))
            }
        })

        const response = await apiClient.post('/courses', formData)
        return response.data.data as Course
    },

    update: async (id: string, data: Partial<Course>) => {
        const formData = new FormData()

        // Define allowed fields for the course table
        const allowedFields = [
            'title', 'description', 'thumbnail_url', 'price',
            'access_type', 'topic_id', 'author_id', 'cerificate',
            'rate', 'register', 'duration', 'category'
        ]

        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) return

            // Map thumbnail_image to thumbnail_url if provided
            const apiKey = key === 'thumbnail_image' ? 'thumbnail_url' : key

            // Only append valid columns
            if (!allowedFields.includes(apiKey)) return

            // Skip read-only fields even if they are in data
            if (['id', 'created_at'].includes(key)) return

            if (apiKey === 'thumbnail_url' && value instanceof File) {
                formData.append(apiKey, value)
            } else if (apiKey === 'duration') {
                // Ensure duration is a number if it's a string like "0 Sections"
                const numericDuration = typeof value === 'string'
                    ? (parseInt(value.replace(/[^0-9]/g, '')) || 0)
                    : value
                formData.append(apiKey, String(numericDuration))
            } else {
                formData.append(apiKey, String(value))
            }
        })

        const response = await apiClient.patch(`/courses/${id}`, formData)
        return response.data.data as Course
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/courses/${id}`)
        return response.data.data
    },

    createSection: async (data: Partial<Section>) => {
        const response = await apiClient.post('/courses/sections', data)
        return response.data.data as Section
    },

    createLesson: async (data: Partial<Lesson>) => {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) return
            if (key === 'thumbnail_image' && (value as any) instanceof File) {
                formData.append(key, value as any)
            } else {
                formData.append(key, String(value))
            }
        })
        const response = await apiClient.post('/courses/lessons', formData)
        return response.data.data as Lesson
    }
}
