import { useState, useMemo } from 'react'
import { useQuestions, useDeleteQuestion, useToggleAssessmentStatus } from '../hooks/use-questions'
import type { Question } from '../types/question.types'
import { EditQuestionModal } from './EditQuestionModal'
import { ViewQuestionModal } from './ViewQuestionModal'
import { DeleteQuestionModal } from './DeleteQuestionModal'
import { useLanguage } from '@/shared/context/LanguageContext'

// Icons
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
)

const ViewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
)

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
)

interface QuestionTableProps {
    versionFilter?: number
}

export function QuestionTable({ versionFilter }: QuestionTableProps) {
    const { data, isLoading, error } = useQuestions()
    const deleteQuestion = useDeleteQuestion()
    const toggleAssessmentStatus = useToggleAssessmentStatus()
    const { t, language } = useLanguage()

    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
    const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleToggleAssessment = async (id: string, currentStatus: boolean) => {
        await toggleAssessmentStatus.mutateAsync({ id, in_assessment: !currentStatus })
    }

    const allQuestions = useMemo(() => data?.data || [], [data?.data])

    const questions = useMemo(() => {
        const filtered = versionFilter !== undefined
            ? allQuestions.filter(q => Number(q.assess_version) === versionFilter)
            : allQuestions

        // Stable sort by creation date descending
        return [...filtered].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }, [allQuestions, versionFilter])

    if (isLoading) return (
        <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
    )

    if (error) return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {t('questions.error')} {error.message}
        </div>
    )

    const handleDelete = async () => {
        if (!deletingId) return
        await deleteQuestion.mutateAsync(deletingId)
        setDeletingId(null)
    }

    if (questions.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-500">
                {t('questions.empty')}
            </div>
        )
    }

    return (
        <>
            <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-sm text-center">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                            <th className="p-4 border-b text-start">{t('questions.col.question')}</th>
                            <th className="p-4 border-b text-start">{t('questions.col.category')}</th>
                            <th className="p-4 border-b text-start">{t('questions.col.answers')}</th>
                            <th className="p-4 border-b text-center">In Assessment</th>
                            <th className="p-4 border-b text-start">{t('questions.col.date')}</th>
                            <th className="p-4 border-b text-center">{t('questions.col.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {questions.map((question: Question) => (
                            <tr
                                key={question.id}
                                onClick={() => setViewingQuestion(question)}
                                className="hover:bg-brand-50/30 transition-colors cursor-pointer"
                            >
                                <td className="p-4 font-medium text-gray-900 line-clamp-2 max-w-[300px] mx-auto">{question.question}</td>
                                <td className="p-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                                        {question.category || t('questions.category_default')}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500">{question.answers?.length || 0}</td>
                                <td
                                    className="p-4"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => handleToggleAssessment(question.id, question.in_assessment || false)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-inner ${question.in_assessment
                                                ? 'bg-brand-600 ring-2 ring-brand-100'
                                                : 'bg-slate-200'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${question.in_assessment ? '-translate-x-6' : '-translate-x-1'
                                                    }`}
                                                style={{ transitionTimingFunction: 'var(--transition-spring)' }}
                                            />
                                        </button>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-500 [direction:ltr]">
                                    {new Date(question.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                </td>
                                <td
                                    className="p-4 flex gap-2 justify-center"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => setViewingQuestion(question)}
                                        className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                                        title={t('questions.actions.view') || "عرض التفاصيل"}
                                    >
                                        <ViewIcon />
                                    </button>
                                    <button
                                        onClick={() => setEditingQuestion(question)}
                                        className="p-2 text-gray-400 hover:text-brand-700 hover:bg-brand-100 rounded-lg transition-all"
                                        title={t('questions.actions.edit') || "تعديل"}
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        onClick={() => setDeletingId(question.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title={t('questions.actions.delete') || "حذف"}
                                    >
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <EditQuestionModal
                isOpen={!!editingQuestion}
                onClose={() => setEditingQuestion(null)}
                question={editingQuestion}
            />

            <ViewQuestionModal
                isOpen={!!viewingQuestion}
                onClose={() => setViewingQuestion(null)}
                question={viewingQuestion}
            />

            <DeleteQuestionModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                isPending={deleteQuestion.isPending}
            />
        </>
    )
}
