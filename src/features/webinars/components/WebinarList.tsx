import { useState } from 'react'
import { useWebinars } from '../hooks/use-webinars'
import { useLanguage } from '@/shared/context/LanguageContext'
import type { Webinar } from '../types'
import { CreateWebinarForm } from './CreateWebinarForm'
import { WebinarAttendees } from './WebinarAttendees'
import { usePagination } from '@/shared/hooks/use-pagination'
import { Pagination } from '@/shared/components/Pagination'
import { Plus, Video, Eye, Clock, PlayCircle, Users, ArrowLeft, ChevronDown } from 'lucide-react'

export function WebinarList() {
    const { data: webinars, isLoading } = useWebinars()
    const { direction } = useLanguage()
    const isRTL = direction === 'rtl'

    const [isCreating, setIsCreating] = useState(false)
    const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null)
    const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null)
    const [activeFilter, setActiveFilter] = useState('all')
    const [sortBy, setSortBy] = useState('newest')

    // Extract unique segments for filter tabs
    const allSegments: string[] = Array.from(
        new Set((webinars || []).flatMap((w: Webinar) => Array.isArray(w.segment) ? w.segment : [w.segment]))
    )

    const filteredWebinars = (webinars || []).filter((w: Webinar) => {
        if (activeFilter === 'all') return true
        return Array.isArray(w.segment)
            ? w.segment.includes(activeFilter)
            : w.segment === activeFilter
    })

    const sortedWebinars = [...filteredWebinars].sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
        if (sortBy === 'oldest') return new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
        return 0
    })

    const { currentData: paginatedWebinars, currentPage, totalPages, goToPage } = usePagination<Webinar>({
        data: sortedWebinars,
        itemsPerPage: 9
    })

    const total = webinars?.length || 0
    const withRecording = webinars?.filter((w: Webinar) => w.recording_url).length || 0
    const registered = webinars?.reduce((sum: number, w: Webinar) => sum + (w.registration_count || 0), 0) || 0
    const drafts = webinars?.filter((w: Webinar) => !w.recording_url).length || 0

    const stats = [
        { label: isRTL ? 'إجمالي الندوات' : 'Total Webinars', value: total, icon: <Video size={20} className="text-[#35788D]" />, iconBg: 'bg-sky-50' },
        { label: isRTL ? 'منشور' : 'Published', value: withRecording, icon: <Eye size={20} className="text-teal-500" />, iconBg: 'bg-teal-50' },
        { label: isRTL ? 'قيد المراجعة' : 'In Review', value: registered, icon: <Users size={20} className="text-orange-500" />, iconBg: 'bg-orange-50' },
        { label: isRTL ? 'مسودات' : 'Drafts', value: drafts, icon: <Clock size={20} className="text-blue-500" />, iconBg: 'bg-blue-50' },
    ]

    // Create/Edit form
    if (isCreating || editingWebinar) {
        return (
            <div className="max-w-[1400px] mx-auto px-6 py-10 bg-[#F9FBFC] min-h-screen animate-fade-in">
                {/* Breadcrumb */}
                <div className={`flex mb-8 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <span className="text-slate-800 font-black">
                            {editingWebinar
                                ? (isRTL ? 'تعديل الندوة' : 'Edit Webinar')
                                : (isRTL ? 'إضافة ندوة جديدة' : 'Add New Webinar')}
                        </span>
                        <span className="text-slate-300 mx-2">|</span>
                        <button
                            onClick={() => { setIsCreating(false); setEditingWebinar(null) }}
                            className="text-slate-400 hover:text-[#35788D] transition-colors flex items-center gap-1"
                        >
                            <ArrowLeft size={14} className={isRTL ? '' : 'rotate-180'} />
                            {isRTL ? 'العودة لإدارة الندوات' : 'Back to Webinars'}
                        </button>
                    </div>
                </div>
                <CreateWebinarForm
                    initialData={editingWebinar || undefined}
                    onSuccess={() => { setIsCreating(false); setEditingWebinar(null) }}
                    onCancel={() => { setIsCreating(false); setEditingWebinar(null) }}
                />
            </div>
        )
    }

    // View attendees
    if (selectedWebinar) {
        return <WebinarAttendees webinar={selectedWebinar} onBack={() => setSelectedWebinar(null)} />
    }

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-10 bg-[#F9FBFC] min-h-screen space-y-8 animate-fade-in">

            {/* Header */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={isRTL ? 'text-start' : 'text-end'}>
                    <h1 className="text-4xl font-black text-[#1E293B] tracking-tight mb-1">
                        {isRTL ? 'مكتبة الندوات المسجلة' : 'Recorded Webinars Library'}
                    </h1>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-[#0095D9] text-white px-6 py-3.5 rounded-full font-black text-base shadow-lg shadow-[#0095D9]/30 hover:shadow-[#0095D9]/40 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                    <Plus size={20} />
                    {isRTL ? 'إضافة ندوة جديدة' : 'Add New Webinar'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Filter tabs + Sort */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Filter tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-5 py-2 rounded-full text-sm font-black transition-all ${activeFilter === 'all'
                            ? 'bg-[#0095D9] text-white shadow-md shadow-[#0095D9]/20'
                            : 'bg-white text-slate-500 border border-gray-100 hover:border-[#0095D9]/30 hover:text-[#0095D9]'}`}
                    >
                        {isRTL ? 'الكل' : 'All'}
                    </button>
                    {allSegments.map(seg => (
                        <button
                            key={seg}
                            onClick={() => setActiveFilter(seg)}
                            className={`px-5 py-2 rounded-full text-sm font-black transition-all ${activeFilter === seg
                                ? 'bg-[#0095D9] text-white shadow-md shadow-[#0095D9]/20'
                                : 'bg-white text-slate-500 border border-gray-100 hover:border-[#0095D9]/30 hover:text-[#0095D9]'}`}
                        >
                            {seg}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-bold">{isRTL ? 'ترتيب حسب:' : 'Sort by:'}</span>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2 pe-9 text-sm font-black text-slate-600 outline-none cursor-pointer shadow-sm"
                        >
                            <option value="newest">{isRTL ? 'الأحدث أولاً' : 'Newest first'}</option>
                            <option value="oldest">{isRTL ? 'الأقدم أولاً' : 'Oldest first'}</option>
                        </select>
                        <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                            <div className="aspect-video bg-slate-100" />
                            <div className="p-5 space-y-3">
                                <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
                                <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : paginatedWebinars.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedWebinars.map((webinar: Webinar) => (
                            <WebinarGridCard
                                key={webinar.id}
                                webinar={webinar}
                                isRTL={isRTL}
                                onEdit={() => setEditingWebinar(webinar)}
                                onViewAttendees={() => setSelectedWebinar(webinar)}
                            />
                        ))}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                </>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Video size={28} className="text-[#35788D]" />
                    </div>
                    <p className="text-slate-400 font-bold text-base mb-3">
                        {isRTL ? 'لا توجد ندوات بعد' : 'No webinars yet'}
                    </p>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="text-[#35788D] font-black text-sm hover:underline underline-offset-4"
                    >
                        {isRTL ? 'أضف أول ندوة الآن' : 'Add your first webinar now'}
                    </button>
                </div>
            )}
        </div>
    )
}


