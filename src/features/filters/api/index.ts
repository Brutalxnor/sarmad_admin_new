import { apiClient } from '@/shared/api/client'

export interface Filter {
    id: string
    type: string
    name: string
    name_en: string
    created_at: string
}

export const filtersApi = {
    getAll: async (): Promise<Filter[]> => {
        const response = await apiClient.get('/filters')
        return response.data.data
    },
    getByType: async (type: string): Promise<Filter[]> => {
        const response = await apiClient.get(`/filters/type/${type}`)
        return response.data.data
    }
}
