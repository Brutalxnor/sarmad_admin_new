import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { filterApi } from '../api/filterService'

export const FILTER_QUERY_KEYS = {
    all: ['filters'] as const,
    byType: (type: string) => [...FILTER_QUERY_KEYS.all, 'type', type] as const,
    byItem: (type: string, id: string) => [...FILTER_QUERY_KEYS.all, 'item', type, id] as const,
}

export function useFilters(type: string) {
    return useQuery({
        queryKey: FILTER_QUERY_KEYS.byType(type),
        queryFn: () => filterApi.getFiltersByType(type),
    })
}

export function useFiltersByItem(type: string, id: string) {
    return useQuery({
        queryKey: FILTER_QUERY_KEYS.byItem(type, id),
        queryFn: () => filterApi.getFiltersByItem(type, id),
        enabled: !!id,
    })
}

export function useCreateFilter() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: filterApi.createFilter,
        onSuccess: (newFilter) => {
            queryClient.invalidateQueries({ queryKey: FILTER_QUERY_KEYS.byType(newFilter.type) })
        }
    })
}

export function useLinkFilter() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: filterApi.linkFilter,
        onSuccess: (_, variables) => {
            const id = variables.webinar_id || variables.lesson_id || variables.content_id || variables.course_id
            if (id) {
                queryClient.invalidateQueries({ queryKey: FILTER_QUERY_KEYS.byItem(variables.type, id) })
            }
        }
    })
}

export function useUnlinkFilter() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: filterApi.unlinkFilter,
        onSuccess: (_, variables) => {
            const id = variables.webinar_id || variables.lesson_id || variables.content_id || variables.course_id
            if (id) {
                queryClient.invalidateQueries({ queryKey: FILTER_QUERY_KEYS.byItem(variables.type, id) })
            }
        }
    })
}
