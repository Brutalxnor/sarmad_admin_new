import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../api'

const USERS_QUERY_KEYS = {
    all: ['users'] as const,
    lists: () => [...USERS_QUERY_KEYS.all, 'list'] as const,
    details: () => [...USERS_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...USERS_QUERY_KEYS.details(), id] as const,
}

export function useUsers() {
    return useQuery({
        queryKey: USERS_QUERY_KEYS.lists(),
        queryFn: () => usersApi.getAll(),
    })
}

export function useUser(id: string) {
    return useQuery({
        queryKey: USERS_QUERY_KEYS.detail(id),
        queryFn: () => usersApi.getById(id),
        enabled: !!id,
    })
}

export function useUserDetails(id: string) {
    const userQuery = useQuery({
        queryKey: USERS_QUERY_KEYS.detail(id),
        queryFn: () => usersApi.getById(id),
        enabled: !!id,
    })

    const assessmentsQuery = useQuery({
        queryKey: [...USERS_QUERY_KEYS.detail(id), 'assessments'],
        queryFn: () => usersApi.getUserAssessments(id),
        enabled: !!id,
    })

    const ordersQuery = useQuery({
        queryKey: [...USERS_QUERY_KEYS.detail(id), 'orders'],
        queryFn: () => usersApi.getUserOrders(id),
        enabled: !!id,
    })

    const bookingsQuery = useQuery({
        queryKey: [...USERS_QUERY_KEYS.detail(id), 'bookings'],
        queryFn: () => usersApi.getUserBookings(id),
        enabled: !!id,
    })

    return {
        user: userQuery.data,
        assessments: assessmentsQuery.data,
        orders: ordersQuery.data,
        bookings: bookingsQuery.data,
        isLoading: userQuery.isLoading,
        isLoadingAll: userQuery.isLoading || assessmentsQuery.isLoading || ordersQuery.isLoading || bookingsQuery.isLoading,
    }
}
