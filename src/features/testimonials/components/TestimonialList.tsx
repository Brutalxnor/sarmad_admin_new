import { useState } from 'react'
import { useTestimonials } from '../hooks/use-testimonials'
import { useLanguage } from '@/shared/context/LanguageContext'
import { TestimonialCard } from './TestimonialCard'
import { CreateTestimonialForm } from './CreateTestimonialForm'

import { LoadingModal } from '@/shared/components/LoadingModal'
import { ConfirmationModal } from '@/shared/components/ConfirmationModal'

import { usePagination } from '@/shared/hooks/use-pagination'
import { Pagination } from '@/shared/components/Pagination'

export function TestimonialList() {
    const { data: testimonials, isLoading, deleteTestimonial, updateTestimonial } = useTestimonials()
    const { t, direction, language } = useLanguage()
    const [isCreating, setIsCreating] = useState(false)
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const filteredTestimonials = testimonials?.filter(testimonial => {
        if (filter === 'active') return testimonial.is_active
        if (filter === 'inactive') return !testimonial.is_active
        return true
    })

    // Pagination
    const { currentData: paginatedTestimonials, currentPage, totalPages, goToPage } = usePagination({
        data: filteredTestimonials || [],
        itemsPerPage: 10
    })

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateTestimonial({ id, data: { is_active: !currentStatus } })
        } catch (error) {
            console.error('Failed to update Testimonial status:', error)
        }
    }

    const handleDeleteClick = (id: string) => {
        setDeleteId(id)
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        setIsDeleting(true)
        try {
            await deleteTestimonial(deleteId)
            setDeleteId(null)
        } finally {
            setIsDeleting(false)
        }
    }

    if (isCreating) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsCreating(false)}
                        className={`p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 ${direction === 'rtl' ? '' : 'rotate-180'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-3xl font-extrabold text-slate-800">
                        {t('testimonials.add_new')}
                    </h1>
                </div>
                <CreateTestimonialForm
                    onSuccess={() => setIsCreating(false)}
                    onCancel={() => setIsCreating(false)}
                />
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-10 bg-[#F9FBFC] min-h-screen space-y-8 animate-fade-in">
            <LoadingModal
                isOpen={isDeleting}
                title={direction === 'rtl' ? 'جاري الحذف...' : 'Deleting...'}
                message={direction === 'rtl' ? 'يرجى الانتظار بينما يتم حذف الرأي' : 'Please wait while deleting the testimonial'}
            />

            <ConfirmationModal
                isOpen={!!deleteId && !isDeleting}
                title={t('common.confirm_delete')}
                message={direction === 'rtl' ? 'هل أنت متأكد من رغبتك في حذف هذا الرأي؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this testimonial? This action cannot be undone.'}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
                isDestructive
            />

            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 ${direction === 'rtl' ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Right Side (Title & Badge) */}
                <div className={`flex items-center gap-4 ${direction === 'rtl' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="bg-[#F4F9FB] px-4 py-1.5 rounded-full flex items-center gap-2">
                        <span className="text-[#35788D] font-black text-sm">
                            {filteredTestimonials?.length || 0}
                        </span>
                        <span className="text-[#35788D] font-bold text-xs opacity-60 uppercase tracking-widest">
                            {language === 'ar' ? 'قصة نجاح' : 'Success Stories'}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                        {language === 'ar' ? 'قصص النجاح' : 'Success Stories'}
                    </h1>
                </div>

                {/* Left Side (Add Action) */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-[#0095D9] text-white px-8 py-3.5 rounded-full font-black text-base shadow-lg shadow-[#0095D9]/30 hover:shadow-[#0095D9]/40 hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>{language === 'ar' ? 'إضافة قصة نجاح' : 'Add Success Story'}</span>
                    </button>

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
                        className="bg-white border border-slate-100 shadow-sm rounded-full px-6 py-3.5 text-sm font-bold text-slate-400 focus:ring-2 focus:ring-[#35788D]/10 outline-none transition-all cursor-pointer appearance-none min-w-[120px] text-center"
                    >
                        <option value="all">{direction === 'rtl' ? 'الكل' : 'All'}</option>
                        <option value="active">{direction === 'rtl' ? 'نشط' : 'Active'}</option>
                        <option value="inactive">{direction === 'rtl' ? 'غير نشط' : 'Inactive'}</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-panel h-64 animate-pulse bg-slate-100/50 rounded-2xl" />
                    ))}
                </div>
            ) : paginatedTestimonials && paginatedTestimonials.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedTestimonials.map((testimonial) => (
                            <TestimonialCard
                                key={testimonial.id}
                                testimonial={testimonial}
                                onDelete={handleDeleteClick}
                                onToggleActive={handleToggleActive}
                            />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                    />
                </>
            ) : (
                <div className="glass-panel p-16 text-center bg-white/50 border-dashed border-2 border-slate-100">
                    <div className="w-20 h-20 bg-slate-50/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <span className="text-4xl">🌟</span>
                    </div>
                    <p className="text-slate-400 font-bold text-lg mb-2">{t('testimonials.empty_desc')}</p>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="text-brand-600 font-black hover:underline underline-offset-4"
                    >
                        {direction === 'rtl' ? 'أضف أول رأي الآن' : 'Add your first testimonial now'}
                    </button>
                </div>
            )}
        </div>
    )
}
