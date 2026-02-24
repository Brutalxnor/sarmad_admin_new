import { useState } from 'react'
import { useCreateSection, useCreateLesson, useCourse } from '../hooks/use-courses'

interface CourseCurriculumProps {
    courseId: string | null
}

export function CourseCurriculum({ courseId }: CourseCurriculumProps) {
    const { data: course, isLoading } = useCourse(courseId || '')
    const { mutate: createSection, isPending: isCreatingSection } = useCreateSection()
    const { mutate: createLesson, isPending: isCreatingLesson } = useCreateLesson()

    const [newSectionTitle, setNewSectionTitle] = useState('')
    const [addingSection, setAddingSection] = useState(false)

    const [newLessonTitle, setNewLessonTitle] = useState('')
    const [newLessonType, setNewLessonType] = useState<'video' | 'article' | 'pdf'>('article')
    const [newLessonBody, setNewLessonBody] = useState('')
    const [newLessonUrl, setNewLessonUrl] = useState('')
    const [newLessonDuration, setNewLessonDuration] = useState(0)
    const [newLessonIsPreview, setNewLessonIsPreview] = useState(false)
    const [addingLessonToSection, setAddingLessonToSection] = useState<string | null>(null)

    if (!courseId) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-50">
                    <span className="text-4xl text-slate-200">🔒</span>
                </div>
                <h3 className="text-xl font-black text-slate-400 mb-2">المنهج غير متاح حالياً</h3>
                <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">
                    يرجى البدء بحفظ المعلومات الأساسية للدورة أولاً لتتمكن من بناء هيكل المنهج التعليمي.
                </p>
            </div>
        )
    }

    const handleCreateSection = () => {
        if (!newSectionTitle.trim()) return
        createSection({
            course_id: courseId,
            title: newSectionTitle,
            order_index: (course?.sections?.length || 0) + 1
        }, {
            onSuccess: () => {
                setNewSectionTitle('')
                setAddingSection(false)
            }
        })
    }

    const handleCreateLesson = (sectionId: string) => {
        if (!newLessonTitle.trim()) return
        const section = course?.sections?.find(s => s.id === sectionId)
        createLesson({
            section_id: sectionId,
            title: newLessonTitle,
            content_type: newLessonType,
            body: newLessonBody,
            content_url: newLessonUrl,
            duration_minutes: newLessonDuration,
            is_preview: newLessonIsPreview,
            order_index: (section?.lessons?.length || 0) + 1
        }, {
            onSuccess: () => {
                setNewLessonTitle('')
                setNewLessonBody('')
                setNewLessonUrl('')
                setNewLessonDuration(0)
                setNewLessonIsPreview(false)
                setAddingLessonToSection(null)
            }
        })
    }

    if (isLoading) return (
        <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h4 className="text-xl font-black text-slate-800 tracking-tight">هيكل الدورة التدريبية</h4>
                {!addingSection && (
                    <button
                        type="button"
                        onClick={() => setAddingSection(true)}
                        className="group flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-2 rounded-xl font-bold hover:bg-brand-600 hover:text-white transition-all duration-300"
                    >
                        <span>+ إضافة قسم جديد</span>
                    </button>
                )}
            </div>

            {addingSection && (
                <div className="glass-panel p-6 space-y-4 animate-slide-up border-brand-100 bg-brand-50/10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block text-start">عنوان القسم الجديد</label>
                        <input
                            type="text"
                            value={newSectionTitle}
                            onChange={e => setNewSectionTitle(e.target.value)}
                            className="input-modern w-full"
                            placeholder="مثال: مقدمة في العلوم، الفصل الأول..."
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setAddingSection(false)}
                            className="px-4 py-2 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateSection}
                            disabled={isCreatingSection}
                            className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all"
                        >
                            {isCreatingSection ? 'جاري الحفظ...' : 'حفظ القسم'}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {course?.sections?.map((section) => (
                    <div key={section.id} className="border-2 border-slate-50 rounded-[2rem] overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 group/section">
                        <div className="bg-slate-50/50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
                            <h5 className="font-black text-slate-700 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-bold shadow-xs">
                                    {section.order_index}
                                </span>
                                {section.title}
                            </h5>
                            <button
                                type="button"
                                onClick={() => setAddingLessonToSection(section.id || null)}
                                className="text-xs font-black text-brand-600 hover:text-brand-700 bg-white border border-brand-100 px-3 py-1.5 rounded-lg shadow-xs transition-all opacity-0 group-hover/section:opacity-100"
                            >
                                + درس جديد
                            </button>
                        </div>

                        <div className="p-6 space-y-3">
                            {addingLessonToSection === section.id && (
                                <div className="mb-6 space-y-4 p-5 bg-brand-50/30 rounded-2xl border border-brand-100/50 animate-slide-up shadow-inner">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">عنوان الدرس</label>
                                            <input
                                                type="text"
                                                value={newLessonTitle}
                                                onChange={e => setNewLessonTitle(e.target.value)}
                                                className="input-modern w-full"
                                                placeholder="أدخل عنوان الدرس..."
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">نوع المحتوى</label>
                                            <select
                                                value={newLessonType}
                                                onChange={e => setNewLessonType(e.target.value as any)}
                                                className="input-modern w-full"
                                            >
                                                <option value="article">نص تعليمي (Article)</option>
                                                <option value="video">فيديو (Video Lesson)</option>
                                                <option value="pdf">ملف (PDF/Document)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">المدة المقدرة (بالدقائق)</label>
                                            <input
                                                type="number"
                                                value={newLessonDuration}
                                                onChange={e => setNewLessonDuration(Number(e.target.value))}
                                                className="input-modern w-full"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    {newLessonType === 'article' ? (
                                        <div className="space-y-2 text-start">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">محتوى الدرس</label>
                                            <textarea
                                                value={newLessonBody}
                                                onChange={e => setNewLessonBody(e.target.value)}
                                                className="input-modern w-full min-h-[120px] resize-none"
                                                placeholder="اكتب المحتوى التعليمي هنا بالتفصيل..."
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-start">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">رابط المحتوى (URL)</label>
                                            <input
                                                type="text"
                                                value={newLessonUrl}
                                                onChange={e => setNewLessonUrl(e.target.value)}
                                                className="input-modern w-full"
                                                placeholder="أدخل رابط الفيديو أو الملف..."
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-brand-100/30">
                                        <label className="flex items-center gap-2 cursor-pointer group/toggle">
                                            <div className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 ${newLessonIsPreview ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${newLessonIsPreview ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={newLessonIsPreview}
                                                onChange={e => setNewLessonIsPreview(e.target.checked)}
                                            />
                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wide">الدرس متاح للمعاينة مجاناً</span>
                                        </label>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setAddingLessonToSection(null)}
                                                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                                            >
                                                إلغاء
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCreateLesson(section.id!)}
                                                disabled={isCreatingLesson}
                                                className="px-6 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20"
                                            >
                                                {isCreatingLesson ? 'جاري الحفظ...' : 'إضافة الدرس'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-3">
                                {section.lessons?.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all duration-300 group/lesson border border-transparent hover:border-slate-100 text-start">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xl shadow-xs group-hover/lesson:scale-110 transition-transform">
                                            {lesson.content_type === 'video' ? '🎥' : lesson.content_type === 'pdf' ? '📁' : '📖'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-base font-bold text-slate-800 tracking-tight">{lesson.title}</p>
                                                {lesson.is_preview && (
                                                    <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black border border-emerald-100 uppercase tracking-widest">Preview</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {lesson.duration_minutes ? (
                                                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold bg-slate-100/50 px-2 py-0.5 rounded-lg">
                                                        <span className="text-xs">⏱️</span> {lesson.duration_minutes} دقيقة
                                                    </span>
                                                ) : null}
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                                    {lesson.content_type === 'video' ? 'فيديو' : lesson.content_type === 'pdf' ? 'ملف' : 'مقال'}
                                                </span>
                                            </div>
                                        </div>
                                        <button type="button" className="p-2 text-slate-300 hover:text-brand-600 opacity-0 group-hover/lesson:opacity-100 transition-all">
                                            ⚙️
                                        </button>
                                    </div>
                                ))}

                                {(!section.lessons || section.lessons.length === 0) && !addingLessonToSection && (
                                    <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-xs text-slate-400 font-bold mb-2">لا توجد دروس في هذا القسم بعد</p>
                                        <button
                                            type="button"
                                            onClick={() => setAddingLessonToSection(section.id || null)}
                                            className="text-xs font-black text-brand-600 hover:underline"
                                        >
                                            إضافة أول درس
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {(!course?.sections || course?.sections.length === 0) && !addingSection && (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100 animate-pulse">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-50">
                            <span className="text-4xl text-slate-200">📚</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-400 mb-2">منهج الدورة فارغ</h3>
                        <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto mb-8">
                            ابدأ ببناء هيكل الدورة التدريبية من خلال إضافة الأقسام والدروس لطلابك.
                        </p>
                        <button
                            type="button"
                            onClick={() => setAddingSection(true)}
                            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-brand-600 transition-all shadow-xl shadow-slate-200"
                        >
                            تحديد أول قسم
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
