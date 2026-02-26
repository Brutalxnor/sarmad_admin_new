import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useCreateQuestion } from '@/features/questions/hooks/use-questions'
import { useCreateMetadata } from '@/features/assessments/hooks/use-assessment-metadata'
import {
    Save,
    Plus,
    Trash2,
    HelpCircle,
    CheckCircle2,
    LayoutList,
    FileText,
    AlertCircle,
    Info
} from 'lucide-react'

interface LocalQuestion {
    id: string
    question: string
    category: string
    answers: { text: string; points: number }[]
}

export default function CreateAssessmentPage() {
    const navigate = useNavigate()
    const { direction, language } = useLanguage()
    const createQuestion = useCreateQuestion()
    const createMetadata = useCreateMetadata()
    const isRTL = direction === 'rtl'

    // Assessment overall state
    const [version, setVersion] = useState('')
    const [metadata, setMetadata] = useState({
        name: '',
        description: '',
        category: 'Health',
        estimated_time: 15,
        is_active: false
    })
    const [questions, setQuestions] = useState<LocalQuestion[]>([])

    // Current question form state
    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        category: 'Intro',
        answers: [] as { id: string; text: string; points: number }[]
    })

    const handleAddAnswer = () => {
        setCurrentQuestion(prev => ({
            ...prev,
            answers: [...prev.answers, { id: Date.now().toString(), text: '', points: 0 }]
        }))
    }

    const handleUpdateAnswer = (id: string, updates: Partial<{ text: string; points: number }>) => {
        setCurrentQuestion(prev => ({
            ...prev,
            answers: prev.answers.map(a => a.id === id ? { ...a, ...updates } : a)
        }))
    }

    const handleRemoveAnswer = (id: string) => {
        setCurrentQuestion(prev => ({
            ...prev,
            answers: prev.answers.filter(a => a.id !== id)
        }))
    }

    const handleAddQuestionToList = () => {
        if (!currentQuestion.question.trim()) {
            toast.error(isRTL ? 'يرجى إدخال نص السؤال' : 'Please enter question text')
            return
        }
        if (currentQuestion.answers.length === 0) {
            toast.error(isRTL ? 'يرجى إضافة إجابة واحدة على الأقل' : 'Please add at least one answer')
            return
        }
        if (currentQuestion.answers.some(a => !a.text.trim())) {
            toast.error(isRTL ? 'يرجى ملء كافة نصوص الإجابات' : 'Please fill all answer texts')
            return
        }

        const totalPoints = currentQuestion.answers.reduce((sum, a) => sum + a.points, 0)
        if (totalPoints !== 100) {
            toast.error(isRTL ? 'مجموع نسب الإجابات يجب أن يكون 100% حالياً: ' + totalPoints + '%' : 'Total answer percentage must sum to 100% (Current: ' + totalPoints + '%)')
            return
        }

        const newQuestion: LocalQuestion = {
            id: Date.now().toString(),
            question: currentQuestion.question,
            category: currentQuestion.category,
            answers: currentQuestion.answers.map(a => ({ text: a.text, points: a.points }))
        }

        setQuestions([...questions, newQuestion])
        setCurrentQuestion({
            question: '',
            category: 'Intro',
            answers: []
        })
        toast.success(isRTL ? 'تمت إضافة السؤال للقائمة' : 'Question added to list')
    }

    const handleRemoveQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id))
    }

    const handleFinalSave = async () => {
        if (!version.trim()) {
            toast.error(isRTL ? 'يرجى إدخال رقم الإصدار' : 'Please enter version number')
            return
        }
        if (!metadata.name.trim()) {
            toast.error(isRTL ? 'يرجى إدخال اسم التقييم' : 'Please enter assessment name')
            return
        }
        if (questions.length === 0) {
            toast.error(isRTL ? 'يجب إضافة سؤال واحد على الأقل لإنشاء التقييم' : 'Must add at least one question to create assessment')
            return
        }

        const toastId = toast.loading(isRTL ? 'جاري إنشاء التقييم...' : 'Creating assessment...')
        try {
            // 1. Create Metadata First
            // Parse version to number if possible, or use 1.0
            const versionNum = parseFloat(version.replace(/[^0-9.]/g, '')) || 1.0;

            await createMetadata.mutateAsync({
                name: metadata.name,
                version: versionNum,
                description: metadata.description,
                category: metadata.category,
                estimated_time: `${metadata.estimated_time} ${isRTL ? 'دقيقة' : 'mins'}`,
                is_active: metadata.is_active
            })

            // 2. Create Questions
            for (const q of questions) {
                await createQuestion.mutateAsync({
                    question: q.question,
                    category: q.category,
                    assess_version: version as unknown as number, // Cast to unknown then number to satisfy types if needed
                    answers: q.answers.map(a => ({
                        answer: a.text,
                        percentage: a.points
                    })),
                    in_assessment: true,
                    actual_assess: true
                })
            }
            toast.success(isRTL ? 'تم إنشاء التقييم والأسئلة بنجاح' : 'Assessment and questions created successfully', { id: toastId })
            navigate('/assessments')
        } catch (error: unknown) {
            console.error(error)
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || (isRTL ? 'فشل في إنشاء التقييم' : 'Failed to create assessment'), { id: toastId })
        }
    }

    const categories = [
        { id: 'Intro', label: isRTL ? 'أسئلة تمهيدية' : 'Intro Questions' },
        { id: 'Physical', label: isRTL ? 'الأعراض الجسدية' : 'Physical Symptoms' },
        { id: 'Habits', label: isRTL ? 'العادات اليومية' : 'Daily Habits' },
    ]

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-10 bg-[#F9FBFC] dark:bg-slate-900 min-h-screen space-y-10 animate-fade-in transition-colors duration-300" dir={direction}>
            {/* Header */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={isRTL ? 'text-start' : 'text-end'}>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2 transition-colors duration-300">
                        {isRTL ? 'إضافة تقييم جديد' : 'Add New Assessment'}
                    </h1>
                    <p className="text-slate-400 dark:text-slate-500 font-bold">
                        {isRTL ? 'قم بإنشاء نسخة تقييم جديدة وإضافة الأسئلة الخاصة بها' : 'Create a new assessment version and add its questions'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/assessments')}
                        className="px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-black hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all shadow-sm"
                    >
                        {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        onClick={handleFinalSave}
                        disabled={questions.length === 0 || !version.trim() || createQuestion.isPending}
                        className="bg-[#0095D9] text-white px-10 py-3.5 rounded-2xl font-black text-base shadow-lg shadow-[#0095D9]/20 hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                        <Save size={22} />
                        {isRTL ? 'حفظ التقييم' : 'Save Assessment'}
                    </button>
                </div>
            </div>

            {/* Additional Information Guide */}
            <div className="max-w-6xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm animate-fade-in relative overflow-hidden transition-colors duration-300">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-slate-700 rounded-full blur-3xl -z-0 opacity-50 transform translate-x-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300"></div>

                <div className={`flex items-center gap-4 mb-8 relative z-10 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="w-12 h-12 rounded-2xl border-2 border-[#1EAD93]/20 bg-[#1EAD93]/5 text-[#1EAD93] dark:bg-[#1EAD93]/10 flex items-center justify-center shrink-0">
                        <Info size={24} />
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h3 className="text-2xl font-black text-[#1E293B] dark:text-slate-100 mb-1 transition-colors duration-300">
                            {language === 'ar' ? 'معلومات إضافية' : 'Additional Information'}
                        </h3>
                        <p className="text-sm font-bold text-[#64748B] dark:text-slate-400">
                            {language === 'ar' ? 'دليل توزيع النسب وتوجيه النتائج' : 'Guide for distribution of percentages and directing results'}
                        </p>
                    </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Card 1 (75% - 100%) */}
                    <div className="bg-white dark:bg-slate-900 border-2 border-[#F3E8FF] dark:border-purple-900/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:border-[#D8B4FE] dark:hover:border-purple-500/50">
                        <div className="bg-[#FAF5FF] dark:bg-purple-900/20 text-[#7E22CE] dark:text-purple-400 font-black px-6 py-2.5 rounded-2xl text-sm mb-4 w-full tracking-wider transition-colors duration-300">
                            100% - 75%
                        </div>
                        <div className="font-black text-[#4C1D95] dark:text-purple-200 text-lg mb-2 transition-colors duration-300">
                            {language === 'ar' ? 'أنماط الأرق' : 'Insomnia Patterns'}
                        </div>
                        <div className="text-xs font-bold text-[#9333EA] dark:text-purple-300 transition-colors duration-300">
                            {language === 'ar' ? 'توصية ببرنامج CBT-I' : 'CBT-I Program Recommendation'}
                        </div>
                    </div>

                    {/* Card 2 (25% - 75%) */}
                    <div className="bg-white dark:bg-slate-900 border-2 border-[#D1FAE5] dark:border-emerald-900/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:border-[#6EE7B7] dark:hover:border-emerald-500/50">
                        <div className="bg-[#ECFDF5] dark:bg-emerald-900/20 text-[#047857] dark:text-emerald-400 font-black px-6 py-2.5 rounded-2xl text-sm mb-4 w-full tracking-wider transition-colors duration-300">
                            75% - 25%
                        </div>
                        <div className="font-black text-[#065F46] dark:text-emerald-200 text-lg mb-2 transition-colors duration-300">
                            {language === 'ar' ? 'مخاطر منخفضة' : 'Low Risks'}
                        </div>
                        <div className="text-xs font-bold text-[#059669] dark:text-emerald-300 transition-colors duration-300">
                            {language === 'ar' ? 'خطة تعليمية + استشارة' : 'Educational Plan + Consultation'}
                        </div>
                    </div>

                    {/* Card 3 (< 25%) */}
                    <div className="bg-white dark:bg-slate-900 border-2 border-[#F1F5F9] dark:border-slate-700/50 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:border-[#CBD5E1] dark:hover:border-slate-600">
                        <div className="bg-[#F8FAFC] dark:bg-slate-800 text-[#334155] dark:text-slate-300 font-black px-6 py-2.5 rounded-2xl text-sm mb-4 w-full tracking-wider transition-colors duration-300">
                            {'< 25%'}
                        </div>
                        <div className="font-black text-[#1E293B] dark:text-slate-200 text-lg mb-2 transition-colors duration-300">
                            {language === 'ar' ? 'مخاطر ضئيلة' : 'Minor Risks'}
                        </div>
                        <div className="text-xs font-bold text-[#64748B] dark:text-slate-400 transition-colors duration-300">
                            {language === 'ar' ? 'متابعة المحتوى التعليمي العام' : 'Follow up General Educational Content'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Version & New Question Form */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Version Input */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm space-y-6 transition-colors duration-300">
                        <div className={`flex items-center gap-3 text-sky-500 dark:text-sky-400 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                            <FileText size={24} />
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 transition-colors duration-300">{isRTL ? 'بيانات التقييم' : 'Assessment Info'}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className={`block text-slate-400 dark:text-slate-500 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {isRTL ? 'اسم التقييم' : 'Assessment Name'}
                                </label>
                                <input
                                    type="text"
                                    value={metadata.name}
                                    onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder={isRTL ? 'مثال: تقييم الصحة النفسية' : 'e.g. Mental Health Assessment'}
                                    className="w-full p-5 rounded-2xl bg-[#F9FBFC] dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0095D9]/10 focus:border-[#0095D9]/20 transition-all font-black text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className={`block text-slate-400 dark:text-slate-500 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {isRTL ? 'رقم الإصدار' : 'Version Number'}
                                </label>
                                <input
                                    type="text"
                                    value={version}
                                    onChange={(e) => setVersion(e.target.value)}
                                    placeholder={isRTL ? 'مثال: v2.5' : 'e.g. v2.5'}
                                    className="w-full p-5 rounded-2xl bg-[#F9FBFC] dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0095D9]/10 focus:border-[#0095D9]/20 transition-all font-black text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <label className={`block text-slate-400 dark:text-slate-500 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {isRTL ? 'التصنيف' : 'Category'}
                                </label>
                                <select
                                    value={metadata.category}
                                    onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full p-5 rounded-2xl bg-[#F9FBFC] dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0095D9]/10 transition-all font-black text-slate-800 dark:text-slate-200 appearance-none cursor-pointer"
                                >
                                    <option value="Health" className="dark:bg-slate-800">{isRTL ? 'صحي' : 'Health'}</option>
                                    <option value="Psychology" className="dark:bg-slate-800">{isRTL ? 'نفسي' : 'Psychology'}</option>
                                    <option value="Lifestyle" className="dark:bg-slate-800">{isRTL ? 'نمط حياة' : 'Lifestyle'}</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className={`block text-slate-400 dark:text-slate-500 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {isRTL ? 'الوقت المقدر' : 'Estimated Time'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={metadata.estimated_time}
                                        onChange={(e) => setMetadata(prev => ({ ...prev, estimated_time: parseInt(e.target.value) || 0 }))}
                                        placeholder="15"
                                        className="w-full p-5 rounded-2xl bg-[#F9FBFC] dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0095D9]/10 focus:border-[#0095D9]/20 transition-all font-black text-slate-800 dark:text-slate-200"
                                    />
                                    <span className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-5' : 'right-5'} text-slate-400 dark:text-slate-500 font-bold text-sm`}>
                                        {isRTL ? 'دقيقة' : 'mins'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className={`block text-slate-400 dark:text-slate-500 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {isRTL ? 'الحالة' : 'Status'}
                                </label>
                                <div className="flex bg-[#F9FBFC] dark:bg-slate-900/50 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-700">
                                    <button
                                        onClick={() => setMetadata(prev => ({ ...prev, is_active: true }))}
                                        className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${metadata.is_active ? 'bg-white dark:bg-slate-800 text-[#0095D9] dark:text-[#4AA0BA] shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                    >
                                        {isRTL ? 'نشط' : 'Active'}
                                    </button>
                                    <button
                                        onClick={() => setMetadata(prev => ({ ...prev, is_active: false }))}
                                        className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${!metadata.is_active ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                    >
                                        {isRTL ? 'غير نشط' : 'Inactive'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className={`block text-slate-400 dark:text-slate-500 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                {isRTL ? 'وصف التقييم' : 'Description'}
                            </label>
                            <textarea
                                value={metadata.description}
                                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                                placeholder={isRTL ? 'اكتب وصفاً للتقييم...' : 'Write assessment description...'}
                                className="w-full min-h-[100px] p-6 rounded-3xl bg-[#F9FBFC] dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0095D9]/10 transition-all resize-none font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Add Question Form */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm space-y-8 transition-colors duration-300">
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className={`flex items-center gap-3 text-[#35788D] dark:text-[#4AA0BA] ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                <HelpCircle size={24} />
                                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 transition-colors duration-300">{isRTL ? 'إضافة سؤال للتقييم' : 'Add Question To Assessment'}</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="block text-slate-400 dark:text-slate-500 font-bold text-sm">{isRTL ? 'نص السؤال' : 'Question Text'}</label>
                                    <textarea
                                        value={currentQuestion.question}
                                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                                        placeholder={isRTL ? 'اكتب السؤال هنا...' : 'Write question here...'}
                                        className="w-full min-h-[150px] p-6 rounded-3xl bg-[#F9FBFC] dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0095D9]/10 transition-all resize-none font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="block text-slate-400 dark:text-slate-500 font-bold text-sm tracking-wide">{isRTL ? 'التصنيف' : 'Category'}</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCurrentQuestion(prev => ({ ...prev, category: cat.id }))}
                                                className={`group p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between font-black ${currentQuestion.category === cat.id
                                                    ? 'border-[#0095D9] bg-[#0095D9]/5 dark:bg-[#0095D9]/10 text-[#0095D9] dark:text-[#4AA0BA] shadow-sm'
                                                    : 'border-slate-50 dark:border-slate-700 bg-[#F9FBFC] dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentQuestion.category === cat.id ? 'bg-[#0095D9] dark:bg-[#4AA0BA] scale-125' : 'bg-slate-200 dark:bg-slate-600'}`} />
                                                    <span>{cat.label}</span>
                                                </div>
                                                {currentQuestion.category === cat.id && <CheckCircle2 size={18} className="animate-in zoom-in duration-300" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Answers for Current Question */}
                        <div className="space-y-6">
                            <div className={`flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`flex items-center gap-3 text-[#35788D] dark:text-[#4AA0BA] ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <LayoutList size={22} />
                                    <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 transition-colors duration-300">{isRTL ? 'خيارات الإجابة' : 'Answer Choices'}</h3>
                                </div>
                                <button
                                    onClick={handleAddAnswer}
                                    className="flex items-center gap-2 text-[#0095D9] dark:text-[#4AA0BA] font-black text-sm hover:opacity-80 transition-opacity"
                                >
                                    <Plus size={18} />
                                    {isRTL ? 'إضافة خيار' : 'Add Choice'}
                                </button>
                            </div>

                            <div className="space-y-3">
                                {currentQuestion.answers.length === 0 ? (
                                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <p className="text-slate-400 dark:text-slate-500 font-bold text-sm">{isRTL ? 'لم يتم إضافة خيارات بعد' : 'No choices added yet'}</p>
                                    </div>
                                ) : (
                                    currentQuestion.answers.map((ans, idx) => (
                                        <div key={ans.id} className={`flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <span className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700">{idx + 1}</span>
                                            <input
                                                type="text"
                                                value={ans.text}
                                                onChange={(e) => handleUpdateAnswer(ans.id, { text: e.target.value })}
                                                placeholder={isRTL ? 'نص الخيار...' : 'Choice text...'}
                                                className="flex-1 bg-transparent outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-slate-400 dark:text-slate-500">{isRTL ? 'النسبة' : 'Percentage (%)'}</span>
                                                <input
                                                    type="number"
                                                    value={ans.points}
                                                    onChange={(e) => handleUpdateAnswer(ans.id, { points: parseInt(e.target.value) || 0 })}
                                                    className="w-16 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center font-black text-[#35788D] dark:text-[#4AA0BA] outline-none focus:ring-2 focus:ring-[#0095D9]/10"
                                                />
                                            </div>
                                            <button onClick={() => handleRemoveAnswer(ans.id)} className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {currentQuestion.answers.length > 0 && (
                                <div className={`p-4 rounded-2xl flex items-center justify-between ${currentQuestion.answers.reduce((sum, a) => sum + a.points, 0) === 100 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'} transition-all`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${currentQuestion.answers.reduce((sum, a) => sum + a.points, 0) === 100 ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                        <span className="text-xs font-black uppercase tracking-wider">{isRTL ? 'إجمالي النسب' : 'Total Percentage'}</span>
                                    </div>
                                    <span className="text-xl font-black">{currentQuestion.answers.reduce((sum, a) => sum + a.points, 0)}%</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleAddQuestionToList}
                            className="w-full py-5 rounded-[1.5rem] bg-[#35788D]/10 text-[#35788D] dark:text-[#4AA0BA] font-black border-2 border-dashed border-[#35788D]/20 dark:border-[#4AA0BA]/20 hover:bg-[#35788D]/20 dark:hover:bg-[#4AA0BA]/20 hover:border-[#35788D]/30 dark:hover:border-[#4AA0BA]/30 transition-all flex items-center justify-center gap-3">
                            <Plus size={22} />
                            {isRTL ? 'إضافة السؤال للقائمة' : 'Add Question To List'}
                        </button>
                    </div>
                </div>

                {/* Right Side: Questions Queue */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 space-y-6 sticky top-10 overflow-hidden transition-colors duration-300">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0095D9]/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                        <div className={`flex items-center gap-4 relative z-10 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-[#0095D9] dark:text-sky-400 shadow-sm">
                                <LayoutList size={22} />
                            </div>
                            <div className={isRTL ? 'text-right' : 'text-left'}>
                                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 transition-colors duration-300">{isRTL ? 'قائمة الأسئلة' : 'Questions Queue'}</h2>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">
                                    {isRTL ? `${questions.length} أسئلة مضافة` : `${questions.length} Questions Added`}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar relative z-10 py-2">
                            {questions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-slate-200 dark:text-slate-700 animate-pulse">
                                        <AlertCircle size={40} />
                                    </div>
                                    <p className="font-black text-slate-400 dark:text-slate-500 text-lg mb-1">{isRTL ? 'المسودة فارغة' : 'Draft is empty'}</p>
                                    <p className="text-xs font-bold text-slate-300 dark:text-slate-600 max-w-[200px] leading-relaxed">
                                        {isRTL ? 'ابدأ بإضافة أول سؤال لنماذج هذا التقييم' : 'Start by adding your first question to this assessment draft'}
                                    </p>
                                </div>
                            ) : (
                                questions.map((q, idx) => (
                                    <div key={q.id} className="group bg-[#F4F9FB]/60 dark:bg-slate-900/50 border border-[#E0F2F7] dark:border-slate-700 p-5 rounded-3xl hover:bg-white dark:hover:bg-slate-800 hover:border-[#0095D9]/30 dark:hover:border-[#0095D9]/50 hover:shadow-lg hover:shadow-sky-50 dark:hover:shadow-slate-900/50 transition-all duration-300 relative">
                                        <div className={`flex justify-between items-start mb-3 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-black text-xs text-[#0095D9] dark:text-[#4AA0BA] shadow-sm">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-[9px] font-black px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full border border-slate-100 dark:border-slate-700 uppercase tracking-tighter">
                                                    {q.category}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveQuestion(q.id)}
                                                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-rose-400 hover:text-white hover:bg-rose-500 flex items-center justify-center transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <p className={`font-bold text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-3 line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {q.question}
                                        </p>
                                        <div className={`flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-black ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500" />
                                            <span>{q.answers.length} {isRTL ? 'خيارات متاحة' : 'Options defined'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {questions.length > 0 && (
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center gap-6 relative z-10 transition-colors duration-300">
                                <div className="flex justify-between w-full items-center">
                                    <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'إجمالي الأسئلة' : 'Total Questions'}</span>
                                    <span className="text-lg font-black text-slate-800 dark:text-slate-100">{questions.length}</span>
                                </div>
                                <button
                                    onClick={handleFinalSave}
                                    className="w-full py-5 rounded-[1.5rem] bg-linear-to-r from-[#0095D9] to-sky-400 text-white font-black hover:shadow-xl hover:shadow-[#0095D9]/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3"
                                >
                                    <Save size={20} />
                                    {isRTL ? 'إصدار التقييم الآن' : 'Publish Assessment'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
