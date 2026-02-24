import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contentApi } from '../api'
import type { ContentItem } from '../types'

const CONTENT_QUERY_KEYS = {
    all: ['content'] as const,
    lists: () => [...CONTENT_QUERY_KEYS.all, 'list'] as const,
    topics: () => ['topics'] as const,
}

export function useContent() {
    return useQuery({
        queryKey: CONTENT_QUERY_KEYS.lists(),
        queryFn: () => contentApi.getAll(),
    })
}

export function useTopics() {
    return useQuery({
        queryKey: CONTENT_QUERY_KEYS.topics(),
        queryFn: () => contentApi.getTopics(),
    })
}

export function useCreateArticle() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: contentApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.all })
        }
    })
}

export function useUpdateArticle() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<ContentItem> }) => contentApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.all })
        }
    })
}

export function useDeleteArticle() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => contentApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.all })
        }
    })
}
