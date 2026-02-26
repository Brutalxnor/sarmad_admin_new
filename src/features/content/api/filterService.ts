import { apiClient } from '@/shared/api/client'

export interface Filter {
    id: string
    type: 'topic' | 'segment' | 'tag'
    name: string
    name_en?: string
    created_at?: string
    updated_at?: string
}

export interface LinkFilterData {
    type: 'webinar' | 'lesson' | 'content'
    filter_id: string
    webinar_id?: string
    lesson_id?: string
    content_id?: string
}

export const filterApi = {
    getFiltersByType: async (type: string): Promise<Filter[]> => {
        const response = await apiClient.get(`/filters/type/${type}`)
        return response.data.data || response.data
    },

    createFilter: async (data: { type: string; name: string; name_en?: string }): Promise<Filter> => {
        const response = await apiClient.post('/filters', data)
        return response.data.data || response.data
    },

    linkFilter: async (data: LinkFilterData) => {
        const response = await apiClient.post('/filters/link', data)
        return response.data
    },

    unlinkFilter: async (data: LinkFilterData) => {
        const response = await apiClient.post('/filters/unlink', data)
        return response.data
    },

    getFiltersByItem: async (type: string, id: string): Promise<Filter[]> => {
        const response = await apiClient.get(`/filters/item/${type}/${id}`)
        return response.data.data || response.data
    }
}
