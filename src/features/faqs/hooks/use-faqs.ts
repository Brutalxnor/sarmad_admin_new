import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { faqsApi } from '../api'
import type { FAQ } from '../types'

const FAQS_QUERY_KEYS = {
    all: ['faqs'] as const,
    lists: () => [...FAQS_QUERY_KEYS.all, 'list'] as const,
}

export function useFaqs() {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: FAQS_QUERY_KEYS.lists(),
        queryFn: () => faqsApi.getAll(),
    })

    const createMutation = useMutation({
        mutationFn: (data: Partial<FAQ>) => faqsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FAQS_QUERY_KEYS.lists() })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => faqsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FAQS_QUERY_KEYS.lists() })
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<FAQ> }) => faqsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FAQS_QUERY_KEYS.lists() })
        }
    })

    return {
        ...query,
        createFaq: createMutation.mutateAsync,
        deleteFaq: deleteMutation.mutateAsync,
        updateFaq: updateMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
    }
}
