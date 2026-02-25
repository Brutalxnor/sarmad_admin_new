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

    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        role_ar: '',
        role_en: '',
        content_ar: '',
        content_en: '',
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
        // Simulate upload delay
        setTimeout(() => {
            const fakeUrl = URL.createObjectURL(file)
            setFormData(prev => ({ ...prev, image_url: fakeUrl }))
            setIsUploading(false)
            toast.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully')
        }, 1000)
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
                // If English fields are empty, use Arabic ones as fallback for now
                name_en: formData.name_en || formData.name_ar,
                role_en: formData.role_en || formData.role_ar,
                content_en: formData.content_en || formData.content_ar
            })
            toast.success(language === 'ar' ? 'تم حفظ قصة النجاح بنجاح' : 'Success story saved successfully')
            onSuccess?.()
            if (!onSuccess) navigate('/cms')
        } catch (error) {
            console.error('Failed to save story:', error)
            toast.error(language === 'ar' ? 'فشل في حفظ القصة' : 'Failed to save story')
        }
    }

    const inputClasses = "w-full bg-[#F4F9FB] border-none rounded-2xl p-5 text-base font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-[#35788D]/20 transition-all text-start"
    const labelClasses = "text-lg font-black text-slate-800 block text-start"

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-10 animate-fade-in bg-[#F9FBFC] min-h-screen">
            {/* Breadcrumb Header */}
            <div className={`flex justify-between items-center mb-12 ${direction === 'rtl' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="flex items-center gap-3 text-sm font-bold">
                    <span className="text-slate-800 font-black text-lg">{t('success_stories.add_new')}</span>
                    <span className="text-slate-300 mx-1">|</span>
                    <button
                        onClick={() => onCancel ? onCancel() : navigate('/cms')}
                        className="text-slate-400 hover:text-[#35788D] transition-all flex items-center gap-2"
                    >
                        {t('success_stories.back_to_cms')}
                        <ArrowLeft size={18} className={direction === 'rtl' ? '' : 'rotate-180'} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-gray-100 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {/* Column 1: Arabic Details */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 text-[#35788D] mb-2">
                            <div className="w-2 h-8 bg-[#35788D] rounded-full" />
                            <h3 className="text-xl font-black">{language === 'ar' ? 'التفاصيل بالعربية' : 'Arabic Details'}</h3>
                        </div>

                        <div className="space-y-3">
                            <label className={labelClasses}>{t('success_stories.patient_name')} (عربي)</label>
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
                            <label className={labelClasses}>{t('success_stories.title')} (عربي)</label>
                            <input
                                type="text"
                                value={formData.role_ar}
                                onChange={e => setFormData(prev => ({ ...prev, role_ar: e.target.value }))}
                                className={inputClasses}
                                placeholder="مثلاً: قصة التغلب على الأرق المزمن"
                                dir="rtl"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className={labelClasses}>{t('success_stories.journey')} (عربي)</label>
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

                    {/* Column 2: English Details & Meta */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <div className="w-2 h-8 bg-slate-200 rounded-full" />
                            <h3 className="text-xl font-black">{language === 'ar' ? 'التفاصيل بالإنجليزية' : 'English Details'}</h3>
                        </div>

                        <div className="space-y-3">
                            <label className={labelClasses}>{t('success_stories.patient_name')} (English)</label>
                            <input
                                type="text"
                                value={formData.name_en}
                                onChange={e => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                                className={inputClasses}
                                placeholder="e.g. Amin Emad"
                                dir="ltr"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className={labelClasses}>{t('success_stories.title')} (English)</label>
                            <input
                                type="text"
                                value={formData.role_en}
                                onChange={e => setFormData(prev => ({ ...prev, role_en: e.target.value }))}
                                className={inputClasses}
                                placeholder="e.g. Journey of Overcoming Insomnia"
                                dir="ltr"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className={labelClasses}>{t('success_stories.journey')} (English)</label>
                            <textarea
                                rows={6}
                                value={formData.content_en}
                                onChange={e => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
                                className={`${inputClasses} resize-none`}
                                placeholder="Describe the journey in English..."
                                dir="ltr"
                            />
                        </div>
                    </div>
                </div>

                {/* Row: Stats & Meta (Rating, Order, Category) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-gray-50">
                    <div className="space-y-3">
                        <label className={labelClasses}>{t('testimonials.rating')}</label>
                        <div className="flex items-center gap-4 bg-[#F4F9FB] p-4 rounded-2xl">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                        className={`transition-all ${formData.rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
                                    >
                                        <Star size={24} fill={formData.rating >= star ? 'currentColor' : 'none'} />
                                    </button>
                                ))}
                            </div>
                            <span className="font-black text-slate-600 ml-auto">{formData.rating}/5</span>
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

                    <div className="space-y-3">
                        <label className={labelClasses}>{language === 'ar' ? 'الفئة' : 'Category'}</label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className={inputClasses}
                        >
                            <option value="Success Story">{language === 'ar' ? 'قصة نجاح' : 'Success Story'}</option>
                            <option value="General">{language === 'ar' ? 'عام' : 'General'}</option>
                            <option value="Corporate">{language === 'ar' ? 'شركات' : 'Corporate'}</option>
                        </select>
                    </div>
                </div>

                {/* Media Section */}
                <div className="space-y-6 pt-6 border-t border-gray-50">
                    <h3 className="text-xl font-black text-slate-800">{t('success_stories.media_gallery')}</h3>

                    <div className="flex flex-col md:flex-row gap-8">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full md:w-64 h-64 rounded-[2rem] border-2 border-dashed border-gray-100 bg-[#F4F9FB]/30 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F4F9FB] hover:border-[#35788D]/20 transition-all group shrink-0"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#35788D] mb-4 group-hover:scale-110 transition-transform">
                                <ImageIcon size={28} />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-base font-black text-slate-800">
                                    {isUploading ? (direction === 'rtl' ? 'جاري الرفع...' : 'Uploading...') : (language === 'ar' ? 'رفع الصورة الرئيسية' : 'Upload Primary Photo')}
                                </p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">JPG, PNG</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        {formData.image_url ? (
                            <div className="relative group w-full md:w-64 h-64 rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm">
                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                        className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-rose-500 transition-colors"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-100">
                                <p className="text-slate-300 font-bold italic">{language === 'ar' ? 'لم يتم اختيار صورة بعد' : 'No photo selected yet'}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div className={`flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-gray-50 ${direction === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                    <button
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
                        onClick={() => handleSubmit(false)}
                        disabled={isCreating}
                        className="w-full sm:w-auto px-10 py-5 bg-[#E0F2F7] text-[#35788D] rounded-2xl font-black text-lg hover:bg-sky-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save size={24} />
                        {t('success_stories.save_draft')}
                    </button>
                    <button
                        onClick={() => onCancel ? onCancel() : navigate('/cms')}
                        className="w-full sm:w-auto px-10 py-5 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </div>
        </div>
    )
}
