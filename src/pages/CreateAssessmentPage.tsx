import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useCreateQuestion } from '@/features/questions/hooks/use-questions'
import {
    ChevronRight,
    ChevronLeft,
    Save,
    Plus,
    Trash2,
    HelpCircle,
    CheckCircle2,
    LayoutList,
    Tag,
    FileText,
    AlertCircle
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
    const isRTL = direction === 'rtl'

    // Assessment overall state
    const [version, setVersion] = useState('')
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
        if (questions.length === 0) {
            toast.error(isRTL ? 'يجب إضافة سؤال واحد على الأقل لإنشاء التقييم' : 'Must add at least one question to create assessment')
            return
        }

        const toastId = toast.loading(isRTL ? 'جاري إنشاء التقييم...' : 'Creating assessment...')
        try {
            for (const q of questions) {
                await createQuestion.mutateAsync({
                    question: q.question,
                    category: q.category,
                    assess_version: version as any,
                    answers: q.answers.map(a => ({
                        answer: a.text,
                        percentage: a.points
                    })),
                    in_assessment: true
                })
            }
            toast.success(isRTL ? 'تم إنشاء التقييم بنجاح' : 'Assessment created successfully', { id: toastId })
            navigate('/assessments')
        } catch (error) {
            console.error(error)
            toast.error(isRTL ? 'فشل في إنشاء التقييم' : 'Failed to create assessment', { id: toastId })
        }
    }

    const categories = [
        { id: 'Intro', label: isRTL ? 'أسئلة تمهيدية' : 'Intro Questions' },
        { id: 'Physical', label: isRTL ? 'الأعراض الجسدية' : 'Physical Symptoms' },
        { id: 'Habits', label: isRTL ? 'العادات اليومية' : 'Daily Habits' },
    ]

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-10 bg-[#F9FBFC] min-h-screen space-y-10 animate-fade-in" dir={direction}>
            {/* Header */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={isRTL ? 'text-start' : 'text-end'}>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
                        {isRTL ? 'إضافة تقييم جديد' : 'Add New Assessment'}
                    </h1>
                    <p className="text-slate-400 font-bold">
                        {isRTL ? 'قم بإنشاء نسخة تقييم جديدة وإضافة الأسئلة الخاصة بها' : 'Create a new assessment version and add its questions'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/assessments')}
                        className="px-8 py-3.5 rounded-2xl bg-white border border-gray-100 text-slate-400 font-black hover:bg-gray-50 transition-all shadow-sm"
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Version & New Question Form */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Version Input */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <div className={`flex items-center gap-3 text-sky-500 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                            <FileText size={24} />
                            <h2 className="text-xl font-black">{isRTL ? 'بيانات التقييم' : 'Assessment Info'}</h2>
                        </div>
                        <div className="space-y-4">
                            <label className={`block text-slate-400 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                {isRTL ? 'رقم الإصدار' : 'Version Number'}
                            </label>
                            <input
                                type="text"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                placeholder={isRTL ? 'مثال: v2.5' : 'e.g. v2.5'}
                                className="w-full p-5 rounded-2xl bg-[#F9FBFC] border border-gray-100 outline-none focus:ring-2 focus:ring-[#0095D9]/10 focus:border-[#0095D9]/20 transition-all font-black text-slate-800"
                            />
                        </div>
                    </div>

                    {/* Add Question Form */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className={`flex items-center gap-3 text-[#35788D] ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                <HelpCircle size={24} />
                                <h2 className="text-xl font-black">{isRTL ? 'إضافة سؤال للتقييم' : 'Add Question To Assessment'}</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="block text-slate-400 font-bold text-sm">{isRTL ? 'نص السؤال' : 'Question Text'}</label>
                                    <textarea
                                        value={currentQuestion.question}
                                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                                        placeholder={isRTL ? 'اكتب السؤال هنا...' : 'Write question here...'}
                                        className="w-full min-h-[150px] p-6 rounded-3xl bg-[#F9FBFC] border border-gray-100 outline-none focus:ring-2 focus:ring-[#0095D9]/10 transition-all resize-none font-bold text-slate-800"
                                    />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="block text-slate-400 font-bold text-sm">{isRTL ? 'التصنيف' : 'Category'}</label>
                                    <div className="space-y-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setCurrentQuestion(prev => ({ ...prev, category: cat.id }))}
                                                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between font-black ${currentQuestion.category === cat.id
                                                    ? 'border-[#35788D] bg-[#35788D]/5 text-[#35788D]'
                                                    : 'border-slate-50 bg-[#F9FBFC] text-slate-400 hover:border-slate-100'
                                                    }`}
                                            >
                                                <span>{cat.label}</span>
                                                {currentQuestion.category === cat.id && <CheckCircle2 size={18} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Answers for Current Question */}
                        <div className="space-y-6">
                            <div className={`flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`flex items-center gap-3 text-[#35788D] ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <LayoutList size={22} />
                                    <h3 className="font-black text-lg">{isRTL ? 'خيارات الإجابة' : 'Answer Choices'}</h3>
                                </div>
                                <button
                                    onClick={handleAddAnswer}
                                    className="flex items-center gap-2 text-[#0095D9] font-black text-sm hover:opacity-80 transition-opacity"
                                >
                                    <Plus size={18} />
                                    {isRTL ? 'إضافة خيار' : 'Add Choice'}
                                </button>
                            </div>

                            <div className="space-y-3">
                                {currentQuestion.answers.length === 0 ? (
                                    <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-slate-400 font-bold text-sm">{isRTL ? 'لم يتم إضافة خيارات بعد' : 'No choices added yet'}</p>
                                    </div>
                                ) : (
                                    currentQuestion.answers.map((ans, idx) => (
                                        <div key={ans.id} className={`flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-xs text-slate-400 border border-slate-100">{idx + 1}</span>
                                            <input
                                                type="text"
                                                value={ans.text}
                                                onChange={(e) => handleUpdateAnswer(ans.id, { text: e.target.value })}
                                                placeholder={isRTL ? 'نص الخيار...' : 'Choice text...'}
                                                className="flex-1 bg-transparent outline-none font-bold text-slate-700"
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-slate-400">{isRTL ? 'النسبة' : 'Percentage (%)'}</span>
                                                <input
                                                    type="number"
                                                    value={ans.points}
                                                    onChange={(e) => handleUpdateAnswer(ans.id, { points: parseInt(e.target.value) || 0 })}
                                                    className="w-16 p-2 rounded-lg bg-white border border-slate-100 text-center font-black text-[#35788D]"
                                                />
                                            </div>
                                            <button onClick={() => handleRemoveAnswer(ans.id)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleAddQuestionToList}
                            className="w-full py-5 rounded-[1.5rem] bg-[#35788D]/10 text-[#35788D] font-black border-2 border-dashed border-[#35788D]/20 hover:bg-[#35788D]/20 hover:border-[#35788D]/30 transition-all flex items-center justify-center gap-3">
                            <Plus size={22} />
                            {isRTL ? 'إضافة السؤال للقائمة' : 'Add Question To List'}
                        </button>
                    </div>
                </div>

                {/* Right Side: Questions Queue */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-800 p-8 rounded-[2.5rem] text-white shadow-xl space-y-6 sticky top-10">
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                            <LayoutList size={24} className="text-[#0095D9]" />
                            <h2 className="text-xl font-black">{isRTL ? 'قائمة الأسئلة' : 'Questions Queue'}</h2>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {questions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                                    <AlertCircle size={48} className="mb-4" />
                                    <p className="font-bold">{isRTL ? 'القائمة فارغة حالياً' : 'Queue is empty'}</p>
                                    <p className="text-xs">{isRTL ? 'يجب إضافة سؤال واحد على الأقل' : 'At least 1 question is required'}</p>
                                </div>
                            ) : (
                                questions.map((q, idx) => (
                                    <div key={q.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl group hover:bg-white/10 transition-all">
                                        <div className={`flex justify-between items-start mb-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <span className="text-[10px] font-black px-2 py-0.5 bg-[#0095D9]/20 text-[#0095D9] rounded-md uppercase">{q.category}</span>
                                            <button onClick={() => handleRemoveQuestion(q.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <p className={`font-bold text-sm line-clamp-2 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{q.question}</p>
                                        <div className={`flex items-center gap-2 text-[10px] text-white/40 font-black ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <span>{idx + 1}.</span>
                                            <span>{q.answers.length} {isRTL ? 'إجابة' : 'Answers'}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {questions.length > 0 && (
                            <div className="pt-6 border-t border-white/10 flex flex-col items-center gap-4">
                                <p className="text-sm font-bold text-white/60">
                                    {isRTL ? `المجموع: ${questions.length} سؤال` : `Summary: ${questions.length} Questions`}
                                </p>
                                <button
                                    onClick={handleFinalSave}
                                    className="w-full py-4 rounded-2xl bg-[#0095D9] text-white font-black hover:bg-[#0084c2] transition-all shadow-lg shadow-[#0095D9]/20"
                                >
                                    {isRTL ? 'إصدار التقييم الآن' : 'Publish Assessment Now'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