// ────────────────────────────────────────────────────────────
// Webinar Grid Card (matches mockup design)
// ────────────────────────────────────────────────────────────

function WebinarGridCard({
    webinar,
    isRTL,
    onEdit,
    onViewAttendees,
}: {
    webinar: Webinar
    isRTL: boolean
    onEdit: () => void
    onViewAttendees: () => void
}) {
    const thumbnailUrl = typeof webinar.thumbnail_image === 'string' ? webinar.thumbnail_image : ''
    const date = new Date(webinar.date_time).toLocaleDateString('ar-SA', { day: '2-digit', month: 'long', year: 'numeric' })
    const segments = Array.isArray(webinar.segment) ? webinar.segment : [webinar.segment]

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col">
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden bg-slate-100">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={webinar.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#35788D] to-[#0095D9] flex items-center justify-center">
                        <Video size={40} className="text-white/40" />
                    </div>
                )}

                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <PlayCircle size={28} className="text-[#35788D]" />
                    </div>
                </div>

                {/* Duration badge */}
                <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-lg`}>
                    <Clock size={11} />
                    <span>9 {isRTL ? 'دقائق' : 'min'}</span>
                </div>

                {/* Views badge */}
                <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} flex items-center gap-1.5 bg-[#0095D9]/80 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-lg`}>
                    <Eye size={11} />
                    <span>{webinar.registration_count}</span>
                </div>
            </div>

            {/* Content */}
            <div className={`p-5 flex-1 flex flex-col ${isRTL ? 'text-start' : 'text-end'}`}>
                {/* Title */}
                <h3 className="text-sm font-black text-slate-800 line-clamp-1 mb-2 group-hover:text-[#35788D] transition-colors">
                    {webinar.title}
                </h3>

                {/* Description */}
                {webinar.description && (
                    <p className="text-[11px] text-slate-400 font-medium line-clamp-2 mb-3 leading-relaxed">
                        {webinar.description.replace(/<[^>]*>/g, '').substring(0, 80)}...
                    </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {segments.map((seg, i) => (
                        <span key={i} className="bg-[#F4F9FB] text-[#35788D] text-[10px] font-black px-2.5 py-1 rounded-full">
                            {seg}
                        </span>
                    ))}
                </div>

                {/* Author */}
                <div className="mt-auto flex items-center gap-3 pt-3 border-t border-gray-50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#35788D] to-[#0095D9] flex items-center justify-center text-white text-[10px] font-black shrink-0">
                        {webinar.speaker?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-700 truncate">{webinar.speaker}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onViewAttendees}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-[#35788D] hover:bg-sky-50 transition-all"
                            title={isRTL ? 'الحضور' : 'Attendees'}
                        >
                            <Users size={14} />
                        </button>
                        <button
                            onClick={onEdit}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-[#35788D] hover:bg-sky-50 transition-all"
                            title={isRTL ? 'تعديل' : 'Edit'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
