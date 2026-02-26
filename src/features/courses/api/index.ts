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
        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) return

            // Explicitly exclude virtual/joined fields
            if (['author', 'author_role', 'author_profile', 'category', 'topic', 'sections'].includes(key)) return

            if (key === 'thumbnail_url' && (value as any) instanceof File) {
                formData.append(key, value as any)
            } else {
                formData.append(key, String(value))
            }
        })
        const response = await apiClient.post('/courses', formData)
        return response.data.data as Course
    },

    update: async (id: string, data: Partial<Course>) => {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (value === undefined || value === null) return

            // Explicitly exclude virtual/joined fields
            if (['author', 'author_role', 'author_profile', 'category', 'topic', 'sections'].includes(key)) return

            if (key === 'thumbnail_url' && (value as any) instanceof File) {
                formData.append(key, value as any)
            } else {
                formData.append(key, String(value))
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
