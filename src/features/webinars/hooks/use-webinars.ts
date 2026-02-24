import { useQuery } from '@tanstack/react-query'
import { webinarsApi } from '../api'

const WEBINARS_QUERY_KEYS = {
    all: ['webinars'] as const,
    lists: () => [...WEBINARS_QUERY_KEYS.all, 'list'] as const,
    attendees: (id: string) => [...WEBINARS_QUERY_KEYS.all, id, 'attendees'] as const,
}

export function useWebinars() {
    return useQuery({
        queryKey: WEBINARS_QUERY_KEYS.lists(),
        queryFn: () => webinarsApi.getAll(),
    })
}

export function useWebinarAttendees(webinarId: string) {
    return useQuery({
        queryKey: WEBINARS_QUERY_KEYS.attendees(webinarId),
        queryFn: () => webinarsApi.getAttendees(webinarId),
        enabled: !!webinarId,
    })
}
