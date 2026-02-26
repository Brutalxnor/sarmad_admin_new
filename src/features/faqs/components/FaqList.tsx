import { useState } from 'react'
import { useFaqs } from '../hooks/use-faqs'
import { useTopics } from '../../content/hooks/use-content'
import { useLanguage } from '@/shared/context/LanguageContext'
import { CreateFaqForm } from './CreateFaqForm'
import type { FAQ } from '../types'
import { usePagination } from '@/shared/hooks/use-pagination'
import { Pagination } from '@/shared/components/Pagination'
import { Plus, Search, Trash2, Pencil, HelpCircle, CheckCircle, FileText, ArrowLeft } from 'lucide-react'

export function FaqList() {
    const { data: faqs, isLoading, deleteFaq, updateFaq } = useFaqs()
    const { data: topics = [] } = useTopics()
    const { direction, language } = useLanguage()
    const isRTL = direction === 'rtl'

    const [isCreating, setIsCreating] = useState(false)
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

    const filteredFaqs = faqs?.filter(faq => {
        const matchesFilter =
            filter === 'all' ? true :
                filter === 'active' ? faq.is_active :
                    !faq.is_active

        const q = searchQuery.toLowerCase()
        const matchesSearch = !q ||
            faq.question_ar?.toLowerCase().includes(q) ||
            faq.question_en?.toLowerCase().includes(q)

        return matchesFilter && matchesSearch
    })

    const { currentData: paginatedFaqs, currentPage, totalPages, goToPage } = usePagination({
        data: filteredFaqs || [],
        itemsPerPage: 10
    })

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateFaq({ id, data: { is_active: !currentStatus } })
        } catch (error) {
            console.error('Failed to update FAQ status:', error)
        }
    }

    const total = faqs?.length || 0
    const published = faqs?.filter(f => f.is_active).length || 0
    const drafts = faqs?.filter(f => !f.is_active).length || 0

    const stats = [
        { label: isRTL ? 'إجمالي الأسئلة' : 'Total FAQs', value: total, icon: <HelpCircle size={20} className="text-[#35788D]" />, iconBg: 'bg-sky-50' },
        { label: isRTL ? 'منشورة' : 'Published', value: published, icon: <CheckCircle size={20} className="text-teal-500" />, iconBg: 'bg-teal-50' },
        { label: isRTL ? 'مسودات' : 'Drafts', value: drafts, icon: <FileText size={20} className="text-blue-500" />, iconBg: 'bg-blue-50' },
    ]

    if (isCreating || editingFaq) {
        return (
            <div className="max-w-[1400px] mx-auto px-6 py-10 bg-[#F9FBFC] min-h-screen animate-fade-in">
                {/* Breadcrumb */}
                <div className={`flex mb-8 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <span className="text-slate-800 font-black">
                            {editingFaq ? (isRTL ? 'تعديل السؤال' : 'Edit FAQ') : (isRTL ? 'إضافة سؤال جديد' : 'Add New FAQ')}
                        </span>
                        <span className="text-slate-300 mx-2">|</span>
                        <button
                            onClick={() => { setIsCreating(false); setEditingFaq(null); }}
                            className="text-slate-400 hover:text-[#35788D] transition-colors flex items-center gap-1"
                        >
                            <ArrowLeft size={14} className={isRTL ? '' : 'rotate-180'} />
                            {isRTL ? 'العودة لإدارة الأسئلة' : 'Back to FAQs'}
                        </button>
                    </div>
                </div>
                <CreateFaqForm
                    initialData={editingFaq || undefined}
                    onSuccess={() => { setIsCreating(false); setEditingFaq(null); }}
                    onCancel={() => { setIsCreating(false); setEditingFaq(null); }}
                />
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-10 bg-[#F9FBFC] min-h-screen space-y-8 animate-fade-in">

            {/* Page Header */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={isRTL ? 'text-start' : 'text-end'}>
                    <h1 className="text-4xl font-black text-[#1E293B] tracking-tight mb-1">
                        {isRTL ? 'إدارة الأسئلة الشائعة' : 'FAQ Management'}
                    </h1>
                    <p className="text-slate-400 font-bold text-sm">
                        {isRTL ? 'للتحكم في الأسئلة الشائعة' : 'Manage frequently asked questions'}
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-[#0095D9] text-white px-6 py-3.5 rounded-full font-black text-base shadow-lg shadow-[#0095D9]/30 hover:shadow-[#0095D9]/40 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                    <Plus size={20} />
                    {isRTL ? 'إضافة سؤال جديد' : 'Add New FAQ'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative">
                        <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 mt-4">{stat.value}</h3>
                        <p className="text-gray-400 font-bold text-xs mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Search + Filter */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
                <Search size={16} className="text-slate-300 shrink-0" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={isRTL ? 'البحث في الأسئلة' : 'Search questions...'}
                    className="flex-1 bg-transparent text-sm font-bold text-slate-700 placeholder:text-slate-300 outline-none text-start"
                />
                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
                    className="bg-[#F4F9FB] border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none cursor-pointer"
                >
                    <option value="all">{isRTL ? 'الكل' : 'All'}</option>
                    <option value="active">{isRTL ? 'منشور' : 'Published'}</option>
                    <option value="inactive">{isRTL ? 'مسودة' : 'Draft'}</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : paginatedFaqs && paginatedFaqs.length > 0 ? (
                    <>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#F4F9FB] border-b border-gray-100">
                                    <th className={`px-6 py-4 font-black text-slate-500 text-xs uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'} w-8`}>#</th>
                                    <th className={`px-6 py-4 font-black text-slate-500 text-xs uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {isRTL ? 'السؤال' : 'Question'}
                                    </th>
                                    <th className={`px-6 py-4 font-black text-slate-500 text-xs uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'} hidden md:table-cell`}>
                                        {isRTL ? 'القسم' : 'Category'}
                                    </th>
                                    <th className={`px-6 py-4 font-black text-slate-500 text-xs uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'} hidden md:table-cell`}>
                                        {isRTL ? 'تاريخ النشر' : 'Published'}
                                    </th>
                                    <th className={`px-6 py-4 font-black text-slate-500 text-xs uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {isRTL ? 'الإجراءات' : 'Actions'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedFaqs.map((faq, idx) => {
                                    const question = language === 'ar' ? faq.question_ar : faq.question_en
                                    const answer = language === 'ar' ? faq.answer_ar : faq.answer_en
                                    const rowNum = (currentPage - 1) * 10 + idx + 1

                                    return (
                                        <tr key={faq.id} className="hover:bg-[#F9FBFC] transition-colors group">
                                            <td className={`px-6 py-4 text-slate-400 font-bold text-xs ${isRTL ? 'text-right' : 'text-left'}`}>{rowNum}</td>
                                            <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                <p className="font-black text-slate-800 truncate max-w-xs">{question}</p>
                                                <p className="text-slate-400 font-medium text-xs mt-0.5 truncate max-w-xs">{answer}</p>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                {(() => {
                                                    const topic = topics.find(t => t.id === faq.category)
                                                    const topicName = topic ? (language === 'ar' ? topic.name_ar : topic.name_en) : faq.category
                                                    return (
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${topic ? 'bg-sky-50 text-sky-600' : 'bg-teal-50 text-teal-600'}`}>
                                                            {topicName || (isRTL ? 'عام' : 'General')}
                                                        </span>
                                                    )
                                                })()}
                                            </td>
                                            <td className={`px-6 py-4 text-slate-400 font-bold text-xs hidden md:table-cell ${isRTL ? 'text-right' : 'text-left'}`}>
                                                {faq.created_at
                                                    ? new Date(faq.created_at).toLocaleDateString('ar-SA', { day: '2-digit', month: 'long', year: 'numeric' })
                                                    : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setEditingFaq(faq)}
                                                        className="p-2 rounded-lg text-slate-300 hover:text-[#35788D] hover:bg-sky-50 transition-all"
                                                        title={isRTL ? 'تعديل' : 'Edit'}
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(faq.id, faq.is_active)}
                                                        className={`p-2 rounded-lg transition-all ${faq.is_active ? 'text-teal-500 hover:bg-teal-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'}`}
                                                        title={faq.is_active ? (isRTL ? 'إيقاف' : 'Deactivate') : (isRTL ? 'تفعيل' : 'Activate')}
                                                    >
                                                        <CheckCircle size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteFaq(faq.id)}
                                                        className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                                        title={isRTL ? 'حذف' : 'Delete'}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400">
                                {isRTL
                                    ? `عرض ${(currentPage - 1) * 10 + 1}-${Math.min(currentPage * 10, filteredFaqs?.length || 0)} من أصل ${filteredFaqs?.length || 0} سؤال`
                                    : `Showing ${(currentPage - 1) * 10 + 1}–${Math.min(currentPage * 10, filteredFaqs?.length || 0)} of ${filteredFaqs?.length || 0}`}
                            </p>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={goToPage}
                            />
                        </div>
                    </>
                ) : (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HelpCircle size={28} className="text-[#35788D]" />
                        </div>
                        <p className="text-slate-400 font-bold text-base mb-3">
                            {isRTL ? 'لا توجد أسئلة بعد' : 'No FAQs yet'}
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="text-[#35788D] font-black text-sm hover:underline underline-offset-4"
                        >
                            {isRTL ? 'أضف أول سؤال الآن' : 'Add your first FAQ now'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
