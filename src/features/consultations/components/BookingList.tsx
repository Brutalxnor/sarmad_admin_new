import { usePagination } from '@/shared/hooks/use-pagination'
import { Pagination } from '@/shared/components/Pagination'
import type { ConsultationBooking } from '../types'
import { useConsultations } from '../hooks/use-consultations'
import { useLanguage } from '@/shared/context/LanguageContext'
import { BookingCard } from './BookingCard'

export function BookingList() {
    const { data: bookings, isLoading, cancelBooking, specialists, assignSpecialist, updateStatus } = useConsultations()
    const { direction } = useLanguage()

    // Pagination
    const { currentData: paginatedBookings, currentPage, totalPages, goToPage } = usePagination<ConsultationBooking>({
        data: bookings || [],
        itemsPerPage: 9
    })

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
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-800">
                        {direction === 'rtl' ? 'حجوزات الاستشارات' : 'Consultation Bookings'}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium px-1">
                        {bookings?.length || 0} {direction === 'rtl' ? 'حجز' : 'bookings'}
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-panel h-64 animate-pulse bg-slate-100/50 rounded-2xl" />
                    ))}
                </div>
            ) : paginatedBookings && paginatedBookings.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedBookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                specialists={specialists}
                                onCancel={cancelBooking}
                                onAssign={handleAssign}
                                onUpdateStatus={handleStatusUpdate}
                            />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                    />
                </>
            ) : (
                <div className="glass-panel p-16 text-center bg-white/50 border-dashed border-2 border-slate-100">
                    <div className="w-20 h-20 bg-slate-50/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <span className="text-4xl">📅</span>
                    </div>
                    <p className="text-slate-400 font-bold text-lg mb-2">
                        {direction === 'rtl' ? 'لا توجد حجوزات حالياً' : 'No bookings found'}
                    </p>
                </div>
            )}
        </div>
    )
}
