import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Image as ImageIcon, CheckCircle, Save, Star, Trash2 } from 'lucide-react'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useTestimonials } from '../../testimonials/hooks/use-testimonials'
import { toast } from 'react-hot-toast'

interface CreateSuccessStoryFormProps {
    onSuccess?: () => void
    onCancel?: () => void
}

export function CreateSuccessStoryForm({ onSuccess, onCancel }: CreateSuccessStoryFormProps) {
    const { direction, t, language } = useLanguage()
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { createTestimonial, isCreating } = useTestimonials()
    const [isUploading, setIsUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name_ar: '',
        role_ar: '',
        content_ar: '',
        video: '',
        rating: 5,
        category: 'Success Story',
        display_order: 0,
        image_url: '',
        is_active: true
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        // Store the file directly in formData to be sent as FormData
        setFormData(prev => ({ ...prev, image_url: file as unknown as string }))

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string)
            setIsUploading(false)
            toast.success(language === 'ar' ? 'تم تجهيز الصورة للرفع' : 'Image ready for upload')
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (isActive: boolean) => {
        if (!formData.name_ar || !formData.content_ar) {
            toast.error(language === 'ar' ? 'يرجى ملء الحقول الأساسية' : 'Please fill required fields')
            return
        }

        try {
            await createTestimonial({
                ...formData,
                is_active: isActive,
                // Map Arabic fields to English labels for backend compatibility
                name_en: formData.name_ar,
                role_en: formData.role_ar,
                content_en: formData.content_ar
            })
            toast.success(language === 'ar' ? 'تم حفظ قصة النجاح بنجاح' : 'Success story saved successfully')
            onSuccess?.()
            if (!onSuccess) navigate('/cms')
        } catch (error) {
            console.error('Failed to save story:', error)
            toast.error(language === 'ar' ? 'فشل في حفظ القصة' : 'Failed to save story')
        }
    }

    const inputClasses = "w-full bg-[#F4F9FB] dark:bg-slate-900/50 border border-transparent dark:border-slate-700/50 rounded-2xl p-5 text-base font-bold text-slate-700 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-[#35788D]/20 dark:focus:ring-brand-500/20 transition-all text-start outline-none"
    const labelClasses = "text-lg font-black text-slate-800 dark:text-slate-100 block text-start"

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-10 animate-fade-in bg-[#F9FBFC] dark:bg-slate-900 min-h-screen transition-colors duration-300">
            {/* Breadcrumb Header */}
            <div className={`flex justify-between items-center mb-12 ${direction === 'rtl' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="flex items-center gap-3 text-sm font-bold">
                    <span className="text-slate-800 dark:text-slate-100 font-black text-lg">{t('success_stories.add_new')}</span>
                    <span className="text-slate-300 mx-1">|</span>
                    <button
                        onClick={() => onCancel ? onCancel() : navigate('/cms')}
                        className="text-slate-400 dark:text-slate-500 hover:text-[#35788D] dark:hover:text-brand-400 transition-all flex items-center gap-2"
                    >
                        {t('success_stories.back_to_cms')}
                        <ArrowLeft size={18} className={direction === 'rtl' ? '' : 'rotate-180'} />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 shadow-sm border border-gray-100 dark:border-slate-800 space-y-10 transition-colors duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 text-[#35788D] dark:text-[#4AA0BA] mb-2">
                            <div className="w-2 h-8 bg-[#35788D] dark:bg-[#4AA0BA] rounded-full" />
                            <h3 className="text-xl font-black">{language === 'ar' ? 'تفاصيل قصة النجاح' : 'Success Story Details'}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className={labelClasses}>{t('success_stories.patient_name')}</label>
                                <input
                                    type="text"
                                    value={formData.name_ar}
                                    onChange={e => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                                    className={inputClasses}
                                    placeholder="مثلاً: أمين عماد"
                                    dir="rtl"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className={labelClasses}>{t('success_stories.title')}</label>
                                <input
                                    type="text"
                                    value={formData.role_ar}
                                    onChange={e => setFormData(prev => ({ ...prev, role_ar: e.target.value }))}
                                    className={inputClasses}
                                    placeholder="مثلاً: قصة التغلب على الأرق المزمن"
                                    dir="rtl"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className={labelClasses}>{language === 'ar' ? 'رابط الفيديو' : 'Video Link'}</label>
                            <input
                                type="url"
                                value={formData.video}
                                onChange={e => setFormData(prev => ({ ...prev, video: e.target.value }))}
                                className={inputClasses}
                                placeholder="https://youtube.com/..."
                                dir="ltr"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className={labelClasses}>{t('success_stories.journey')}</label>
                            <textarea
                                rows={6}
                                value={formData.content_ar}
                                onChange={e => setFormData(prev => ({ ...prev, content_ar: e.target.value }))}
                                className={`${inputClasses} resize-none`}
                                placeholder={t('success_stories.journey_placeholder')}
                                dir="rtl"
                            />
                        </div>
                    </div>
                </div>

                {/* Row: Stats & Meta (Rating, Order) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50 dark:border-slate-800/50">
                    <div className="space-y-3">
                        <label className={labelClasses}>{t('testimonials.rating')}</label>
                        <div className="flex items-center gap-4 bg-[#F4F9FB] dark:bg-slate-900/50 p-4 rounded-2xl border border-transparent dark:border-slate-700/50 transition-colors">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                        className={`transition-all ${formData.rating >= star ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                                    >
                                        <Star size={star === formData.rating ? 28 : 24} fill={formData.rating >= star ? 'currentColor' : 'none'} className="transition-all" />
                                    </button>
                                ))}
                            </div>
                            <span className="font-black text-slate-600 dark:text-slate-400 ml-auto">{formData.rating}/5</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className={labelClasses}>{t('common.display_order')}</label>
                        <input
                            type="number"
                            value={formData.display_order}
                            onChange={e => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                            className={inputClasses}
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Media Section */}
                <div className="space-y-6 pt-6 border-t border-gray-50 dark:border-slate-800/50">
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{t('success_stories.media_gallery')}</h3>

                    <div className="flex flex-col md:flex-row gap-8">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full md:w-64 h-64 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-slate-700/50 bg-[#F4F9FB]/30 dark:bg-slate-900/50 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F4F9FB] dark:hover:bg-slate-800/80 hover:border-[#35788D]/20 dark:hover:border-brand-500/40 transition-all group shrink-0"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-[#35788D] dark:text-[#4AA0BA] mb-4 group-hover:scale-110 transition-transform">
                                <ImageIcon size={28} />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-base font-black text-slate-800 dark:text-slate-200">
                                    {isUploading ? (direction === 'rtl' ? 'جاري الرفع...' : 'Uploading...') : (language === 'ar' ? 'رفع الصورة الرئيسية' : 'Upload Primary Photo')}
                                </p>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">JPG, PNG</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        {previewUrl || (typeof formData.image_url === 'string' ? formData.image_url : null) ? (
                            <div className="relative group w-full md:w-64 h-64 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-slate-700/50 shadow-sm transition-colors">
                                <img src={previewUrl || (formData.image_url as string)} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, image_url: '' }))
                                            setPreviewUrl(null)
                                        }}
                                        className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-rose-500 transition-colors"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 rounded-[2rem] border border-dashed border-slate-100 dark:border-slate-800 transition-colors">
                                <p className="text-slate-300 dark:text-slate-600 font-bold italic">{language === 'ar' ? 'لم يتم اختيار صورة بعد' : 'No photo selected yet'}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div className={`flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-gray-50 dark:border-slate-800/50 ${direction === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                    <button
                        type="button"
                        onClick={() => handleSubmit(true)}
                        disabled={isCreating}
                        className="w-full sm:w-auto px-12 py-5 bg-[#0095D9] text-white rounded-2xl font-black text-lg shadow-lg shadow-[#0095D9]/20 hover:shadow-[#0095D9]/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isCreating ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CheckCircle size={24} />
                        )}
                        {t('success_stories.publish')}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmit(false)}
                        disabled={isCreating}
                        className="w-full sm:w-auto px-10 py-5 bg-[#E0F2F7] dark:bg-slate-800 text-[#35788D] dark:text-[#4AA0BA] rounded-2xl font-black text-lg hover:bg-sky-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-transparent dark:border-slate-700/50"
                    >
                        <Save size={24} />
                        {t('success_stories.save_draft')}
                    </button>
                    <button
                        type="button"
                        onClick={() => onCancel ? onCancel() : navigate('/cms')}
                        className="w-full sm:w-auto px-10 py-5 text-slate-400 dark:text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-2xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-slate-700/50"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </div>
        </div>
    )
}
