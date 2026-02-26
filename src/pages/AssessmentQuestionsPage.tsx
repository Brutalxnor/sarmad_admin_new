import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
    useAssessmentByVersion
} from '@/features/assessments/hooks/use-assessments'
import { useToggleAssessmentStatus } from '@/features/questions/hooks/use-questions'
import { useLanguage } from '@/shared/context/LanguageContext'
import {
    ChevronRight,
    Plus,
    CheckCircle2,
    EyeOff,
    Star,
    Edit3,
    GripVertical
} from 'lucide-react'

export default function AssessmentQuestionsPage() {
    const { version } = useParams<{ version: string }>()
    const navigate = useNavigate()
    const { direction, language } = useLanguage()

    // Use the version-specific query for better focus and invalidation
    const { data: versionResponse, isLoading, refetch } = useAssessmentByVersion(version || '')
    const toggleStatus = useToggleAssessmentStatus()



    const isRTL = direction === 'rtl'
    const questions = useMemo(() => versionResponse?.data || [], [versionResponse])

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const toastId = toast.loading(isRTL ? 'جاري التحديث...' : 'Updating...')
        try {
            await toggleStatus.mutateAsync({ id, in_assessment: !currentStatus })
            toast.success(isRTL ? 'تم التحديث بنجاح' : 'Updated successfully', { id: toastId })
            // Explicitly refetch to be sure we have the latest
            refetch()
        } catch (err) {
            toast.error(isRTL ? 'فشل التحديث' : 'Update failed', { id: toastId })
            console.error('Failed to toggle status:', err)
        }
    }

    const decodedVersion = version ? decodeURIComponent(version).trim() : ''



    const stats = [
        {
            label: isRTL ? 'إجمالي عدد الأسئلة' : 'Total Questions',
            value: questions.length,
            icon: <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 font-black">?</div>,
            bg: 'bg-white'
        },
        {
            label: isRTL ? 'الأسئلة النشطة' : 'Active Questions',
            value: questions.filter(q => q.in_assessment).length,
            icon: <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><CheckCircle2 size={24} /></div>,
            bg: 'bg-white'
        },
        {
            label: isRTL ? 'عدد الأسئلة المخفية' : 'Hidden Questions',
            value: questions.filter(q => !q.in_assessment).length,
            icon: <div className="w-10 h-10 rounded-xl bg-sky-400 flex items-center justify-center text-white"><EyeOff size={20} /></div>,
            bg: 'bg-white'
        },
    ]



    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#35788D]"></div>
        </div>
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8 bg-[#F9FBFC] min-h-screen" dir={direction}>
            {/* Breadcrumbs */}
            <div className={`flex items-center gap-2 text-sm font-bold text-slate-400 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                <span>{isRTL ? 'عرض الأسئلة' : 'View Questions'}</span>
                {isRTL ? <ChevronRight size={16} className="rotate-180" /> : <ChevronRight size={16} />}
                <Link to="/assessments" className="hover:text-[#35788D] transition-colors">
                    {isRTL ? 'العودة لإدارة التقييم والتوجيه' : 'Back to Assessment Management'}
                </Link>
            </div>

            {/* Header Row */}
            <div className={`flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={isRTL ? 'text-start' : 'text-end'}>
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                            <h1 className="text-3xl font-black text-slate-800">
                                {isRTL ? 'تقييم النوم الشامل' : 'Comprehensive Sleep Assessment'}
                            </h1>
                            <span className="bg-sky-50 text-sky-500 px-3 py-1 rounded-lg text-xs font-black">
                                {decodedVersion}
                            </span>
                        </div>
                        <p className="text-slate-400 font-bold mt-1">
                            {isRTL ? 'مراجعة وإدارة كافة الأسئلة المدرجة في التقييم الطبي' : 'Review and manage all questions included in the medical assessment'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/assessments/${version}/add-question`)}
                    className="bg-[#0095D9] text-white px-8 py-3 rounded-2xl font-black text-base shadow-lg shadow-[#0095D9]/20 hover:-translate-y-1 transition-all flex items-center gap-3">
                    <Plus size={20} />
                    {isRTL ? 'إضافة سؤال جديد' : 'Add New Question'}
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center relative group hover:shadow-md transition-all">
                        <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 mb-1 mt-6">{stat.value}</h3>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Questions Bank List */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 space-y-6 bg-[#F9FBFC]/50">
                    {questions.length === 0 ? (
                        <div className="py-20 text-center text-slate-300 font-bold italic">
                            {isRTL ? 'لا توجد أسئلة لهذه النسخة' : 'No questions for this version'}
                        </div>
                    ) : (
                        questions.map((q: any, idx: number) => (
                            <div key={q.id} className="bg-white rounded-[2rem] p-10 border border-gray-100 shadow-sm hover:shadow-md transition-all relative text-right">
                                {/* Top Header: Toggle (Left) | Badge & Number (Right) */}
                                <div className={`flex justify-between items-center mb-10 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                    {/* Toggle Switch */}
                                    <div
                                        onClick={() => handleToggle(q.id, q.in_assessment || false)}
                                        className={`w-14 h-7 rounded-full transition-all relative cursor-pointer ${toggleStatus.isPending ? 'opacity-50 cursor-wait' : ''} ${q.in_assessment ? 'bg-[#0095D9]' : 'bg-slate-200'}`}
                                        title={isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${isRTL ? (q.in_assessment ? 'right-8' : 'right-1') : (q.in_assessment ? 'left-8' : 'left-1')}`} />
                                    </div>

                                    {/* Number, Handle & Tag */}
                                    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className="bg-[#F4F9FB] text-slate-500 px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 border border-slate-50">
                                            {isRTL ? 'اختيار من متعدد' : 'Multiple Choice'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400 font-black text-sm">{String(idx + 1).padStart(2, '0')}</span>
                                            <GripVertical className="text-slate-300" size={18} />
                                        </div>
                                    </div>
                                </div>

                                {/* Question Title */}
                                <div className="text-right mb-10">
                                    <h3 className="text-[22px] font-black text-[#5C7E95] leading-snug">
                                        {q.question}
                                    </h3>
                                </div>

                                {/* Metadata Row (4 Pillars) */}
                                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">{isRTL ? 'الوزن/النسبة' : 'Weight/Percentage'}</span>
                                        <span className="text-sm font-black text-slate-700">{isRTL ? '5 %' : '5 %'}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">{isRTL ? 'عدد الخيارات' : 'Number of Choices'}</span>
                                        <span className="text-sm font-black text-slate-700">{q.answers?.length || 0} {isRTL ? 'خيارات' : 'Choices'}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">{isRTL ? 'حالته' : 'Status'}</span>
                                        <span className={`text-sm font-black text-emerald-500 flex items-center gap-1.5 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                            {isRTL ? 'مفعل' : 'Active'} <CheckCircle2 size={12} />
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">{isRTL ? 'تاريخ الإضافة' : 'Date Added'}</span>
                                        <span className="text-sm font-black text-slate-700">{new Date(q.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                                    </div>
                                </div>

                                {/* Choices Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-start mb-4">
                                        <span className="text-xs font-black text-sky-400">{isRTL ? 'الإختيارات' : 'Choices'}</span>
                                    </div>

                                    <div className="space-y-3">
                                        {(q.answers || []).map((ans: any, aIdx: number) => (
                                            <div key={aIdx} className="bg-white border border-gray-100/60 rounded-xl p-4 flex justify-between items-center hover:bg-slate-50 transition-all">
                                                <span className="text-sm font-bold text-slate-400 uppercase">{ans.answer}</span>
                                                <div className="p-1 px-2 text-[#35788D] bg-white border border-slate-100 rounded-lg">
                                                    <Edit3 size={14} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
