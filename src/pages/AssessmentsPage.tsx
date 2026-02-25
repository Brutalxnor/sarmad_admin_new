import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
    useAssessmentsWithQuestions,
    useActivateAssessment,
    useDeactivateAssessment
} from '@/features/assessments/hooks/use-assessment-metadata'
import { ViewQuestionModal } from '@/features/questions/components/ViewQuestionModal'
import { EditQuestionModal } from '@/features/questions/components/EditQuestionModal'
import type { Question } from '@/features/questions/types/question.types'
import { useLanguage } from '@/shared/context/LanguageContext'
import {
    Plus,
    Settings,
    Edit2,
    Eye,
    ClipboardCheck,
    FileText,
    TrendingUp,
    BarChart3,
    LayoutGrid,
    ArrowUpRight,
    CheckCircle2
} from 'lucide-react'

type TabType = 'overview' | 'questions' | 'scoring' | 'guidance'

export default function AssessmentsPage() {
    const navigate = useNavigate()
    const { t, direction, language } = useLanguage()
    const { data: assessmentsResponse, isLoading } = useAssessmentsWithQuestions()
    const activateAssessment = useActivateAssessment()
    const deactivateAssessment = useDeactivateAssessment()
    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const [selectedVersion, setSelectedVersion] = useState<string>('all')
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

    const handleViewQuestion = (question: Question) => {
        setSelectedQuestion(question)
        setIsViewModalOpen(true)
    }

    const handleEditQuestion = (question: Question) => {
        setSelectedQuestion(question)
        setIsEditModalOpen(true)
    }

    const handleToggleStatus = (id: string, currentStatus: string) => {
        if (currentStatus === 'active') {
            deactivateAssessment.mutate(id)
        } else {
            // Check if there's already an active assessment
            const hasActive = groupedData.some((a: any) => a.is_active)
            if (hasActive) {
                toast.error(isRTL
                    ? 'يوجد تقييم نشط بالفعل. يرجى إلغاء تفعيل التقييم الحالي أولاً.'
                    : 'There is already an active assessment. Please deactivate the current one first.'
                )
                return
            }
            activateAssessment.mutate(id)
        }
    }

    const isRTL = direction === 'rtl'
    const groupedData = assessmentsResponse?.data || []

    // Derived Data
    const assessments = useMemo(() => {
        return groupedData.map((assessment: any, index: number) => ({
            id: assessment.id,
            title: assessment.name || (language === 'ar' ? 'تقييم النوم الشامل' : 'Comprehensive Sleep Assessment'),
            version: assessment.version?.toString(),
            status: assessment.is_active ? 'active' : 'inactive',
            questions: assessment.questions?.length || 0,
            // Realistic mock data until backend provides these metrics
            submissions: '0',
            completionRate: '0%',
            lastUpdate: assessment.updated_at ? new Date(assessment.updated_at).toLocaleDateString() : (assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : ''),
            questionsList: assessment.questions || []
        }))
    }, [groupedData, language])

    const totalQuestionsCount = useMemo(() => {
        return groupedData.reduce((sum: number, g: any) => sum + (g.questions?.length || 0), 0)
    }, [groupedData])

    const displayQuestions = useMemo(() => {
        if (selectedVersion === 'all') {
            return groupedData.flatMap((g: any) => g.questions || [])
        }
        return groupedData.find((g: any) => String(g.version) === String(selectedVersion))?.questions || []
    }, [groupedData, selectedVersion])

    const stats = [
        {
            label: t('assessments.stats.active'),
            value: assessments.length.toString(),
            icon: <ClipboardCheck className="text-[#35788D]" />,
            iconBg: 'bg-[#F4F9FB]',
            suffix: ''
        },
        {
            label: t('assessments.stats.questions'),
            value: totalQuestionsCount.toString(),
            icon: <FileText className="text-[#0095D9]" />,
            iconBg: 'bg-sky-50',
            suffix: ''
        },
        {
            label: t('assessments.stats.submissions'),
            value: '21,245',
            icon: <TrendingUp className="text-emerald-500" />,
            iconBg: 'bg-emerald-50',
            suffix: ''
        },
        {
            label: t('assessments.stats.completion'),
            value: '85%',
            icon: <BarChart3 className="text-orange-600" />,
            iconBg: 'bg-orange-50',
            suffix: ''
        }
    ]

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-10 bg-[#F9FBFC] min-h-screen space-y-10 animate-fade-in">
            {/* Header */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={isRTL ? 'text-start' : 'text-end'}>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
                        {t('assessments.title')}
                    </h1>
                    <p className="text-slate-400 font-bold">
                        {t('assessments.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/assessments/create')}
                    className="bg-[#0095D9] text-white px-8 py-4 rounded-full font-black text-lg shadow-lg shadow-[#0095D9]/30 hover:shadow-[#0095D9]/40 hover:-translate-y-1 transition-all flex items-center gap-3">
                    <Plus size={24} />
                    {t('assessments.add_new_assessment')}
                </button>

            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center group hover:shadow-md transition-all relative">
                        <div className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} w-14 h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-4xl font-black text-slate-800 mb-2 mt-8">{stat.value}</h3>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className={`flex border-b border-gray-100 pt-4 px-12 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex gap-12 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    {[
                        { id: 'overview', label: t('assessments.tab.overview'), icon: <LayoutGrid size={20} /> },
                        { id: 'questions', label: t('assessments.tab.questions'), icon: <FileText size={20} /> },
                        { id: 'scoring', label: t('assessments.tab.scoring'), icon: <BarChart3 size={20} /> },
                        { id: 'guidance', label: t('assessments.tab.guidance'), icon: <ArrowUpRight size={20} /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`flex items-center gap-3 pb-4 text-base font-black transition-all relative ${activeTab === tab.id
                                ? 'text-[#35788D]'
                                : 'text-slate-300 hover:text-slate-400'
                                } ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                            {tab.icon}
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#35788D] rounded-full scale-x-110" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="pt-4">
                {activeTab === 'overview' && (
                    <div className="space-y-6 max-w-5xl mx-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#35788D]"></div>
                            </div>
                        ) : assessments.map((assessment: any) => (
                            <div
                                key={assessment.id}
                                onClick={() => navigate(`/assessments/${assessment.version}/questions`)}
                                className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-md transition-all relative group cursor-pointer"
                            >
                                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-8 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className="flex flex-col gap-1">
                                            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                                <h3 className="text-2xl font-black text-slate-800">{assessment.title}</h3>
                                                <span className="text-sky-500 font-black text-xs px-2 py-0.5 bg-sky-50 rounded-md">
                                                    {assessment.version}
                                                </span>
                                            </div>
                                            <div className={`flex items-center gap-2 mt-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                                <div className={`flex items-center gap-2 mt-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleStatus(assessment.id, assessment.status);
                                                        }}
                                                        className={`flex items-center gap-1.5 px-3 py-1 ${assessment.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} rounded-full text-xs font-black hover:opacity-80 transition-opacity`}
                                                    >
                                                        <CheckCircle2 size={12} />
                                                        {assessment.status === 'active' ? (t('common.active') || 'نشط') : (t('common.inactive') || 'غير نشط')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                                        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#35788D] hover:text-white transition-all shadow-sm">
                                            <Settings size={18} />
                                        </button>
                                        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/assessments/${assessment.version}/questions`)}
                                            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-sky-500 hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>


                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                                    {[
                                        { label: t('assessments.list.questions'), value: assessment.questions },
                                        { label: t('assessments.list.submissions'), value: assessment.submissions },
                                        { label: t('assessments.list.completion'), value: assessment.completionRate },
                                        { label: t('assessments.list.last_update'), value: assessment.lastUpdate }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-[#F4F9FB]/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-2">{item.label}</p>
                                            <p className="text-xl font-black text-slate-700">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm max-w-6xl mx-auto min-h-[600px]">
                        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                            <h2 className="text-2xl font-black text-slate-800">
                                {t('assessments.questions.bank_title')}
                            </h2>

                            {/* Version Filter */}
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    {language === 'ar' ? 'تصفية حسب الإصدار:' : 'Filter by Version:'}
                                </span>
                                <select
                                    value={selectedVersion}
                                    onChange={(e) => setSelectedVersion(e.target.value)}
                                    className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-black text-[#35788D] outline-none cursor-pointer"
                                >
                                    <option value="all">{language === 'ar' ? 'جميع الإصدارات' : 'All Versions'}</option>
                                    {groupedData.map((g: any) => (
                                        <option key={g.version} value={g.version}>{g.version}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#35788D]"></div>
                                </div>
                            ) : displayQuestions.length === 0 ? (
                                <div className="text-center py-20 text-slate-300 font-bold">
                                    {t('questions.empty')}
                                </div>
                            ) : (
                                displayQuestions.map((q: any, idx: number) => (
                                    <div key={q.id} className="border border-gray-50 rounded-2xl p-6 flex items-center justify-between hover:bg-[#F4F9FB]/30 transition-all group">
                                        <div className={`flex items-center gap-6 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <div className={`text-slate-800 font-black flex items-center gap-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                                <span className="text-[#35788D] opacity-40">س{idx + 1}.</span>
                                                <span className="line-clamp-1 max-w-md">{q.question}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-sky-50 text-[#0095D9] rounded-full text-[10px] font-black">
                                                    {q.assess_version}
                                                </span>
                                                <span className="px-3 py-1 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black">
                                                    {t('assessments.questions.mandatory')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleEditQuestion(q)}
                                                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleViewQuestion(q)}
                                                className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {(activeTab === 'scoring' || activeTab === 'guidance') && (
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
                            {activeTab === 'scoring' ? <BarChart3 size={40} /> : <ArrowUpRight size={40} />}
                        </div>
                        <h3 className="text-xl font-black text-slate-400">
                            {t('common.no_data')}
                        </h3>
                    </div>
                )}
            </div>

            <ViewQuestionModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                question={selectedQuestion}
            />
            <EditQuestionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                question={selectedQuestion}
            />
        </div>
    )
}

