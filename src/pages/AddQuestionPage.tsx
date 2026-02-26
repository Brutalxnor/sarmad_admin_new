import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
    Info
} from 'lucide-react'

interface AnswerOption {
    id: string
    text: string
    points: number
}

export default function AddQuestionPage() {
    const navigate = useNavigate()
    const { version } = useParams<{ version: string }>()
    const { direction, language } = useLanguage()
    const createQuestion = useCreateQuestion()
    const isRTL = direction === 'rtl'

    const [questionText, setQuestionText] = useState('')
    const [category, setCategory] = useState('Intro')
    const [answers, setAnswers] = useState<AnswerOption[]>([])

    const decodedVersion = version ? decodeURIComponent(version) : ''

    const handleAddOption = () => {
        const newId = Date.now().toString()
        setAnswers([...answers, { id: newId, text: '', points: 0 }])
    }

    const handleRemoveOption = (id: string) => {
        setAnswers(answers.filter(a => a.id !== id))
    }

    const handleUpdateOption = (id: string, updates: Partial<AnswerOption>) => {
        setAnswers(answers.map(a => a.id === id ? { ...a, ...updates } : a))
    }

    const handleSave = async () => {
        if (!questionText.trim()) {
            toast.error(isRTL ? 'يرجى إدخال نص السؤال' : 'Please enter question text')
            return
        }

        if (answers.length === 0) {
            toast.error(isRTL ? 'يرجى إضافة خيار واحد على الأقل' : 'Please add at least one answer option')
            return
        }

        // Check for empty answers
        if (answers.some(a => !a.text.trim())) {
            toast.error(isRTL ? 'يرجى ملء جميع خيارات الإجابة' : 'Please fill all answer options')
            return
        }

        // Check if total percentage is 100%
        const totalPercentage = answers.reduce((sum, a) => sum + a.points, 0)
        if (totalPercentage !== 100) {
            toast.error(isRTL
                ? `يجب أن يكون مجموع النسب 100%. المجموع الحالي: ${totalPercentage}%`
                : `Total percentage must be 100%. Current sum: ${totalPercentage}%`
            )
            return
        }

        const toastId = toast.loading(isRTL ? 'جاري الحفظ...' : 'Saving...')

        try {
            await createQuestion.mutateAsync({
                question: questionText,
                category: category,
                assess_version: decodedVersion as any, // Cast to any as DTO says number but backend accepts string
                answers: answers.map(a => ({
                    answer: a.text,
                    percentage: a.points
                })),
                in_assessment: true
            })

            toast.success(isRTL ? 'تم حفظ السؤال بنجاح' : 'Question saved successfully', { id: toastId })
            navigate(`/assessments/${version}/questions`)
        } catch (error) {
            console.error('Save error:', error)
            toast.error(isRTL ? 'فشل في حفظ السؤال' : 'Failed to save question', { id: toastId })
        }
    }

    const categories = [
        { id: 'Intro', label: isRTL ? 'أسئلة تمهيدية' : 'Intro Questions' },
        { id: 'Physical', label: isRTL ? 'الأعراض الجسدية' : 'Physical Symptoms' },
        { id: 'Habits', label: isRTL ? 'العادات اليومية' : 'Daily Habits' },
    ]

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-6 bg-[#F9FBFC] min-h-screen animate-fade-in" dir={direction}>
            {/* Breadcrumbs & Navigation */}
            <div className={`flex justify-between items-start mb-10 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`flex items-center gap-4 text-slate-400 font-bold text-sm ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="flex items-center gap-2">
                        {isRTL ? <ChevronRight size={18} className="text-slate-300" /> : <ChevronLeft size={18} className="text-slate-300" />}
                        <button
                            onClick={() => navigate(`/assessments/${version}/questions`)}
                            className="hover:text-[#35788D] transition-colors text-right"
                        >
                            {language === 'ar' ? 'العودة لعرض الأسئلة' : 'Back to Questions'}
                        </button>
                    </div>
                    <span className="opacity-30 text-lg">|</span>
                    <span className="text-slate-800 text-base">{language === 'ar' ? 'إضافة سؤال جديد' : 'Add New Question'}</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/assessments/${version}/questions`)}
                        className="px-12 py-4 rounded-[1.25rem] bg-white border border-gray-100 text-slate-400 font-black hover:bg-gray-50 transition-all shadow-sm"
                    >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={createQuestion.isPending}
                        className="px-10 py-4 rounded-[1.25rem] bg-[#0095D9] text-white font-black flex items-center gap-3 hover:bg-[#0084c2] transition-all shadow-lg shadow-[#0095D9]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={22} />
                        {language === 'ar' ? 'حفظ السؤال' : 'Save Question'}
                    </button>
                </div>
            </div>


            {/* Assessment Title Header */}
            <div className={`flex items-center gap-4 mb-12 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <h1 className="text-4xl font-black text-slate-800">
                        {language === 'ar' ? 'تقييم النوم الشامل' : 'Comprehensive Sleep Assessment'}
                    </h1>
                    <span className="bg-sky-50 text-sky-500 px-3 py-1 rounded-lg text-sm font-black">
                        {decodedVersion}
                    </span>
                </div>
            </div>

            {/* Additional Information Guide */}
            <div className="max-w-4xl mx-auto mb-10 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm animate-fade-in relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-0 opacity-50 transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <div className={`flex items-center gap-4 mb-8 relative z-10 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="w-12 h-12 rounded-2xl border-2 border-[#1EAD93]/20 bg-[#1EAD93]/5 text-[#1EAD93] flex items-center justify-center shrink-0">
                        <Info size={24} />
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h3 className="text-2xl font-black text-[#1E293B] mb-1">
                            {language === 'ar' ? 'معلومات إضافية' : 'Additional Information'}
                        </h3>
                        <p className="text-sm font-bold text-[#64748B]">
                            {language === 'ar' ? 'دليل توزيع النسب وتوجيه النتائج' : 'Guide for distribution of percentages and directing results'}
                        </p>
                    </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Card 1 (75% - 100%) */}
                    <div className="bg-white border-2 border-[#F3E8FF] rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:border-[#D8B4FE]">
                        <div className="bg-[#FAF5FF] text-[#7E22CE] font-black px-6 py-2.5 rounded-2xl text-sm mb-4 w-full tracking-wider">
                            100% - 75%
                        </div>
                        <div className="font-black text-[#4C1D95] text-lg mb-2">
                            {language === 'ar' ? 'أنماط الأرق' : 'Insomnia Patterns'}
                        </div>
                        <div className="text-xs font-bold text-[#9333EA]">
                            {language === 'ar' ? 'توصية ببرنامج CBT-I' : 'CBT-I Program Recommendation'}
                        </div>
                    </div>

                    {/* Card 2 (25% - 75%) */}
                    <div className="bg-white border-2 border-[#D1FAE5] rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:border-[#6EE7B7]">
                        <div className="bg-[#ECFDF5] text-[#047857] font-black px-6 py-2.5 rounded-2xl text-sm mb-4 w-full tracking-wider">
                            75% - 25%
                        </div>
                        <div className="font-black text-[#065F46] text-lg mb-2">
                            {language === 'ar' ? 'مخاطر منخفضة' : 'Low Risks'}
                        </div>
                        <div className="text-xs font-bold text-[#059669]">
                            {language === 'ar' ? 'خطة تعليمية + استشارة' : 'Educational Plan + Consultation'}
                        </div>
                    </div>

                    {/* Card 3 (< 25%) */}
                    <div className="bg-white border-2 border-[#F1F5F9] rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:border-[#CBD5E1]">
                        <div className="bg-[#F8FAFC] text-[#334155] font-black px-6 py-2.5 rounded-2xl text-sm mb-4 w-full tracking-wider">
                            {'< 25%'}
                        </div>
                        <div className="font-black text-[#1E293B] text-lg mb-2">
                            {language === 'ar' ? 'مخاطر ضئيلة' : 'Minor Risks'}
                        </div>
                        <div className="text-xs font-bold text-[#64748B]">
                            {language === 'ar' ? 'متابعة المحتوى التعليمي العام' : 'Follow up General Educational Content'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-10 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Question Content Section */}
                    <div className="space-y-6">
                        <div className={`flex items-center gap-3 text-[#35788D] ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                            <HelpCircle size={24} />
                            <h2 className="text-xl font-black">{language === 'ar' ? 'محتوى السؤال' : 'Question Content'}</h2>
                        </div>

                        <div className="space-y-4">
                            <label className={`block text-slate-400 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                {language === 'ar' ? 'نص السؤال (باللغة العربية)' : 'Question Text (Arabic)'}
                            </label>
                            <textarea
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                placeholder={language === 'ar' ? 'اكتب السؤال هنا ....' : 'Write the question here ....'}
                                className="w-full min-h-[180px] p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-[#0095D9]/10 focus:border-[#0095D9]/20 transition-all resize-none font-bold text-slate-800 text-lg"
                            />
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-6">
                        <div className={`flex items-center gap-3 text-[#35788D] ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                            <Tag size={24} />
                            <h2 className="text-xl font-black">{language === 'ar' ? 'التصنيف' : 'Category'}</h2>
                        </div>

                        <div className="space-y-4">
                            <label className={`block text-slate-400 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                {language === 'ar' ? 'اختر تصنيف السؤال' : 'Select Question Category'}
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        className={`p-5 rounded-2xl border-2 transition-all text-right font-black flex items-center justify-between ${category === cat.id
                                            ? 'border-[#35788D] bg-[#35788D]/5 text-[#35788D]'
                                            : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        <span>{cat.label}</span>
                                        {category === cat.id && <CheckCircle2 size={20} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Answer Options Section */}
                <div className="space-y-6">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`flex items-center gap-3 text-[#35788D] ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                            <LayoutList size={24} />
                            <h2 className="text-xl font-black">{language === 'ar' ? 'خيارات الإجابة و الأوزان' : 'Answer Options & Weights'}</h2>
                        </div>
                        <button
                            onClick={handleAddOption}
                            className="flex items-center gap-2 text-[#0095D9] font-black hover:opacity-80 transition-opacity"
                        >
                            <Plus size={20} />
                            {language === 'ar' ? 'إضافة خيار جديد' : 'Add new option'}
                        </button>
                    </div>

                    <div className="bg-[#F4F9FB]/50 rounded-[2.5rem] p-8 border border-sky-100/30 space-y-4 min-h-[100px] flex flex-col justify-center">
                        {answers.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-400 font-bold italic">
                                    {isRTL ? 'لم يتم إضافة خيارات بعد. اضغط على "إضافة خيار جديد" للبدء.' : 'No options added yet. Click "Add new option" to start.'}
                                </p>
                            </div>
                        ) : (
                            answers.map((answer, index) => (
                                <div
                                    key={answer.id}
                                    className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-6 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}
                                >
                                    {/* Option Number */}
                                    <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 font-black text-sm shrink-0">
                                        {index + 1}
                                    </div>

                                    {/* Option Text Input */}
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={answer.text}
                                            onChange={(e) => handleUpdateOption(answer.id, { text: e.target.value })}
                                            placeholder={language === 'ar' ? 'أدخل نص الخيار' : 'Enter option text'}
                                            className="w-full bg-transparent outline-none font-black text-slate-700 placeholder:text-slate-200"
                                        />
                                    </div>

                                    {/* Points Input */}
                                    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <span className="text-slate-800 font-black text-sm whitespace-nowrap">
                                            {language === 'ar' ? 'النسبة' : 'Percentage'} (%)
                                        </span>
                                        <input
                                            type="number"
                                            value={answer.points}
                                            onChange={(e) => handleUpdateOption(answer.id, { points: parseInt(e.target.value) || 0 })}
                                            className="w-20 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-center font-black text-[#35788D] focus:ring-2 focus:ring-[#35788D]/10 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleRemoveOption(answer.id)}
                                        className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all shrink-0"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}



