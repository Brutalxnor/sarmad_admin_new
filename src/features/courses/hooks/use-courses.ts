import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coursesApi } from '../api'
import type { Course } from '../types'

const COURSES_QUERY_KEYS = {
    all: ['courses'] as const,
    lists: () => [...COURSES_QUERY_KEYS.all, 'list'] as const,
    detail: (id: string) => [...COURSES_QUERY_KEYS.all, 'detail', id] as const,
}

export function useCourses() {
    return useQuery({
        queryKey: COURSES_QUERY_KEYS.lists(),
        queryFn: coursesApi.getAll,
    })
}

export function useCourse(id: string) {
    return useQuery({
        queryKey: COURSES_QUERY_KEYS.detail(id),
        queryFn: () => coursesApi.getById(id),
        enabled: !!id,
    })
}

export function useCreateCourse() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: coursesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEYS.all })
        },
    })
}

export function useUpdateCourse() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Course> }) => coursesApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEYS.all })
            queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEYS.detail(id) })
        },
    })
}

export function useDeleteCourse() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: coursesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEYS.all })
        },
    })
}

export function useCreateSection() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: coursesApi.createSection,
        onSuccess: (_, variables) => {
            if (variables.course_id) {
                queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEYS.detail(variables.course_id) })
            }
        },
    })
}

export function useCreateLesson() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: coursesApi.createLesson,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEYS.all })
        },
    })
}
