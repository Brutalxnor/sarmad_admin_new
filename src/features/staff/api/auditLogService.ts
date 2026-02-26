import { apiClient } from '@/shared/api/client'

export interface AuditLog {
    id: string
    action: string
    module: string
    message_ar: string
    created_at: string
    staff_name: string
}

export interface AuditLogResponse {
    status: string
    data: AuditLog[]
}

export const auditLogApi = {
    getRecent: async (limit: number = 10): Promise<AuditLogResponse> => {
        const response = await apiClient.get<AuditLogResponse>(`/audit-logs/recent?limit=${limit}`)
        return response.data
    }
}
