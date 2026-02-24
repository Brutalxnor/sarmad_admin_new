import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../api'

export const NOTIFICATION_KEYS = {
    all: ['notifications'] as const,
    list: () => [...NOTIFICATION_KEYS.all, 'list'] as const,
    unreadCount: () => [...NOTIFICATION_KEYS.all, 'unread-count'] as const,
}

export function useNotifications(limit = 20) {
    return useQuery({
        queryKey: NOTIFICATION_KEYS.list(),
        queryFn: () => notificationsApi.getAll(limit),
    })
}

export function useUnreadNotificationsCount() {
    return useQuery({
        queryKey: NOTIFICATION_KEYS.unreadCount(),
        queryFn: () => notificationsApi.getUnreadCount(),
        refetchInterval: 30000, // Poll every 30 seconds as fallback
    })
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: notificationsApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
        }
    })
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: notificationsApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
        }
    })
}
