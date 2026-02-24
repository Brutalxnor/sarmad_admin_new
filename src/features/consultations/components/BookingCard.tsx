import { useLanguage } from '@/shared/context/LanguageContext'
import type { ConsultationBooking } from '../types'

interface BookingCardProps {
    booking: ConsultationBooking;
    specialists?: any[];
    onCancel?: (id: string) => void;
    onAssign?: (id: string, specialistId: string) => void;
    onUpdateStatus?: (id: string, status: string) => void;
}

export function BookingCard({ booking, specialists, onCancel, onAssign, onUpdateStatus }: BookingCardProps) {
    const { language, t, direction } = useLanguage()

    const typeName = language === 'ar' ? booking.type?.name_ar : booking.type?.name_en
    const specialistName = booking.specialist?.name || '---'
    const userName = booking.users?.name || booking.user?.name || '---'
    const userMobile = booking.users?.mobile || booking.user?.mobile || '---'

    const statusColors = {
        confirmed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
        completed: 'bg-blue-100 text-blue-700',
        pending: 'bg-amber-100 text-amber-700',
    }

    return (
        <div className={`glass-panel p-6 flex flex-col transition-all duration-300 hover:shadow-xl group relative overflow-hidden ${booking.status === 'cancelled' ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xl">
                        📅
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 tracking-tight">{typeName}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(booking.scheduled_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </p>
                    </div>
                </div>
                <select
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-none cursor-pointer focus:ring-2 focus:ring-brand-500/20 ${statusColors[booking.status] || 'bg-slate-100 text-slate-600'}`}
                    value={booking.status}
                    onChange={(e) => onUpdateStatus?.(booking.id, e.target.value)}
                >
                    <option value="pending">{direction === 'rtl' ? 'قيد الانتظار' : 'Pending'}</option>
                    <option value="confirmed">{direction === 'rtl' ? 'مؤكد' : 'Confirmed'}</option>
                    <option value="completed">{direction === 'rtl' ? 'مكتمل' : 'Completed'}</option>
                    <option value="cancelled">{direction === 'rtl' ? 'ملغي' : 'Cancelled'}</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-right">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {direction === 'rtl' ? 'العميل' : 'Client'}
                    </p>
                    <p className="text-sm font-bold text-slate-700">{userName}</p>
                    <p className="text-xs text-slate-400">{userMobile}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {direction === 'rtl' ? 'الأخصائي/المدرب الحالي' : 'Current Coach/Specialist'}
                    </p>
                    <p className="text-sm font-bold text-slate-700">{specialistName}</p>

                    {['confirmed', 'pending'].includes(booking.status) && specialists && (
                        <select
                            className="mt-2 w-full text-[10px] bg-slate-50 border-none rounded-lg p-1 font-bold text-brand-600 focus:ring-1 focus:ring-brand-500/20"
                            value={booking.specialist_id || ''}
                            onChange={(e) => onAssign?.(booking.id, e.target.value)}
                        >
                            <option value="">{direction === 'rtl' ? 'تعيين مدرب/أخصائي...' : 'Assign coach/specialist...'}</option>
                            {specialists.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {booking.notes && (
                <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 italic">"{booking.notes}"</p>
                </div>
            )}

            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {booking.type?.duration} {direction === 'rtl' ? 'دقيقة' : 'min'}
                    </span>
                    <span className="text-slate-200">|</span>
                    <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                        {booking.type?.price} {t('common.currency')}
                    </span>
                </div>

                {['confirmed', 'pending'].includes(booking.status) && (
                    <button
                        onClick={() => onCancel?.(booking.id)}
                        className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors cursor-pointer"
                    >
                        {direction === 'rtl' ? 'إلغاء الحجز' : 'Cancel Booking'}
                    </button>
                )}
            </div>
        </div>
    )
}
