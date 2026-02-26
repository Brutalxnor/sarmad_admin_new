import { useQuery } from '@tanstack/react-query'
import { auditLogApi } from '../api/auditLogService'

export const AUDIT_LOG_QUERY_KEYS = {
    all: ['audit-logs'] as const,
    recent: (limit: number) => [...AUDIT_LOG_QUERY_KEYS.all, 'recent', limit] as const,
}

export function useRecentAuditLogs(limit: number = 10) {
    return useQuery({
        queryKey: AUDIT_LOG_QUERY_KEYS.recent(limit),
        queryFn: () => auditLogApi.getRecent(limit),
        refetchInterval: 60000, // Refresh every minute
    })
}
