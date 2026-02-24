import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testimonialsApi } from '../api'
import type { Testimonial } from '../types'

const TESTIMONIALS_QUERY_KEYS = {
    all: ['testimonials'] as const,
    lists: () => [...TESTIMONIALS_QUERY_KEYS.all, 'list'] as const,
}

export function useTestimonials() {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: TESTIMONIALS_QUERY_KEYS.lists(),
        queryFn: () => testimonialsApi.getAll(),
    })

    const createMutation = useMutation({
        mutationFn: (data: Partial<Testimonial>) => testimonialsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TESTIMONIALS_QUERY_KEYS.lists() })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => testimonialsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TESTIMONIALS_QUERY_KEYS.lists() })
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Testimonial> }) => testimonialsApi.update(id, data),
        onMutate: async ({ id, data }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: TESTIMONIALS_QUERY_KEYS.lists() })

            // Snapshot the previous value
            const previousTestimonials = queryClient.getQueryData<Testimonial[]>(TESTIMONIALS_QUERY_KEYS.lists())

            // Optimistically update to the new value
            if (previousTestimonials) {
                queryClient.setQueryData<Testimonial[]>(TESTIMONIALS_QUERY_KEYS.lists(), (old) => {
                    return old?.map((t) => (t.id === id ? { ...t, ...data } : t)) || []
                })
            }

            // Return a context object with the snapshotted value
            return { previousTestimonials }
        },
        onError: (_err, _newTestimonial, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousTestimonials) {
                queryClient.setQueryData(TESTIMONIALS_QUERY_KEYS.lists(), context.previousTestimonials)
            }
        },
        onSettled: () => {
            // Always refetch after error or success:
            queryClient.invalidateQueries({ queryKey: TESTIMONIALS_QUERY_KEYS.lists() })
        }
    })

    return {
        ...query,
        createTestimonial: createMutation.mutateAsync,
        deleteTestimonial: deleteMutation.mutateAsync,
        updateTestimonial: updateMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isUpdating: updateMutation.isPending,
    }
}
