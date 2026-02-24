import { useWebinarAttendees } from '../hooks/use-webinars'
import { useLanguage } from '@/shared/context/LanguageContext'
import type { WebinarAttendee, Webinar } from '../types'

interface WebinarAttendeesProps {
    webinar: Webinar
    onBack: () => void
}

export function WebinarAttendees({ webinar, onBack }: WebinarAttendeesProps) {
    const { data: attendees, isLoading } = useWebinarAttendees(webinar.id)
    const { t, direction } = useLanguage()

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(direction === 'rtl' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xs">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className={`p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 ${direction === 'rtl' ? '' : 'rotate-180'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('webinars.attendees_title')}</h1>
                        <p className="text-sm text-slate-400 font-bold">{webinar.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-brand-50 text-brand-700 px-4 py-2 rounded-2xl border border-brand-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-sm font-black">{attendees?.length || 0} / {webinar.capacity} {t('webinars.attendees_registered')}</span>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="glass-panel overflow-hidden bg-white/80 backdrop-blur-xl border border-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{t('webinars.col_user')}</th>
                                <th className="px-6 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{t('webinars.col_phone')}</th>
                                <th className="px-6 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{t('webinars.col_reg_date')}</th>
                                <th className="px-6 py-4 text-start text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">{t('webinars.col_status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 bg-slate-100 rounded-xl w-32" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-full w-24" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-full w-28" /></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded-xl w-20 mx-auto" /></td>
                                    </tr>
                                ))
                            ) : attendees && attendees.length > 0 ? (
                                attendees.map((attendee: WebinarAttendee) => (
                                    <tr key={attendee.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-brand-200">
                                                    {(attendee.user?.name || '?').charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-700">{attendee.user?.name || 'مستخدم غير معروف'}</span>
                                                    <span className="text-xs text-slate-400 font-bold">{attendee.user?.email || (direction === 'rtl' ? 'لا يوجد بريد' : 'No email')}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-500 tabular-nums">{attendee.user?.mobile || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-400">
                                            {formatDate(attendee.registered_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight border shadow-xs ${attendee.attended
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    {attendee.attended ? t('webinars.status_attended') : t('webinars.status_pending')}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-slate-400 font-bold">{t('webinars.attendees_empty')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
