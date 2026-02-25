import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { questionApi } from '../api'
import type { Question } from '../types/question.types'

const QUESTION_QUERY_KEYS = {
    all: ['questions'],
    lists: () => [...QUESTION_QUERY_KEYS.all, 'list'],
    assessment: () => [...QUESTION_QUERY_KEYS.all, 'assessment'],
}

export function useQuestions() {
    return useQuery({
        queryKey: QUESTION_QUERY_KEYS.lists(),
        queryFn: () => questionApi.getAll(),
    })
}

export function useAssessmentQuestions() {
    return useQuery({
        queryKey: QUESTION_QUERY_KEYS.assessment(),
        queryFn: () => questionApi.getAssessmentQuestions(),
    })
}

export function useCreateQuestion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: questionApi.create,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUESTION_QUERY_KEYS.all })
            await queryClient.invalidateQueries({ queryKey: ['assessments'] })
        },
    })
}

export function useUpdateQuestion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: import('../types/question.types').CreateQuestionDTO }) => {
            // Check if data has answers and if we should exclude them for the main question update
            // Also remove any system-controlled columns that might not exist or shouldn't be patched
            const { answers: _, id: __, created_at: ___, updated_at: ____, ...questionData } = data as any;
            return questionApi.update(id, questionData);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUESTION_QUERY_KEYS.all })
            await queryClient.invalidateQueries({ queryKey: ['assessments'] })
        },
    })
}

export function useUpdateAnswer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { answer: string; percentage: number; question_id?: string } }) =>
            questionApi.updateAnswer(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUESTION_QUERY_KEYS.all })
            await queryClient.invalidateQueries({ queryKey: ['assessments'] })
        },
    })
}

export function useToggleAssessmentStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, in_assessment }: { id: string; in_assessment: boolean }) =>
            questionApi.updateAssessmentStatus(id, in_assessment),
        // Optimistic Update
        onMutate: async ({ id, in_assessment }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: QUESTION_QUERY_KEYS.all })

            // Snapshot the previous value
            const previousQuestions = queryClient.getQueryData<{ data: Question[] }>(QUESTION_QUERY_KEYS.lists())

            // Optimistically update to the new value
            if (previousQuestions) {
                queryClient.setQueryData(QUESTION_QUERY_KEYS.lists(), {
                    ...previousQuestions,
                    data: previousQuestions.data.map((q: Question) =>
                        q.id === id ? { ...q, in_assessment } : q
                    ),
                })
            }

            return { previousQuestions }
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (_err, _newVal, context) => {
            if (context?.previousQuestions) {
                queryClient.setQueryData(QUESTION_QUERY_KEYS.lists(), context.previousQuestions)
            }
        },
        // Always refetch after error or success to ensure we are in sync with the server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUESTION_QUERY_KEYS.all })
            queryClient.invalidateQueries({ queryKey: ['assessments'] })
        },

    })
}

export function useSetActualVersion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (version: number) => questionApi.setActualVersion(version),
        onMutate: async (version) => {
            await queryClient.cancelQueries({ queryKey: QUESTION_QUERY_KEYS.all })
            const previousQuestions = queryClient.getQueryData<{ data: Question[] }>(QUESTION_QUERY_KEYS.lists())

            if (previousQuestions) {
                queryClient.setQueryData(QUESTION_QUERY_KEYS.lists(), {
                    ...previousQuestions,
                    data: previousQuestions.data.map((q: Question) => ({
                        ...q,
                        actual_assess: Number(q.assess_version) === version
                    })),
                })
            }

            return { previousQuestions }
        },
        onError: (_err, _newVal, context) => {
            if (context?.previousQuestions) {
                queryClient.setQueryData(QUESTION_QUERY_KEYS.lists(), context.previousQuestions)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUESTION_QUERY_KEYS.all })
        },
    })
}

export function useDeleteQuestion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: questionApi.delete,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUESTION_QUERY_KEYS.all })
            await queryClient.invalidateQueries({ queryKey: ['assessments'] })
        },
    })
}
