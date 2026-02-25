import { useQuery } from '@tanstack/react-query'
import { filtersApi } from '../api'

export const FILTER_QUERY_KEYS = {
    all: ['filters'] as const,
    byType: (type: string) => [...FILTER_QUERY_KEYS.all, type] as const,
}

export function useFilters() {
    return useQuery({
        queryKey: FILTER_QUERY_KEYS.all,
        queryFn: () => filtersApi.getAll(),
    })
}

export function useFiltersByType(type: string) {
    return useQuery({
        queryKey: FILTER_QUERY_KEYS.byType(type),
        queryFn: () => filtersApi.getByType(type),
        enabled: !!type,
    })
}

export function useSegments() {
    return useFiltersByType('segment')
}
