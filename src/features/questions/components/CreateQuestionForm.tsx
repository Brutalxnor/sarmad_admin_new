import { useState } from 'react'
import { useCreateQuestion, useUpdateQuestion, useUpdateAnswer } from '../hooks/use-questions'
import type { Question } from '../types/question.types'
import { useLanguage } from '@/shared/context/LanguageContext'

import { HelpCircle, Hash, Info, Plus, Trash2 } from 'lucide-react'

interface QuestionFormProps {
    onSuccess?: () => void
    initialData?: Question | null
    defaultVersion?: number
    isActualVersion?: boolean
}

export function CreateQuestionForm({ onSuccess, initialData, defaultVersion, isActualVersion }: QuestionFormProps) {
    const [question, setQuestion] = useState(initialData?.question || '')
    const [category, setCategory] = useState(initialData?.category || '')
    const [assessVersion] = useState<number | undefined>(() => {
        const val = initialData?.assess_version ?? defaultVersion
        if (val === null || val === undefined) return undefined
        return Number(val)
    })
    const [inAssessment] = useState<boolean>(() => {
        if (initialData?.in_assessment !== undefined && initialData?.in_assessment !== null) {
            return !!initialData.in_assessment
        }
        return defaultVersion !== undefined ? true : false
    })
    const [actualAssess] = useState<boolean>(initialData?.actual_assess ?? !!isActualVersion)
    const [answers, setAnswers] = useState<{ id?: string; answer: string; percentage: number }[]>(
        initialData?.answers?.map((a) => ({
            id: a.id,
            answer: a.answer,
            percentage: a.percentage
        })) || []
    )
    const { t, language } = useLanguage()

    const createQuestion = useCreateQuestion()
    const updateQuestion = useUpdateQuestion()
    const updateAnswerMutation = useUpdateAnswer()

    const isPending = createQuestion.isPending || updateQuestion.isPending || updateAnswerMutation.isPending

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!question.trim()) return

        const dto = {
            question,
            category: category || undefined,
            assess_version: assessVersion !== undefined ? Number(assessVersion) : undefined,
            in_assessment: Boolean(inAssessment),
            actual_assess: Boolean(actualAssess),
            answers,
        }

        if (initialData) {
            // 1. Update question fields (answers are excluded in the hook)
            await updateQuestion.mutateAsync({
                id: initialData.id,
                data: dto
            })

            // 2. Update existing answers
            const answerUpdates = answers
                .filter(ans => ans.id)
                .map(ans => updateAnswerMutation.mutateAsync({
                    id: ans.id!,
                    data: {
                        answer: ans.answer,
                        percentage: ans.percentage,
                        question_id: initialData.id
                    }
                }))

            await Promise.all(answerUpdates)
        } else {
            await createQuestion.mutateAsync(dto)
        }

        if (!initialData) {
            // Only clear form on create
            setQuestion('')
            setCategory('')
            setAnswers([])
        }

        if (onSuccess) {
            onSuccess()
        }
    }

    const addAnswer = () => {
        setAnswers([...answers, { answer: '', percentage: 0 }])
    }

    const removeAnswer = (index: number) => {
        setAnswers(answers.filter((_, i) => i !== index))
    }

    const updateAnswer = (index: number, field: 'answer' | 'percentage', value: string | number) => {
        const newAnswers = [...answers]
        if (field === 'percentage') {
            newAnswers[index][field] = Number(value)
        } else {
            newAnswers[index][field] = value as string
        }
        setAnswers(newAnswers)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Question */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                        <HelpCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800">{language === 'ar' ? 'السؤال' : 'Question'}</h3>
                        <p className="text-xs font-bold text-slate-400">{language === 'ar' ? 'أدخل نص السؤال بوضوح' : 'Enter the question text clearly'}</p>
                    </div>
                </div>

                <div className="relative group">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className={`w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-500/20 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300`}
                        placeholder={t('questions.form.question_placeholder')}
                        required
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                </div>
            </div>

            {/* Section 2: Answers */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">{language === 'ar' ? 'الإجابات' : 'Answers'}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                    {language === 'ar' ? `إجمالي الإجابات: ${answers.length}` : `Total Answers: ${answers.length}`}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={addAnswer}
                        className="group flex items-center gap-2 px-6 py-3 text-sm font-black text-white bg-brand-500 hover:bg-brand-600 rounded-2xl transition-all duration-300 shadow-lg shadow-brand-500/20 hover:-translate-y-0.5"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        <span>{language === 'ar' ? "إضافة إجابة" : "Add Answer"}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {answers.map((ans, index) => (
                        <div key={index} className="group p-5 bg-slate-50/50 border border-slate-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200 relative">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">
                                    {language === 'ar' ? `الخيار #${index + 1}` : `Option #${index + 1}`}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeAnswer(index)}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-tighter">
                                        {language === 'ar' ? 'نص الإجابة' : 'Answer Text'}
                                    </label>
                                    <input
                                        type="text"
                                        value={ans.answer}
                                        onChange={(e) => updateAnswer(index, 'answer', e.target.value)}
                                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none transition-all duration-200 text-right font-black text-slate-700 shadow-xs"
                                        placeholder={t('questions.col.answers')}
                                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                                        required
                                    />
                                </div>
                                <div className="md:w-32">
                                    <label className="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-tighter">
                                        {language === 'ar' ? 'النسبة %' : 'Weight %'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={ans.percentage}
                                            onChange={(e) => updateAnswer(index, 'percentage', e.target.value)}
                                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none transition-all duration-200 text-center font-black text-slate-700 shadow-xs"
                                            placeholder="0"
                                            min="0"
                                            max="100"
                                            required
                                        />
                                        <span className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none font-black`}>%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* Section 4: Category */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                        <Hash size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800">{language === 'ar' ? 'فئة السؤال' : 'Category'}</h3>
                        <p className="text-xs font-bold text-slate-400">{language === 'ar' ? 'تصنيف السؤال (أرق، تنفس، إلخ)' : 'Question classification'}</p>
                    </div>
                </div>

                <div className="relative group">
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-500/20 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300`}
                        placeholder={t('questions.form.category_placeholder')}
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-linear-to-r from-brand-600 to-brand-500 text-white px-6 py-4 rounded-xl hover:shadow-brand-500/40 hover:-translate-y-0.5 active:translate-y-0 focus:ring-4 focus:ring-brand-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-lg shadow-brand-500/30 text-lg flex justify-center items-center gap-2"
                >
                    {isPending ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{initialData ? t('questions.form.updating') : t('questions.form.submitting')}...</span>
                        </>
                    ) : (
                        <span>{initialData ? t('questions.form.update') : t('questions.form.submit')}</span>
                    )}
                </button>
            </div>
        </form>
    )
}
