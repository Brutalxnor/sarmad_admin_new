import { useLanguage } from '@/shared/context/LanguageContext'
import type { Testimonial } from '../types'

interface TestimonialCardProps {
    testimonial: Testimonial;
    onDelete?: (id: string) => void;
    onToggleActive?: (id: string, currentStatus: boolean) => void;
}

export function TestimonialCard({ testimonial, onDelete, onToggleActive }: TestimonialCardProps) {
    const { language, t, direction } = useLanguage()
    const isRTL = direction === 'rtl'

    const name = language === 'ar' ? testimonial.name_ar : testimonial.name_en
    const role = language === 'ar' ? testimonial.role_ar : testimonial.role_en
    const content = language === 'ar' ? testimonial.content_ar : testimonial.content_en

    return (
        <div className={`group bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl dark:hover:shadow-brand-500/10 transition-all duration-500 border border-slate-100 dark:border-slate-700/50 flex flex-col h-full transform hover:-translate-y-1 ${!testimonial.is_active ? 'opacity-75 grayscale-[0.3]' : ''}`}>

            {/* Image Section */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
                {testimonial.image_url ? (
                    <img
                        src={testimonial.image_url}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-200 dark:text-slate-800 transition-colors duration-300">
                        <span className="text-6xl mb-4 opacity-50">👤</span>
                        <span className="text-xs font-black uppercase tracking-widest opacity-50">{isRTL ? 'بدون صورة' : 'No Image'}</span>
                    </div>
                )}

                {/* Status Toggle Overlay */}
                <div className={`absolute top-6 left-6 z-20`}>
                    <div
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleActive?.(testimonial.id, testimonial.is_active)
                        }}
                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 ${testimonial.is_active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'bg-slate-400/50 dark:bg-slate-700/50 backdrop-blur-md'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 transform shadow-sm ${testimonial.is_active ? (isRTL ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'}`} />
                    </div>
                </div>

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Content Section */}
            <div className={`p-8 flex flex-col flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-1 group-hover:text-[#35788D] dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                    {name}
                </h3>
                {role && (
                    <p className="text-[10px] font-black text-[#0095D9] dark:text-[#4AA0BA] uppercase tracking-widest mb-4 opacity-80">
                        {role}
                    </p>
                )}

                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed line-clamp-4 mb-6 italic">
                    {content}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                                {new Date(testimonial.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.(testimonial.id)
                        }}
                        className="p-3 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                        title={t('common.delete')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
