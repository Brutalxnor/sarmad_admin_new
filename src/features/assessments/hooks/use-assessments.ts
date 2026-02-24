import { useQuery } from '@tanstack/react-query'
import { assessmentsApi } from '../api'

const ASSESSMENT_QUERY_KEYS = {
    all: ['assessments'],
    lists: () => [...ASSESSMENT_QUERY_KEYS.all, 'list'],
    detail: (id: string) => [...ASSESSMENT_QUERY_KEYS.all, 'detail', id],
    userAssessments: (userId: string) => [...ASSESSMENT_QUERY_KEYS.all, 'user', userId],
    versions: () => [...ASSESSMENT_QUERY_KEYS.all, 'versions'],
    versionDetails: (version: string) => [...ASSESSMENT_QUERY_KEYS.all, 'version-detail', version],
}

export function useAssessments() {
    return useQuery({
        queryKey: ASSESSMENT_QUERY_KEYS.lists(),
        queryFn: () => assessmentsApi.getAll(),
    })
}

export function useAssessment(id: string) {
    return useQuery({
        queryKey: ASSESSMENT_QUERY_KEYS.detail(id),
        queryFn: () => assessmentsApi.getById(id),
        enabled: !!id,
    })
}

export function useUserAssessments(userId: string) {
    return useQuery({
        queryKey: ASSESSMENT_QUERY_KEYS.userAssessments(userId),
        queryFn: () => assessmentsApi.getUserAssessments(userId),
        enabled: !!userId,
    })
}

export function useAssessmentVersions() {
    return useQuery({
        queryKey: ASSESSMENT_QUERY_KEYS.versions(),
        queryFn: () => assessmentsApi.getVersions(),
    })
}

export function useAssessmentByVersion(version: string) {
    return useQuery({
        queryKey: ASSESSMENT_QUERY_KEYS.versionDetails(version),
        queryFn: () => assessmentsApi.getByVersion(version),
        enabled: !!version,
    })
}

