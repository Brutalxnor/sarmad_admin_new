import { useMemo, useState } from 'react'
import { useContent, useDeleteArticle } from '../hooks/use-content'
import { useCourses } from '@/features/courses/hooks/use-courses'
import { useAuth } from '@/features/staff/context/AuthContext'
import { useLanguage } from '@/shared/context/LanguageContext'
import { CreateContentForm } from './CreateContentForm'
import type { ContentItem } from '../types'
import type { Course } from '@/features/courses/types'

import { usePagination } from '@/shared/hooks/use-pagination'
import { Pagination } from '@/shared/components/Pagination'
import {
    BookOpen,
    CheckCircle,
    Clock,
    Edit3,
    MessageCircle,
    PlayCircle,
    Users,
    FileText,
    Play,
    GraduationCap,
    Star,
    HelpCircle,
    Plus,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Video,
    MoreHorizontal,
    LayoutGrid
} from 'lucide-react'

interface ContentListProps {
    typeFilter?: 'article' | 'video'
    hideHeader?: boolean
}

type ViewState = 'list' | 'add-selection' | 'create' | 'edit'

export function ContentList({ typeFilter, hideHeader }: ContentListProps) {
    const { data: contents, isLoading: isLoadingContent } = useContent()
    const { data: courses, isLoading: isLoadingCourses } = useCourses()
    const isLoading = isLoadingContent || isLoadingCourses
    const { mutate: deleteContent } = useDeleteArticle()
    const { t, direction } = useLanguage()
    const [view, setView] = useState<ViewState>('list')
    const [selectedType, setSelectedType] = useState<ContentType | 'course' | null>(null)
    const [activeTab, setActiveTab] = useState<'all' | 'video' | 'article' | 'course'>(typeFilter || 'all')
    const [editingContent, setEditingContent] = useState<ContentItem | null>(null)
    const [deletingContentId, setDeletingContentId] = useState<string | null>(null)
    const { user } = useAuth()
    const canCreate = user?.role !== 'AdminOperations'

    // Filter content based on type and active tab
    const filteredContent = useMemo(() => {
        let allItems: any[] = contents ? [...contents] : []

        // Normalize and add courses
        if (courses) {
            const normalizedCourses = courses.map((course: Course) => ({
                id: course.id,
                type: 'course',
                title: course.title,
                description: course.description,
                thumbnail_image: course.thumbnail_url,
                status: 'published', // Courses are generally public/published if returned by getAll
                tags: course.category ? [course.category] : [],
                access_type: course.access_type,
                created_at: course.created_at,
                // Add fields expected by the UI
                duration: `${course.sections?.length || 0} Sections`,
                author: 'Sarmad Academy',
                author_role: 'Educational Content'
            }))
            allItems = [...allItems, ...normalizedCourses]
        }

        if (allItems.length === 0) return []

        return allItems.filter(item => {
            // Priority 1: User selected a specific tab
            if (activeTab !== 'all') {
                if (activeTab === 'course') {
                    return item.type === 'course' || item.type === 'micro_lesson'
                }
                return item.type === activeTab
            }

            // Priority 2: Parent component passed a type filter
            if (typeFilter) {
                return item.type === typeFilter
            }

            // Priority 3: Show all
            return true
        })
    }, [contents, courses, typeFilter, activeTab])

    const { currentData: paginatedArticles, currentPage, totalPages, goToPage } = usePagination({
        data: filteredContent,
        itemsPerPage: 9
    })

    const handleBackToList = () => {
        setView('list')
        setEditingContent(null)
    }

    if (view === 'create' || view === 'edit') {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBackToList}
                        className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"
                    >
                        <ArrowLeft size={24} className={direction === 'rtl' ? 'rotate-180' : ''} />
                    </button>
                    <h1 className="text-3xl font-black text-slate-800">
                        {view === 'edit' ? t('content.edit_title') : t('content.add_new_title')}
                    </h1>
                </div>
                <CreateContentForm
                    initialData={editingContent || (selectedType ? { type: selectedType as any } : (typeFilter ? { type: typeFilter } : undefined))}
                    onSuccess={handleBackToList}
                    onCancel={handleBackToList}
                />
            </div>
        )
    }

    if (view === 'add-selection') {
        const types = [
            { id: 'article', icon: <FileText size={40} className="text-sky-500" />, title: t('content.add.type.article'), desc: t('content.add.type.article_desc'), action: t('content.add.action.article'), color: 'bg-sky-50' },
            { id: 'video', icon: <PlayCircle size={40} className="text-blue-500" />, title: t('content.add.type.video'), desc: t('content.add.type.video_desc'), action: t('content.add.action.video'), color: 'bg-blue-50' },
            { id: 'course', icon: <GraduationCap size={40} className="text-indigo-500" />, title: t('content.add.type.course'), desc: t('content.add.type.course_desc'), action: t('content.add.action.course'), color: 'bg-indigo-50' },
            { id: 'success_story', icon: <Star size={40} className="text-amber-500" />, title: t('content.add.type.success_story'), desc: t('content.add.type.success_story_desc'), action: t('content.add.action.success_story'), color: 'bg-amber-50' },
            { id: 'webinar', icon: <Video size={40} className="text-emerald-500" />, title: t('content.add.type.webinar'), desc: t('content.add.type.webinar_desc'), action: t('content.add.action.webinar'), color: 'bg-emerald-50' },
            { id: 'faq', icon: <HelpCircle size={40} className="text-slate-400" />, title: t('content.add.type.faq'), desc: t('content.add.type.faq_desc'), action: t('content.add.action.faq'), color: 'bg-slate-50' },
        ]

        return (
            <div className="space-y-12 animate-fade-in py-10">
                <div className="flex flex-col items-center text-center space-y-4">
                    <button
                        onClick={handleBackToList}
                        className="text-gray-400 hover:text-[#35788D] font-bold text-sm flex items-center gap-2 mb-4"
                    >
                        <ArrowLeft size={16} className={direction === 'rtl' ? 'rotate-180' : ''} />
                        {t('content.back_to_list')}
                    </button>
                    <h1 className="text-4xl font-black text-slate-800">{t('content.add.selection_title')}</h1>
                    <p className="text-gray-400 font-bold max-w-lg">{t('content.add.selection_subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                    {types.map((type) => (
                        <div key={type.id} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                            <div className={`w-24 h-24 rounded-full ${type.color} flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110`}>
                                {type.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-4">{type.title}</h3>
                            <p className="text-gray-400 text-sm font-bold leading-relaxed mb-8 flex-1">{type.desc}</p>
                            <button
                                onClick={() => {
                                    setSelectedType(type.id as any)
                                    setView('create')
                                }}
                                className="text-[#35788D] font-black text-sm flex items-center gap-2 group-hover:gap-3 transition-all"
                            >
                                {type.action}
                                <ArrowLeft size={16} className={direction === 'rtl' ? 'rotate-180' : ''} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const confirmDelete = () => {
        if (deletingContentId) {
            deleteContent(deletingContentId)
            setDeletingContentId(null)
        }
    }

    return (
        <div className="space-y-10 animate-fade-in max-w-[1600px] mx-auto px-4 py-6">
            {!hideHeader && (
                <div className="flex justify-between items-center mb-10">
                    <div className="text-start">
                        <h1 className="text-4xl font-black text-slate-800 mb-2">{t('content.management_title')}</h1>
                        <p className="text-gray-400 font-bold text-sm">{t('content.management_subtitle')}</p>
                    </div>
                    {canCreate && (
                        <button
                            onClick={() => setView('add-selection')}
                            className="bg-[#0095D9] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg shadow-[#0095D9]/30 hover:shadow-[#0095D9]/40 hover:-translate-y-1 transition-all flex items-center gap-3"
                        >
                            <Plus size={24} />
                            {t('content.add_new_title')}
                        </button>
                    )}
                </div>
            )}


            {/* Tabs & Grid */}
            <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-2 flex items-center justify-start gap-2 overflow-x-auto">
                    {[
                        { id: 'all', label: 'الكل', icon: <LayoutGrid size={18} /> },
                        { id: 'video', label: 'فيديوهات', icon: <Video size={18} /> },
                        { id: 'article', label: 'مقالات', icon: <FileText size={18} /> },
                        { id: 'course', label: 'كورسات', icon: <GraduationCap size={18} /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any)
                                goToPage(1)
                            }}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all rounded-xl relative ${activeTab === tab.id
                                ? 'text-[#0095D9] bg-sky-50/50'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span>{tab.label}</span>
                            {tab.icon}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#0095D9] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-[2.5rem] h-96 animate-pulse border border-gray-50 shadow-sm" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {paginatedArticles.map((item: ContentItem) => (
                                <div key={item.id} className="group bg-white rounded-[2.5rem] border border-gray-50 hover:border-sky-100 transition-all duration-500 shadow-sm hover:shadow-xl overflow-hidden flex flex-col">
                                    {/* Thumbnail Area */}
                                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 p-2">
                                        <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                                            {item.thumbnail_image ? (
                                                <img
                                                    src={typeof item.thumbnail_image === 'string' ? item.thumbnail_image : ''}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                                                    <LayoutGrid size={48} />
                                                </div>
                                            )}

                                            {/* Play Button Overlay for Videos */}
                                            {item.type === 'video' && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/50 group-hover:scale-110 transition-transform shadow-xl">
                                                        <Play fill="currentColor" size={24} className="ms-1" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status Badge */}
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase backdrop-blur-md text-white border border-white/30 shadow-lg ${item.status === 'published' ? 'bg-teal-500/80' : 'bg-amber-500/80'
                                                    }`}>
                                                    {item.status === 'published' ? (direction === 'rtl' ? 'منشور' : 'Published') : item.status}
                                                </span>
                                            </div>

                                            {/* Type Badge */}
                                            <div className="absolute top-4 left-4">
                                                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase backdrop-blur-md bg-slate-900/40 text-white border border-white/20 shadow-lg">
                                                    {item.type === 'video' ? 'فيديو' : t('content.add.type.article')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-8 flex-1 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-slate-400">
                                                <div className="flex items-center gap-4 text-[11px] font-bold">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={14} className="text-sky-500" />
                                                        <span>{item.duration || '12 دقيقة'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Users size={14} className="text-blue-500" />
                                                        <span>{direction === 'rtl' ? '860 مشاهدة' : '860 views'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {canCreate && (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setDeletingContentId(item.id || null); }}
                                                                className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors"
                                                            >
                                                                <MoreHorizontal size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setEditingContent(item); setView('edit'); }}
                                                                className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-100 transition-colors"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <h4 className="text-xl font-black text-slate-800 line-clamp-2 leading-relaxed text-start group-hover:text-[#35788D] transition-colors">
                                                {item.title || 'دليل النوم الصحي الشامل'}
                                            </h4>

                                            {/* Progress Bar Placeholder for Courses */}
                                            {item.type === 'course' && (
                                                <div className="space-y-2 pt-2">
                                                    <div className="flex justify-between text-[10px] font-black">
                                                        <span className="text-gray-400">75% مكتمل</span>
                                                        <span className="text-[#35788D]">12/16 درس</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 p-0.5">
                                                        <div className="h-full bg-linear-to-r from-sky-400 to-blue-500 rounded-full w-3/4" />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {(item.tags || ['نوم_سليم', 'صحة_الدماغ', 'طرق_النوم']).map((tag, i) => (
                                                    <span key={i} className="text-[10px] font-black text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100/50">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Author Footer */}
                                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full border border-gray-100 p-0.5 shadow-sm">
                                                    <img
                                                        src={item.author_avatar || `https://ui-avatars.com/api/?name=${item.author || 'A'}&background=35788D&color=fff`}
                                                        className="w-full h-full rounded-full object-cover"
                                                        alt="Author"
                                                    />
                                                </div>
                                                <div className="text-start">
                                                    <p className="text-sm font-black text-slate-800 leading-none mb-1">{item.author || 'أحمد عبدالله'}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{item.author_role || 'مختص طب النوم'}</p>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 hover:text-[#35788D] hover:bg-slate-50 transition-all cursor-pointer">
                                                <ChevronRight className={direction === 'rtl' ? 'rotate-180' : ''} size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredContent.length === 0 && (
                            <div className="col-span-full bg-white p-24 rounded-[3rem] text-center border-dashed border-4 border-slate-50 shadow-sm">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100/50">
                                    <BookOpen size={48} className="text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-4">{t('content.empty_library')}</h3>
                                {canCreate && (
                                    <button
                                        onClick={() => setView('add-selection')}
                                        className="text-[#0095D9] font-black text-lg hover:underline underline-offset-8"
                                    >
                                        {t('content.start_first_article')}
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="mt-12 flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-50 shadow-sm">
                            <p className="text-sm text-gray-400 font-bold">
                                {direction === 'rtl' ? (
                                    `عرض ${Math.min(paginatedArticles.length, 9)}-1 من أصل ${filteredContent.length} مادة`
                                ) : (
                                    `Showing 1-${Math.min(paginatedArticles.length, 9)} of ${filteredContent.length} items`
                                )}
                            </p>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={goToPage}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deletingContentId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-panel max-w-sm w-full bg-white/90 backdrop-blur-xl shadow-2xl scale-in-center overflow-hidden border-rose-100/50">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-rose-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-800">{t('content.delete_confirm_title')}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                    {t('content.delete_confirm_desc')}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <button
                                    onClick={confirmDelete}
                                    className="w-full py-3 px-4 bg-rose-600 text-white rounded-xl font-black text-sm shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {t('content.confirm_delete')}
                                </button>
                                <button
                                    onClick={() => setDeletingContentId(null)}
                                    className="w-full py-3 px-4 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    {t('content.cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
