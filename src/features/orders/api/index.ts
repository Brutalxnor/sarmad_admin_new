import { apiClient } from '@/shared/api/client'
import type { OrderStatus } from '../types'

export const ordersApi = {
    getAll: async () => {
        const response = await apiClient.get('/orders')
        return response.data.data
    },

    updateStatus: async (orderId: string, status: OrderStatus | string) => {
        const response = await apiClient.patch(`/orders/${orderId}`, { operational_status: status })
        return response.data.data
    }
}
