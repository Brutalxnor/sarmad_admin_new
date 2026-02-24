import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api'

const REPORTS_QUERY_KEYS = {
    all: ['reports'] as const,
    overview: () => [...REPORTS_QUERY_KEYS.all, 'overview'] as const,
}

export function useReports() {
    return useQuery({
        queryKey: REPORTS_QUERY_KEYS.overview(),
        queryFn: () => reportsApi.getOverview(),
    })
}
