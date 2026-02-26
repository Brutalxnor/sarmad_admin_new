import { Modal } from './Modal'
import type { Question } from '../types/question.types'
import { useLanguage } from '@/shared/context/LanguageContext'

interface ViewQuestionModalProps {
    question: Question | null
    isOpen: boolean
    onClose: () => void
}

export function ViewQuestionModal({ question, isOpen, onClose }: ViewQuestionModalProps) {
    const { t, language, direction } = useLanguage()
    if (!question) return null

    const isRTL = direction === 'rtl'

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={language === 'ar' ? 'تفاصيل السؤال' : 'Question Details'}
        >
            <div className={`space-y-8 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {/* Question Text */}
                <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {t('questions.form.question_label')}
                    </h4>
                    <p className="text-xl font-black text-slate-800 dark:text-slate-100 bg-[#F4F9FB] dark:bg-slate-700/50 p-6 rounded-[1.5rem] border border-slate-100/50 dark:border-slate-600 shadow-inner leading-relaxed transition-colors duration-300">
                        {question.question}
                    </p>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {t('questions.col.category')}
                        </h4>
                        <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-black bg-[#E0F2F7] dark:bg-[#4AA0BA]/10 text-[#35788D] dark:text-[#4AA0BA] border border-[#35788D]/10 dark:border-[#4AA0BA]/20">
                            {question.category || (language === 'ar' ? 'عام' : 'General')}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {t('questions.col.date')}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 font-bold py-2">
                            {new Date(question.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* Options Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {t('questions.col.answers')}
                        </h4>
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-3 py-1 rounded-full text-[10px] font-black">
                            {question.answers?.length || 0}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {question.answers?.map((ans, idx) => (
                            <div
                                key={ans.id || idx}
                                className={`flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-[#35788D]/20 dark:hover:border-[#4AA0BA]/30 hover:shadow-sm transition-all duration-300 group ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#F4F9FB] dark:bg-slate-700/50 flex items-center justify-center text-[#35788D] dark:text-[#4AA0BA] font-black text-sm">
                                        {idx + 1}
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-200 font-bold text-lg">{ans.answer}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-24 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                                        <div
                                            className="h-full bg-[#0095D9] dark:bg-[#4AA0BA] transition-all duration-1000"
                                            style={{ width: `${ans.percentage}%` }}
                                        />
                                    </div>
                                    <span className="bg-[#E0F2F7] dark:bg-[#4AA0BA]/10 text-[#35788D] dark:text-[#4AA0BA] px-3 py-1.5 rounded-xl text-sm font-black min-w-[3.5rem] text-center">
                                        {ans.percentage}%
                                    </span>
                                </div>
                            </div>
                        ))}
                        {(!question.answers || question.answers.length === 0) && (
                            <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-700">
                                <p className="text-slate-300 dark:text-slate-500 font-bold italic">
                                    {language === 'ar' ? 'لا توجد إجابات مضافة' : 'No answers added yet'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    )
}
