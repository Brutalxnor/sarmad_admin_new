import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffService } from '../api/staffService'
import type { CreateStaffRequest, UpdateStaffRequest } from '../api/staffService'

const STAFF_QUERY_KEYS = {
    all: ['staff'] as const,
    lists: () => [...STAFF_QUERY_KEYS.all, 'list'] as const,
    details: () => [...STAFF_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...STAFF_QUERY_KEYS.details(), id] as const,
}

export function useStaffList() {
    return useQuery({
        queryKey: STAFF_QUERY_KEYS.lists(),
        queryFn: staffService.listStaff,
    })
}

export function useStaff(id: string) {
    return useQuery({
        queryKey: STAFF_QUERY_KEYS.detail(id),
        queryFn: () => staffService.getStaffById(id),
        enabled: !!id,
    })
}

export function useCreateStaff() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateStaffRequest) => staffService.createStaff(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.lists() })
        },
    })
}

export function useUpdateStaff() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateStaffRequest }) =>
            staffService.updateStaff(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.lists() })
        },
    })
}

export function useDeleteStaff() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => staffService.deleteStaff(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.lists() })
        },
    })
}
