import { useState, useEffect } from 'react'
import { Modal } from '@/features/questions/components/Modal'
import { useUpdateMetadata } from '../hooks/use-assessment-metadata'
import type { AssessmentMetadata } from '../api/metadata'
import { useLanguage } from '@/shared/context/LanguageContext'
import { toast } from 'react-hot-toast'
import { Save, AlertCircle } from 'lucide-react'

interface EditAssessmentModalProps {
    assessment: AssessmentMetadata | null
    isOpen: boolean
    onClose: () => void
}

export function EditAssessmentModal({ assessment, isOpen, onClose }: EditAssessmentModalProps) {
    const { direction } = useLanguage()
    const isRTL = direction === 'rtl'
    const updateMetadata = useUpdateMetadata()
    const [formData, setFormData] = useState<Partial<AssessmentMetadata>>({})

    useEffect(() => {
        if (assessment) {
            setFormData({
                name: assessment.name,
                description: assessment.description,
                category: assessment.category,
                estimated_time: assessment.estimated_time?.replace(/[^0-9]/g, '') || '',
                is_active: assessment.is_active,
                version: assessment.version
            })
        }
    }, [assessment])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!assessment?.id) return

        const toastId = toast.loading(isRTL ? 'جاري التحديث...' : 'Updating...')
        try {
            // Clean estimated_time to include "mins" or similar if needed, 
            // but the API probably expects what the create page sends
            const timeValue = formData.estimated_time ? `${formData.estimated_time} ${isRTL ? 'دقيقة' : 'mins'}` : ''

            await updateMetadata.mutateAsync({
                id: assessment.id,
                data: {
                    ...formData,
                    estimated_time: timeValue
                }
            })
            toast.success(isRTL ? 'تم التحديث بنجاح' : 'Updated successfully', { id: toastId })
            onClose()
        } catch (error) {
            toast.error(isRTL ? 'فشل التحديث' : 'Update failed', { id: toastId })
        }
    }

    if (!assessment) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isRTL ? 'تعديل بيانات التقييم' : 'Edit Assessment Info'}
        >
            <form onSubmit={handleSubmit} className="space-y-6 py-4" dir={direction}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className={`block text-slate-400 dark:text-slate-500 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? 'اسم التقييم' : 'Assessment Name'}
                        </label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 outline-none focus:ring-2 focus:ring-[#0095D9]/10 focus:border-[#0095D9]/20 transition-all font-bold text-slate-800 dark:text-slate-100"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={`block text-slate-400 dark:text-slate-500 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? 'رقم الإصدار' : 'Version Number'}
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.version || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, version: parseFloat(e.target.value) }))}
                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 outline-none focus:ring-2 focus:ring-[#0095D9]/10 focus:border-[#0095D9]/20 transition-all font-bold text-slate-800 dark:text-slate-100"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className={`block text-slate-400 dark:text-slate-500 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? 'التصنيف' : 'Category'}
                        </label>
                        <select
                            value={formData.category || 'Health'}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 outline-none focus:ring-2 focus:ring-[#0095D9]/10 transition-all font-bold text-slate-800 dark:text-slate-100 appearance-none"
                        >
                            <option value="Health">{isRTL ? 'صحي' : 'Health'}</option>
                            <option value="Psychology">{isRTL ? 'نفسي' : 'Psychology'}</option>
                            <option value="Lifestyle">{isRTL ? 'نمط حياة' : 'Lifestyle'}</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className={`block text-slate-400 dark:text-slate-500 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? 'الوقت المقدر (بالدقائق)' : 'Estimated Time (mins)'}
                        </label>
                        <input
                            type="number"
                            value={formData.estimated_time || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, estimated_time: e.target.value }))}
                            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 outline-none focus:ring-2 focus:ring-[#0095D9]/10 focus:border-[#0095D9]/20 transition-all font-bold text-slate-800 dark:text-slate-100"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className={`block text-slate-400 dark:text-slate-500 font-bold text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'وصف التقييم' : 'Description'}
                    </label>
                    <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full min-h-[100px] p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 outline-none focus:ring-2 focus:ring-[#0095D9]/10 transition-all resize-none font-bold text-slate-800 dark:text-slate-100"
                    />
                </div>

                <div className="flex bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-blue-100 dark:border-slate-600 gap-4 mt-4">
                    <div className="text-blue-500">
                        <AlertCircle size={24} />
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                        {isRTL
                            ? 'تنبيه: تغيير رقم الإصدار قد يؤثر على كيفية عرض الأسئلة المرتبطة بهذا الإصدار.'
                            : 'Note: Changing the version number might affect how associated questions are displayed.'}
                    </p>
                </div>

                <div className="flex gap-4 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-300 font-black hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                    >
                        {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        disabled={updateMetadata.isPending}
                        className="flex-1 bg-[#0095D9] text-white px-6 py-3.5 rounded-xl font-black shadow-lg shadow-[#0095D9]/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
