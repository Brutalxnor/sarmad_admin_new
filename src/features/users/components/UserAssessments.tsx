import { useLanguage } from '@/shared/context/LanguageContext'
import { FileText, Eye, Calendar } from 'lucide-react'

interface Assessment {
    id: string
    created_at: string
    score: number
    routing_outcome?: string
    risk_levels?: Record<string, string>
    answers?: any[]
}

export function AssessmentList({ assessments }: { assessments: Assessment[] }) {
    const { direction, language } = useLanguage()
    const isRTL = direction === 'rtl'

    if (assessments.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText size={40} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-400 mb-2">
                    {isRTL ? 'لا توجد اختبارات منجزة' : 'No completed tests'}
                </h3>
                <p className="text-slate-300 font-bold max-w-xs mx-auto">
                    {isRTL ? 'لم يقم هذا المستخدم بإكمال أي اختبارات تقييمية بعد.' : 'This user has not completed any assessment tests yet.'}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className={`p-8 border-b border-slate-50 bg-slate-50/10 flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <h3 className="text-xl font-black text-slate-800">{isRTL ? 'الإختبارات المنجزة' : 'Completed Tests'}</h3>
                </div>

                <div className="p-6 space-y-4">
                    {assessments.map((item) => {
                        // Determine risk level based on routing outcome or risk_levels (if they exist)
                        const isHighRisk = item.routing_outcome === 'specialist' || (item.risk_levels && Object.values(item.risk_levels).includes('high')) || (item.score > 70)

                        return (
                            <div key={item.id} className={`group bg-white rounded-[1.5rem] p-6 border border-gray-100 hover:border-[#35788D]/30 hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                {/* Right Side (Title & Date) */}
                                <div className={`flex items-center gap-5 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#35788D] group-hover:bg-[#35788D] group-hover:text-white transition-all">
                                        <FileText size={24} />
                                    </div>
                                    <div className={isRTL ? 'text-right' : 'text-left'}>
                                        <h4 className="text-lg font-black text-slate-800 mb-1">
                                            {item.answers?.[0]?.questions?.assess_version
                                                ? (isRTL ? `تقييم: ${item.answers[0].questions.assess_version}` : `Assessment: ${item.answers[0].questions.assess_version}`)
                                                : (isRTL ? `مقياس اختبار النوم #${item.id.slice(-4).toUpperCase()}` : `Sleep Test Scale #${item.id.slice(-4).toUpperCase()}`)}
                                        </h4>
                                        <div className={`flex items-center gap-2 text-slate-400 font-bold text-sm ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                            <Calendar size={14} />
                                            <span>{new Date(item.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Center (Score & Risk) */}
                                <div className="flex flex-col items-center justify-center min-w-[120px]">
                                    <div className="text-2xl font-black text-slate-800">
                                        {item.score || 0}<span className="text-sm text-slate-300 ml-1">/100</span>
                                    </div>
                                    <span className={`mt-1 px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${isHighRisk
                                        ? 'bg-rose-50 text-rose-500 border-rose-100'
                                        : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                                        }`}>
                                        {isHighRisk
                                            ? (isRTL ? 'خطر مرتفع' : 'High Risk')
                                            : (isRTL ? 'حالة مستقرة' : 'Stable Case')
                                        }
                                    </span>
                                </div>

                                {/* Left Side (Button) */}
                                <button className={`flex items-center gap-2 px-6 py-3 rounded-xl border border-[#35788D]/20 text-[#35788D] font-black text-sm hover:bg-[#35788D] hover:text-white transition-all ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <Eye size={16} />
                                    <span>{isRTL ? 'عرض التفاصيل' : 'View Details'}</span>
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
