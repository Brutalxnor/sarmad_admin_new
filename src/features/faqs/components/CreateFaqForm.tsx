import { useState } from 'react'
import { useFaqs } from '../hooks/use-faqs'
import { useLanguage } from '@/shared/context/LanguageContext'
import type { FAQ } from '../types'
import { Save, FileText } from 'lucide-react'
import { FilterSelector } from '@/shared/components/FilterSelector'

interface CreateFaqFormProps {
    onSuccess?: () => void
    onCancel?: () => void
    initialData?: Partial<FAQ>
}

export function CreateFaqForm({ onSuccess, onCancel, initialData }: CreateFaqFormProps) {
    const { direction } = useLanguage()
    const isRTL = direction === 'rtl'
    const { createFaq, updateFaq, isCreating, isUpdating } = useFaqs()

    const [formData, setFormData] = useState<Partial<FAQ>>({
        question_en: '',
        question_ar: '',
        answer_en: '',
        answer_ar: '',
        category: '',
        display_order: 0,
        is_active: true,
        ...initialData
    })

    const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(
        initialData?.category ? [initialData.category] : []
    )

    const [accessType, setAccessType] = useState<'public' | 'members'>('public')

    const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
        e.preventDefault()
        try {
            const submitData = {
                ...formData,
                category: selectedTopicIds[0] || '',
                is_active: !asDraft
            }

            if (formData.id) {
                await updateFaq({ id: formData.id, data: submitData })
            } else {
                await createFaq(submitData)
            }
            onSuccess?.()
        } catch (error) {
            console.error('Failed to save FAQ:', error)
        }
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main content — question & answer (first in DOM = RIGHT in RTL) */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900/50 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 space-y-6 transition-colors duration-300">

                    {/* Arabic Question */}
                    <div className="space-y-2">
                        <label className={`text-base font-black text-slate-800 dark:text-slate-200 block transition-colors duration-300 ${isRTL ? 'text-start' : 'text-end'}`}>
                            {isRTL ? 'السؤال (باللغة العربية)' : 'Question (Arabic)'}
                        </label>
                        <input
                            type="text"
                            dir="rtl"
                            value={formData.question_ar || ''}
                            onChange={e => setFormData(prev => ({ ...prev, question_ar: e.target.value }))}
                            placeholder={isRTL ? 'اكتب السؤال باللغة العربية...' : 'Write the question in Arabic...'}
                            className="w-full bg-[#F4F9FB]/50 dark:bg-slate-900/50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-[#35788D]/20 dark:focus:ring-[#4AA0BA]/20 transition-all text-start outline-none"
                        />
                    </div>

                    {/* English Question */}
                    <div className="space-y-2">
                        <label className={`text-base font-black text-slate-800 dark:text-slate-200 block transition-colors duration-300 ${isRTL ? 'text-start' : 'text-end'}`}>
                            {isRTL ? 'السؤال (باللغة الإنجليزية)' : 'Question (English)'}
                        </label>
                        <input
                            type="text"
                            value={formData.question_en || ''}
                            onChange={e => setFormData(prev => ({ ...prev, question_en: e.target.value }))}
                            placeholder={isRTL ? 'اكتب السؤال باللغة الإنجليزية...' : 'Write the question in English...'}
                            className={`w-full bg-[#F4F9FB]/50 dark:bg-slate-900/50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-[#35788D]/20 dark:focus:ring-[#4AA0BA]/20 transition-all outline-none ${isRTL ? 'text-start' : 'text-left'}`}
                            dir={isRTL && !formData.question_en ? 'rtl' : 'ltr'}
                        />
                    </div>

                    {/* Rich Text Answer */}
                    {/* Arabic Answer */}
                    <div className="space-y-2">
                        <label className={`text-base font-black text-slate-800 dark:text-slate-200 block transition-colors duration-300 ${isRTL ? 'text-start' : 'text-end'}`}>
                            {isRTL ? 'الإجابة (باللغة العربية)' : 'Answer (Arabic)'}
                        </label>
                        <textarea
                            dir="rtl"
                            rows={6}
                            value={formData.answer_ar || ''}
                            onChange={e => setFormData(prev => ({ ...prev, answer_ar: e.target.value }))}
                            placeholder={isRTL ? 'اكتب الإجابة باللغة العربية...' : 'Write the answer in Arabic...'}
                            className={`w-full bg-[#F4F9FB]/50 dark:bg-slate-900/50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-[#35788D]/20 dark:focus:ring-[#4AA0BA]/20 transition-all outline-none resize-none ${isRTL ? 'text-start' : 'text-left'}`}
                        />
                    </div>

                    {/* English Answer */}
                    <div className="space-y-2">
                        <label className={`text-base font-black text-slate-800 dark:text-slate-200 block transition-colors duration-300 ${isRTL ? 'text-start' : 'text-end'}`}>
                            {isRTL ? 'الإجابة (باللغة الإنجليزية)' : 'Answer (English)'}
                        </label>
                        <textarea
                            rows={6}
                            value={formData.answer_en || ''}
                            onChange={e => setFormData(prev => ({ ...prev, answer_en: e.target.value }))}
                            placeholder={isRTL ? 'اكتب الإجابة باللغة الإنجليزية...' : 'Write the answer in English...'}
                            className={`w-full bg-[#F4F9FB]/50 dark:bg-slate-950/50 border border-transparent dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-[#35788D]/20 dark:focus:ring-[#4AA0BA]/20 transition-all outline-none resize-none ${isRTL ? 'text-start' : 'text-left'}`}
                            dir={isRTL && !formData.answer_en ? 'rtl' : 'ltr'}
                        />
                    </div>
                </div>

                {/* Sidebar — visibility & tags (second in DOM = LEFT in RTL) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Visibility */}
                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors duration-300">
                        <h3 className={`text-base font-black text-slate-800 dark:text-slate-200 transition-colors duration-300 ${isRTL ? 'text-start' : 'text-end'}`}>
                            {isRTL ? 'إعدادات الظهور' : 'Visibility Settings'}
                        </h3>
                        <div className={`space-y-3 ${isRTL ? 'text-start' : 'text-end'}`}>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="access"
                                    checked={accessType === 'public'}
                                    onChange={() => setAccessType('public')}
                                    className="accent-[#35788D] dark:accent-[#4AA0BA] w-4 h-4"
                                />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#35788D] dark:group-hover:text-[#4AA0BA] transition-colors">
                                    {isRTL ? 'متاح للجميع (الزوار)' : 'Public (Visitors)'}
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="access"
                                    checked={accessType === 'members'}
                                    onChange={() => setAccessType('members')}
                                    className="accent-[#35788D] dark:accent-[#4AA0BA] w-4 h-4"
                                />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#35788D] dark:group-hover:text-[#4AA0BA] transition-colors">
                                    {isRTL ? 'للمشتركين فقط' : 'Members only'}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors duration-300">
                        <FilterSelector
                            type="topic"
                            label={isRTL ? 'تصنيف السؤال' : 'FAQ Category'}
                            selectedIds={selectedTopicIds}
                            onChange={setSelectedTopicIds}
                            placeholder={isRTL ? 'اختر تصنيفاً...' : 'Select a category...'}
                        />
                    </div>

                    {/* Display Order */}
                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-colors duration-300">
                        <h3 className={`text-base font-black text-slate-800 dark:text-slate-200 transition-colors duration-300 ${isRTL ? 'text-start' : 'text-end'}`}>
                            {isRTL ? 'ترتيب العرض' : 'Display Order'}
                        </h3>
                        <input
                            type="number"
                            value={formData.display_order || 0}
                            onChange={e => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                            placeholder={isRTL ? 'مثال: 1, 2, 3...' : 'e.g. 1, 2, 3...'}
                            className="w-full bg-[#F4F9FB] dark:bg-slate-950/50 border border-transparent dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-[#35788D]/20 dark:focus:ring-[#4AA0BA]/20 transition-all text-start outline-none"
                        />
                        <p className={`text-[10px] text-slate-400 dark:text-slate-500 font-bold ${isRTL ? 'text-start' : 'text-end'}`}>
                            {isRTL ? 'يستخدم هذا الرقم لتحديد ترتيب ظهور السؤال في الصفحة' : 'This number determines the sorting order of the question on the page'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom action bar */}
            <div className={`flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
                <button
                    type="button"
                    onClick={e => handleSubmit(e, false)}
                    disabled={isCreating || isUpdating}
                    className="bg-[#0095D9] text-white px-7 py-3.5 rounded-full font-black text-sm shadow-lg shadow-[#0095D9]/30 hover:shadow-[#0095D9]/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-60"
                >
                    <Save size={16} />
                    {isRTL ? 'حفظ التعديلات' : 'Save Changes'}
                </button>

                <button
                    type="button"
                    onClick={e => handleSubmit(e, true)}
                    disabled={isCreating || isUpdating}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-7 py-3.5 rounded-full font-black text-sm hover:bg-gray-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-60"
                >
                    <FileText size={16} />
                    {isRTL ? 'حفظ كمسودة' : 'Save as Draft'}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 px-7 py-3.5 rounded-full font-bold text-sm transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
            </div>
        </div>
    )
}
