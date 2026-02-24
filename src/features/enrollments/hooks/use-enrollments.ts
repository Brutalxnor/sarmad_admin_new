import { useQuery } from '@tanstack/react-query'
import { enrollmentsApi } from '../api'

export function useEnrollments() {
    return useQuery({
        queryKey: ['enrollments'],
        queryFn: enrollmentsApi.getAll
    })
}

export function useEnrollment(id: string) {
    return useQuery({
        queryKey: ['enrollments', id],
        queryFn: () => enrollmentsApi.getById(id),
        enabled: !!id
    })
}
