import { apiClient } from '@/shared/api/client'
import type { User } from '../types'

export const usersApi = {
    getAll: async (): Promise<User[]> => {
        const response = await apiClient.get('/users')
        return response.data.data
    },

    getById: async (id: string) => {
        const response = await apiClient.get(`/users/${id}`)
        return response.data.data
    },

    getUserAssessments: async (userId: string) => {
        const response = await apiClient.get(`/assessment/user/${userId}`)
        return response.data.data
    },

    getUserOrders: async (userId: string) => {
        const response = await apiClient.get(`/orders/user/${userId}`)
        return response.data.data
    },

    getUserBookings: async (userId: string) => {
        const response = await apiClient.get(`/consultations/my-bookings/${userId}`)
        return response.data.data
    }
}
