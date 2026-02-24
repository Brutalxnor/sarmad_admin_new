import type { ProgramEnrollment, AdherenceMetrics, OutcomeMetrics } from '../types'
import { useLanguage } from '@/shared/context/LanguageContext'

interface EnrollmentCardProps {
    enrollment: ProgramEnrollment
}

export function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
    const { t, direction } = useLanguage()

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(direction === 'rtl' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    // Helper to parse metrics if stringified
    const parseMetrics = <T,>(metrics: any): T | null => {
        if (!metrics) return null;
        if (typeof metrics === 'string') {
            try {
                return JSON.parse(metrics) as T;
            } catch (e) {
                return null;
            }
        }
        return metrics as T;
    }

    const adherence = parseMetrics<AdherenceMetrics>(enrollment.adherence_metrics);
    const outcomes = parseMetrics<OutcomeMetrics>(enrollment.outcome_metrics);

    return (
        <div className="glass-panel p-6 card-hover bg-white border-transparent hover:border-brand-100 transition-all duration-300">
            {/* Header: Program & Day */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl font-black border border-brand-100">
                        {enrollment.program_template.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                            {enrollment.program_template}
                        </h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            ID: {enrollment.id.split('-')[0]}...
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase mb-1">{t('enrollments.day_index')}</span>
                    <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {enrollment.day_index}
                    </div>
                </div>
            </div>

            {/* User & Start Date */}
            <div className="grid grid-cols-2 gap-6 py-4 border-y border-slate-50">
                <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                        {enrollment.users ? 'Customer' : 'User ID'}
                    </span>
                    <p className="text-sm font-bold text-slate-700 truncate" dir="ltr">
                        {enrollment.users ? enrollment.users.name : `@${enrollment.user_id.split('-')[0]}`}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{t('enrollments.start_date')}</span>
                    <p className="text-sm font-bold text-slate-700">{formatDate(enrollment.start_date)}</p>
                </div>
            </div>

            {/* Detailed Adherence Metrics */}
            <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-3 bg-brand-500 rounded-full" />
                        {t('enrollments.adherence')}
                    </h5>
                    {adherence && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-orange-500">🔥 {adherence.streak} Days</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Habits Done</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-slate-700">{adherence?.habits_completed || 0}</span>
                            <span className="text-[10px] font-bold text-slate-400">tasks</span>
                        </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Window Sync</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-base font-black text-slate-700">
                                {adherence ? Math.round(adherence.sleep_window_adherence * 100) : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Outcomes Section */}
            <div className="mt-5 pt-4 border-t border-slate-50 space-y-3">
                <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-3 bg-blue-500 rounded-full" />
                    Target Outcomes
                </h5>
                <div className="flex items-center gap-4">
                    <div className="flex-1 flex items-center justify-between p-2.5 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <span className="text-[10px] font-bold text-blue-600">Energy</span>
                        <span className="text-sm font-black text-blue-700">{outcomes?.energy_score || 0}/10</span>
                    </div>
                    <div className="flex-1 flex items-center justify-between p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                        <span className="text-[10px] font-bold text-indigo-600">Sleep</span>
                        <span className="text-sm font-black text-indigo-700">{outcomes?.sleep_quality || 0}/5</span>
                    </div>
                </div>
            </div>

            <button className="w-full mt-6 py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-200">
                Generate Full Progress Report
            </button>
        </div>
    )
}
