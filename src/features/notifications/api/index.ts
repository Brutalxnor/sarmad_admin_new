import { apiClient } from '@/shared/api/client'

export interface AdminNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    priority?: 'low' | 'medium' | 'high';
    link?: string;
    metadata?: any;
    created_at: string;
}

export const notificationsApi = {
    getAll: async (limit = 20): Promise<AdminNotification[]> => {
        const response = await apiClient.get(`/notifications?limit=${limit}`)
        return response.data.data
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await apiClient.get('/notifications/unread-count')
        return response.data.data.count
    },

    markAsRead: async (id: string): Promise<AdminNotification> => {
        const response = await apiClient.patch(`/notifications/${id}/read`)
        return response.data.data
    },

    markAllAsRead: async (): Promise<{ message: string }> => {
        const response = await apiClient.post('/notifications/mark-all-read')
        return response.data
    }
}
