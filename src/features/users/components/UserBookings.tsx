import { useLanguage } from '@/shared/context/LanguageContext'
import { BookingCard } from '@/features/consultations/components/BookingCard'
import { useConsultations } from '@/features/consultations/hooks/use-consultations'
import type { ConsultationBooking } from '@/features/consultations/types'

export function UserBookings({ bookings }: { bookings: ConsultationBooking[] }) {
    const { t } = useLanguage()
    const { specialists, cancelBooking, assignSpecialist, updateStatus } = useConsultations()

    if (bookings.length === 0) {
        return (
            <div className="glass-panel p-8 text-center text-slate-400 font-bold border-dashed border-2">
                {t('users.no_bookings') || 'No bookings found'}
            </div>
        )
    }

    const handleCancel = async (id: string) => {
        if (window.confirm(t('common.confirm_cancel') || 'Are you sure you want to cancel?')) {
            try {
                await cancelBooking(id)
            } catch (error) {
                console.error('Failed to cancel booking:', error)
            }
        }
    }

    const handleAssign = async (id: string, specialistId: string) => {
        try {
            await assignSpecialist({ id, specialistId })
        } catch (error) {
            console.error('Failed to assign specialist:', error)
        }
    }

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await updateStatus({ id, status })
        } catch (error) {
            console.error('Failed to update status:', error)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
                <BookingCard
                    key={booking.id}
                    booking={booking}
                    specialists={specialists}
                    onCancel={handleCancel}
                    onAssign={handleAssign}
                    onUpdateStatus={handleStatusUpdate}
                />
            ))}
        </div>
    )
}
