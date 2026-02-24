import { useState } from 'react'
import { useCourses, useDeleteCourse } from '../hooks/use-courses'
import { CreateCourseForm } from './CreateCourseForm'
import { CourseDetailsModal } from './CourseDetailsModal'
import type { Course } from '../types'
import { useLanguage } from '@/shared/context/LanguageContext'

import { usePagination } from '@/shared/hooks/use-pagination'
import { Pagination } from '@/shared/components/Pagination'

interface CourseListProps {
    hideHeader?: boolean
}

export function CourseList({ hideHeader }: CourseListProps) {
    const { data: courses, isLoading } = useCourses()
    const { mutate: deleteCourse } = useDeleteCourse()
    const { language } = useLanguage()
    const [isCreating, setIsCreating] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)
    const [viewingCourseId, setViewingCourseId] = useState<string | null>(null)
    const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null)

    // Pagination
    const { currentData: paginatedCourses, currentPage, totalPages, goToPage } = usePagination<Course>({
        data: courses || [],
        itemsPerPage: 9
    })

    const handleDelete = (id: string) => {
        setDeletingCourseId(id)
    }

    const confirmDelete = () => {
        if (deletingCourseId) {
            deleteCourse(deletingCourseId)
            setDeletingCourseId(null)
        }
    }

    if (isCreating || editingCourse) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setIsCreating(false)
                            setEditingCourse(null)
                        }}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-3xl font-extrabold text-slate-800">
                        {editingCourse ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
                    </h1>
                </div>
                <CreateCourseForm
                    initialData={editingCourse || undefined}
                    onSuccess={() => {
                        setIsCreating(false)
                        setEditingCourse(null)
                    }}
                    onCancel={() => {
                        setIsCreating(false)
                        setEditingCourse(null)
                    }}
                />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {!hideHeader && (
                <div className="flex justify-between items-center mb-10">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">إدارة الدورات</h1>
                        <p className="text-sm text-slate-500 font-bold px-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                            {courses?.length || 0} دورة متاحة
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="group bg-slate-900 hover:bg-brand-600 text-white flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-300 shadow-2xl shadow-slate-200 hover:-translate-y-1 active:translate-y-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="font-black text-lg">دورة جديدة</span>
                    </button>
                </div>
            )}

            {hideHeader && (
                <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-slate-500 font-bold px-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                        {courses?.length || 0} دورة متاحة
                    </p>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="group bg-slate-900 hover:bg-brand-600 text-white flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="font-black text-sm">دورة جديدة</span>
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-[2rem] h-64 animate-pulse border-2 border-slate-50" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedCourses.map((course: Course) => (
                            <div key={course.id} className="group bg-white rounded-[2rem] border-2 border-slate-50 hover:border-brand-100 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-brand-100/20 overflow-hidden flex flex-col">
                                {/* Thumbnail Area */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                                            {/* Premium Placeholder Background */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-brand-50/30" />
                                            <div className="absolute inset-0 opacity-[0.03] rotate-12 scale-150" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                                            <div className="relative flex flex-col items-center gap-4 transition-transform duration-700 group-hover:scale-110">
                                                <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-slate-200 flex items-center justify-center text-3xl">
                                                    📚
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Sarmad Academy</span>
                                                    <div className="h-0.5 w-8 bg-brand-500/20 rounded-full mt-1" />
                                                </div>
                                            </div>

                                            {/* Decorative elements */}
                                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-500/5 rounded-full blur-3xl" />
                                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-3xl" />
                                        </div>
                                    )}

                                    {/* Overlay Badges */}
                                    <div className="absolute inset-x-0 top-0 p-4 flex justify-between items-start pointer-events-none">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border ${course.access_type === 'public'
                                            ? 'bg-emerald-500/90 text-white border-emerald-400/50'
                                            : 'bg-indigo-500/90 text-white border-indigo-400/50'
                                            }`}>
                                            {course.access_type === 'public' ? 'عام' : 'للمشتركين'}
                                        </span>
                                        <div className="flex flex-col gap-2 items-end">
                                            <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl shadow-lg border border-white/50 flex items-center gap-2">
                                                <span className="text-[9px] font-black text-brand-600 uppercase">
                                                    {course.access_type === 'public' ? 'مجاني' : (course.price ? `${course.price} EGP` : 'تواصل معنا')}
                                                </span>
                                            </div>
                                            {(course.topic || course.category) && (
                                                <div className="bg-slate-900/40 backdrop-blur-md px-2 py-1 rounded-xl shadow-lg border border-white/20">
                                                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">
                                                        {typeof course.topic === 'object'
                                                            ? (language === 'ar' ? course.topic.name_ar : course.topic.name_en)
                                                            : (course.topic || course.category)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors duration-300">
                                            {course.title}
                                        </h4>
                                        <p className="text-sm text-slate-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: course.description }} />
                                    </div>

                                    {/* Divider & Actions */}
                                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (course.id) setViewingCourseId(course.id);
                                            }}
                                            className="text-xs font-black text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-2 rounded-xl transition-all"
                                        >
                                            إدارة المحتوى
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCourse(course);
                                                }}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-all duration-300"
                                                title="تعديل"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (course.id) handleDelete(course.id);
                                                }}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300"
                                                title="حذف"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!courses || courses.length === 0) && (
                            <div className="col-span-full glass-panel p-24 text-center border-dashed border-4 border-slate-100">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">لا يوجد دورات حالياً</h3>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="mt-4 text-brand-600 font-black text-lg hover:underline underline-offset-8"
                                >
                                    ابدأ بإضافة أول دورة
                                </button>
                            </div>
                        )}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                    />
                </>
            )}

            {/* Content Management Modal */}
            <CourseDetailsModal
                courseId={viewingCourseId}
                isOpen={!!viewingCourseId}
                onClose={() => setViewingCourseId(null)}
            />

            {/* Custom Delete Confirmation Modal */}
            {deletingCourseId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-panel max-w-sm w-full bg-white/90 backdrop-blur-xl shadow-2xl scale-in-center overflow-hidden border-rose-100/50">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-rose-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-800">تأكيد الحذف</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                    هل أنت متأكد من رغبتك في حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <button
                                    onClick={confirmDelete}
                                    className="w-full py-3 px-4 bg-rose-600 text-white rounded-xl font-black text-sm shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    حذف نهائي
                                </button>
                                <button
                                    onClick={() => setDeletingCourseId(null)}
                                    className="w-full py-3 px-4 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
