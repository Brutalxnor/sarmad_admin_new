import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api'
import type { OrderStatus } from '../types'

// Query Key Factory
const ORDERS_QUERY_KEYS = {
    all: ['orders'] as const,
    lists: () => [...ORDERS_QUERY_KEYS.all, 'list'] as const,
    details: () => [...ORDERS_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...ORDERS_QUERY_KEYS.details(), id] as const,
}

export function useOrders() {
    return useQuery({
        queryKey: ORDERS_QUERY_KEYS.lists(),
        queryFn: () => ordersApi.getAll(),
    })
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: string, status: OrderStatus | string }) => ordersApi.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.all })
        }
    })
}

