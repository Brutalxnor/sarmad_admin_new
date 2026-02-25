import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { metadataApi } from '../api/metadata'
import type { AssessmentMetadata } from '../api/metadata'
import { toast } from 'react-hot-toast'

export function useCreateMetadata() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: AssessmentMetadata) => metadataApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessment-metadata'] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create assessment metadata')
        }
    })
}

export function useAllMetadata() {
    return useQuery({
        queryKey: ['assessment-metadata'],
        queryFn: () => metadataApi.getAll()
    })
}

export function useAssessmentsWithQuestions() {
    return useQuery({
        queryKey: ['assessment-metadata', 'with-questions'],
        queryFn: () => metadataApi.getWithQuestions()
    })
}

export function useUpdateMetadata() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<AssessmentMetadata> }) =>
            metadataApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessment-metadata'] })
        }
    })
}

export function useActivateAssessment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => metadataApi.activate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessment-metadata'] })
            toast.success('Assessment activated successfully')
        }
    })
}

export function useDeactivateAssessment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => metadataApi.deactivate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessment-metadata'] })
            toast.success('Assessment deactivated successfully')
        }
    })
}
