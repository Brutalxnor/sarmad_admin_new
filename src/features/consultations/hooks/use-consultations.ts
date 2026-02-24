import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { consultationsApi } from '../api'

const CONSULTATIONS_QUERY_KEYS = {
    all: ['consultations'] as const,
    bookings: () => [...CONSULTATIONS_QUERY_KEYS.all, 'bookings'] as const,
    specialists: () => [...CONSULTATIONS_QUERY_KEYS.all, 'specialists'] as const,
}

export function useConsultations() {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: CONSULTATIONS_QUERY_KEYS.bookings(),
        queryFn: () => consultationsApi.getAllBookings(),
    })

    const specialistsQuery = useQuery({
        queryKey: CONSULTATIONS_QUERY_KEYS.specialists(),
        queryFn: () => consultationsApi.getSpecialists(),
    })

    const cancelMutation = useMutation({
        mutationFn: (id: string) => consultationsApi.updateBooking(id, { status: 'cancelled' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONSULTATIONS_QUERY_KEYS.bookings() })
        }
    })

    const assignMutation = useMutation({
        mutationFn: ({ id, specialistId }: { id: string; specialistId: string }) =>
            consultationsApi.updateBooking(id, { specialist_id: specialistId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONSULTATIONS_QUERY_KEYS.bookings() })
        }
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            consultationsApi.updateBooking(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONSULTATIONS_QUERY_KEYS.bookings() })
        }
    })

    return {
        ...query,
        specialists: specialistsQuery.data,
        isLoadingSpecialists: specialistsQuery.isLoading,
        cancelBooking: cancelMutation.mutateAsync,
        assignSpecialist: assignMutation.mutateAsync,
        updateStatus: updateStatusMutation.mutateAsync,
        isCancelling: cancelMutation.isPending,
        isAssigning: assignMutation.isPending,
        isUpdating: updateStatusMutation.isPending,
    }
}
