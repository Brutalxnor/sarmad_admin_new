import { apiClient } from '@/shared/api/client'
import type { ConsultationBooking } from '../types'

export const consultationsApi = {
    getAllBookings: async (): Promise<ConsultationBooking[]> => {
        const response = await apiClient.get('/consultations')
        return response.data.data
    },

    updateBooking: async (id: string, data: any) => {
        const response = await apiClient.patch(`/consultations/${id}`, data)
        return response.data
    },

    getSpecialists: async () => {
        const response = await apiClient.get('/consultations/specialists')
        return response.data.data
    }
}
