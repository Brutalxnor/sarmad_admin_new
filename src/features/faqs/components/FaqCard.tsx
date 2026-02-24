import { useState } from 'react'
import { useLanguage } from '@/shared/context/LanguageContext'
import type { FAQ } from '../types'

interface FaqCardProps {
    faq: FAQ;
    onDelete?: (id: string) => void;
    onToggleActive?: (id: string, currentStatus: boolean) => void;
}

export function FaqCard({ faq, onDelete, onToggleActive }: FaqCardProps) {
    const { language, t, direction } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)

    const question = language === 'ar' ? faq.question_ar : faq.question_en
    const answer = language === 'ar' ? faq.answer_ar : faq.answer_en

    return (
        <div className={`glass-panel overflow-hidden transition-all duration-300 hover:shadow-lg translate-y-0 hover:-translate-y-1 ${!faq.is_active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            <div
                className={`p-6 flex items-center justify-between cursor-pointer ${isOpen ? 'bg-brand-50/30' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex-1 flex items-center gap-4">
                    <div
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleActive?.(faq.id, faq.is_active)
                        }}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${faq.is_active ? 'bg-brand-500' : 'bg-slate-200'}`}
                        title={faq.is_active ? 'Active' : 'Inactive'}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${faq.is_active ? (direction === 'rtl' ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'}`} />
                    </div>
                    <h3 className={`text-lg font-bold text-slate-800 ${isOpen ? 'text-brand-700' : ''}`}>
                        {question}
                    </h3>
                    {!faq.is_active && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                            {direction === 'rtl' ? 'غير نشط' : 'Inactive'}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            if (onDelete) onDelete(faq.id)
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        title={t('common.delete')}
                    >
                        🗑️
                    </button>
                    <span className={`text-2xl transition-transform duration-300 transform ${isOpen ? 'rotate-180' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                </div>
            </div>

            {isOpen && (
                <div className="p-6 pt-0 animate-fade-in border-t border-slate-50 mt-2">
                    <p className={`text-slate-600 leading-relaxed whitespace-pre-line font-medium ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                        {answer}
                    </p>
                </div>
            )}
        </div>
    )
}
