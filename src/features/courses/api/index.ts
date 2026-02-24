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
        const response = await apiClient.post('/courses', data)
        return response.data.data as Course
    },

    update: async (id: string, data: Partial<Course>) => {
        const response = await apiClient.patch(`/courses/${id}`, data)
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
        const response = await apiClient.post('/courses/lessons', data)
        return response.data.data as Lesson
    }
}
