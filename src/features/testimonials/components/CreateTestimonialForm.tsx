import { useState } from 'react'
import { useTestimonials } from '../hooks/use-testimonials'
import { useLanguage } from '@/shared/context/LanguageContext'
import type { Testimonial } from '../types'
import { Image as ImageIcon, Trash2 } from 'lucide-react'

interface CreateTestimonialFormProps {
    onSuccess?: () => void
    onCancel?: () => void
}

export function CreateTestimonialForm({ onSuccess, onCancel }: CreateTestimonialFormProps) {
    const { t, language } = useLanguage()
    const { createTestimonial, isCreating } = useTestimonials()
    const [isUploading, setIsUploading] = useState(false)

    const [formData, setFormData] = useState<Partial<Testimonial>>({
        name_en: '',
        name_ar: '',
        role_en: '',
        role_ar: '',
        content_en: '',
        content_ar: '',
        rating: 5,
        category: 'General',
        image_url: '',
        display_order: 0,
        video: '',
        is_active: true
    })

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        // Simulate upload delay
        setTimeout(() => {
            const fakeUrl = URL.createObjectURL(file)
            setFormData(prev => ({ ...prev, image_url: fakeUrl }))
            setIsUploading(false)
        }, 1000)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createTestimonial(formData)
            onSuccess?.()
        } catch (error) {
            console.error('Failed to create Testimonial:', error)
        }
    }

    const inputClasses = "w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-brand-500/20 focus:ring-4 focus:ring-brand-500/5 transition-all outline-none font-bold text-slate-700 text-lg placeholder:text-slate-300 placeholder:font-medium"
    const labelClasses = "text-sm font-black text-slate-800 tracking-tight flex items-center gap-2"

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-12 shadow-2xl space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Names */}
                    <div className="space-y-3">
                        <label className={labelClasses}>
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            {t('testimonials.name_en')}
                        </label>
                        <input
                            type="text"
                            required
                            className={inputClasses}
                            value={formData.name_en}
                            onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className={labelClasses}>
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            {t('testimonials.name_ar')}
                        </label>
                        <input
                            type="text"
                            required
                            dir="rtl"
                            className={inputClasses}
                            value={formData.name_ar}
                            onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                        />
                    </div>

                    {/* Roles */}
                    <div className="space-y-3">
                        <label className={labelClasses}>
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            {t('testimonials.role_en')}
                        </label>
                        <input
                            type="text"
                            className={inputClasses}
                            value={formData.role_en}
                            onChange={e => setFormData({ ...formData, role_en: e.target.value })}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className={labelClasses}>
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            {t('testimonials.role_ar')}
                        </label>
                        <input
                            type="text"
                            dir="rtl"
                            className={inputClasses}
                            value={formData.role_ar}
                            onChange={e => setFormData({ ...formData, role_ar: e.target.value })}
                        />
                    </div>

                    {/* Contents */}
                    <div className="md:col-span-2 space-y-3">
                        <label className={labelClasses}>
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            {t('testimonials.content_en')}
                        </label>
                        <textarea
                            required
                            rows={3}
                            className={inputClasses}
                            value={formData.content_en}
                            onChange={e => setFormData({ ...formData, content_en: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                        <label className={labelClasses}>
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            {t('testimonials.content_ar')}
                        </label>
                        <textarea
                            required
                            rows={3}
                            dir="rtl"
                            className={inputClasses}
                            value={formData.content_ar}
                            onChange={e => setFormData({ ...formData, content_ar: e.target.value })}
                        />
                    </div>

                    {/* Rating */}
                    <div className="space-y-3">
                        <label className={labelClasses}>
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            {t('testimonials.rating')} (1-5)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            className={inputClasses}
                            value={formData.rating}
                            onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    {/* Display Order */}
                    <div className="space-y-3">
                        <label className={labelClasses}>
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            {t('common.display_order') || 'Display Order'}
                        </label>
                        <input
                            type="number"
                            min="0"
                            className={inputClasses}
                            value={formData.display_order}
                            onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                            placeholder="e.g. 1, 2, 3..."
                        />
                    </div>
                    {/* Image Section: Upload + Link */}
                    <div className="md:col-span-2 space-y-4">
                        <label className={labelClasses}>
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            {t('testimonials.form.image_upload')}
                        </label>

                        <div className="group relative max-w-sm">
                            <div className={`aspect-square w-32 rounded-3xl overflow-hidden border-4 border-dashed transition-all duration-500 bg-slate-50/50 flex flex-col items-center justify-center gap-4 ${formData.image_url ? 'border-brand-500/20' : 'border-slate-100 hover:border-brand-200 hover:bg-white'}`}>
                                {formData.image_url ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={formData.image_url}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                                className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-rose-500 transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-4 pointer-events-none text-center">
                                        {isUploading ? (
                                            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <ImageIcon size={32} className="text-slate-300" />
                                                <span className="text-[10px] font-bold text-slate-400 px-2 line-clamp-2">
                                                    {t('testimonials.form.image_hint')}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">
                                {t('testimonials.form.image_url')}
                            </label>
                            <input
                                type="url"
                                className={inputClasses}
                                placeholder="https://..."
                                value={formData.image_url}
                                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            />
                        </div>

                        {/* Video Link */}
                        <div className="space-y-4 pt-4 border-t border-slate-50 mt-4">
                            <label className={labelClasses}>
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                {language === 'ar' ? 'رابط الفيديو (اختياري)' : 'Video Link (Optional)'}
                            </label>
                            <input
                                type="url"
                                className={inputClasses}
                                placeholder="https://youtube.com/..."
                                value={formData.video}
                                onChange={e => setFormData({ ...formData, video: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row-reverse items-center justify-start gap-4 pt-6">
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full sm:w-auto px-12 py-5 bg-brand-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-brand-200 hover:bg-brand-700 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
                    >
                        {isCreating ? t('common.loading') : t('common.save')}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-12 py-5 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </div>
        </form>
    )
}
