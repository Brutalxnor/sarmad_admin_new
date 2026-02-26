import { useState, useRef } from 'react'
import { useCreateSection, useCreateLesson, useCourse } from '../hooks/use-courses'
import { useLinkFilter } from '@/features/content/hooks/use-filters'
import { FilterSelector } from '@/shared/components/FilterSelector'
import { Lock, Video, FileText, Book, Clock, Settings, GraduationCap, Type, ImageIcon, X } from 'lucide-react'
import { RichTextEditor } from '@/shared/components/RichTextEditor'

interface CourseCurriculumProps {
    courseId: string | null
}

export function CourseCurriculum({ courseId }: CourseCurriculumProps) {
    const { data: course, isLoading } = useCourse(courseId || '')
    const { mutate: createSection, isPending: isCreatingSection } = useCreateSection()
    const { mutate: createLesson, isPending: isCreatingLesson } = useCreateLesson()
    const { mutate: linkFilter } = useLinkFilter()

    const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])
    const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([])
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

    const [newSectionTitle, setNewSectionTitle] = useState('')
    const [addingSection, setAddingSection] = useState(false)

    const [newLessonTitle, setNewLessonTitle] = useState('')
    const [newLessonType, setNewLessonType] = useState<'video' | 'article' | 'pdf'>('article')
    const [newLessonBody, setNewLessonBody] = useState('')
    const [newLessonUrl, setNewLessonUrl] = useState('')
    const [newLessonDuration, setNewLessonDuration] = useState(0)
    const [newLessonIsPreview, setNewLessonIsPreview] = useState(false)
    const [newLessonThumbnail, setNewLessonThumbnail] = useState<File | null>(null)
    const [newLessonThumbnailPreview, setNewLessonThumbnailPreview] = useState<string | null>(null)
    const lessonFileInputRef = useRef<HTMLInputElement>(null)
    const [addingLessonToSection, setAddingLessonToSection] = useState<string | null>(null)

    if (!courseId) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-50 text-slate-200">
                    <Lock size={40} />
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
            type: newLessonType,
            description: newLessonBody,
            media_url: newLessonUrl,
            duration: newLessonDuration,
            is_preview: newLessonIsPreview,
            order_index: (section?.lessons?.length || 0) + 1,
            thumbnail_image: newLessonThumbnail || undefined
        }, {
            onSuccess: (newLesson) => {
                // Link filters to the new lesson
                const allFilterIds = [...selectedTopicIds, ...selectedSegmentIds, ...selectedTagIds]
                if (newLesson && newLesson.id && allFilterIds.length > 0) {
                    allFilterIds.forEach(filterId => {
                        linkFilter({ type: 'lesson', lesson_id: newLesson.id, filter_id: filterId })
                    })
                }

                setNewLessonTitle('')
                setNewLessonBody('')
                setNewLessonUrl('')
                setNewLessonDuration(0)
                setNewLessonIsPreview(false)
                setNewLessonThumbnail(null)
                setNewLessonThumbnailPreview(null)
                setAddingLessonToSection(null)
                setSelectedTopicIds([])
                setSelectedSegmentIds([])
                setSelectedTagIds([])
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
                                className="text-xs font-black text-brand-600 hover:bg-brand-600 hover:text-white bg-white border border-brand-100 px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-2"
                            >
                                <span>+ إضافة درس</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-3">
                            {addingLessonToSection === section.id && (
                                <div className="mb-6 space-y-4 p-5 bg-brand-50/30 rounded-2xl border border-brand-100/50 animate-slide-up shadow-inner text-start">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">صورة الدرس (Thumbnail)</label>
                                            <div
                                                onClick={() => lessonFileInputRef.current?.click()}
                                                className="w-full aspect-[21/9] rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-brand-500 transition-all overflow-hidden group relative"
                                            >
                                                {newLessonThumbnailPreview ? (
                                                    <div className="relative w-full h-full">
                                                        <img src={newLessonThumbnailPreview} alt="Lesson Preview" className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setNewLessonThumbnail(null);
                                                                setNewLessonThumbnailPreview(null);
                                                            }}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center space-y-1">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto group-hover:text-brand-600">
                                                            <ImageIcon size={18} />
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-600">انقر لرفع صورة الدرس</p>
                                                        <p className="text-[8px] font-bold text-slate-400">مثالية بمقاس 1280x720 بكسل</p>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    ref={lessonFileInputRef}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setNewLessonThumbnail(file);
                                                            setNewLessonThumbnailPreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-4 pt-2 border-t border-brand-100/30">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FilterSelector
                                                    type="topic"
                                                    label="التصنيف (Topic)"
                                                    selectedIds={selectedTopicIds}
                                                    onChange={setSelectedTopicIds}
                                                    placeholder="اختر التصنيف..."
                                                />
                                                <FilterSelector
                                                    type="segment"
                                                    label="الشرائح المستهدفة (Segment)"
                                                    selectedIds={selectedSegmentIds}
                                                    onChange={setSelectedSegmentIds}
                                                    multiple
                                                    placeholder="اختر الشرائح..."
                                                />
                                            </div>
                                            <FilterSelector
                                                type="tag"
                                                label="الكلمات الدالة (Tags)"
                                                selectedIds={selectedTagIds}
                                                onChange={setSelectedTagIds}
                                                multiple
                                                placeholder="أضف كلمات دالة..."
                                            />
                                        </div>
                                    </div>

                                    {newLessonType === 'article' ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Type size={14} className="text-brand-500" />
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">محتوى الدرس</label>
                                            </div>
                                            <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden shadow-sm">
                                                <RichTextEditor
                                                    value={newLessonBody}
                                                    onChange={content => setNewLessonBody(content)}
                                                    placeholder="اكتب المحتوى التعليمي هنا بالتفصيل واستخدم أدوات التنسيق..."
                                                    minHeight="200px"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
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
                                        <label className="flex items-center gap-3 cursor-pointer group/toggle">
                                            <div className="relative group/knob">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={newLessonIsPreview}
                                                    onChange={e => setNewLessonIsPreview(e.target.checked)}
                                                />
                                                <div className="w-12 h-6 bg-slate-200 rounded-full transition-all duration-300 peer-checked:bg-emerald-500 shadow-inner group-hover/toggle:ring-4 group-hover/toggle:ring-brand-500/10" />
                                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:left-7 shadow-md group-hover/knob:scale-110" />
                                            </div>
                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wide transition-colors group-hover/toggle:text-brand-600">الدرس متاح للمعاينة مجاناً</span>
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
                                        <div className="w-20 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-xs group-hover/lesson:scale-105 transition-transform overflow-hidden relative">
                                            {lesson.thumbnail_image ? (
                                                <img src={lesson.thumbnail_image as string} className="w-full h-full object-cover" alt={lesson.title} />
                                            ) : (
                                                lesson.type === 'video' ? <Video size={20} /> : lesson.type === 'pdf' ? <FileText size={20} /> : <Book size={20} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-base font-bold text-slate-800 tracking-tight">{lesson.title}</p>
                                                {lesson.is_preview && (
                                                    <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-black border border-emerald-100 uppercase tracking-tight">معاينة مجانية</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {lesson.duration ? (
                                                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold bg-slate-100/50 px-2 py-0.5 rounded-lg">
                                                        <Clock size={12} /> {lesson.duration} دقيقة
                                                    </span>
                                                ) : null}
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                                    {lesson.type === 'video' ? 'فيديو' : lesson.type === 'pdf' ? 'ملف' : 'مقال'}
                                                </span>
                                            </div>
                                        </div>
                                        <button type="button" className="p-2 text-slate-300 hover:text-brand-600 opacity-0 group-hover/lesson:opacity-100 transition-all">
                                            <Settings size={18} />
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
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-50 text-slate-200">
                            <GraduationCap size={40} />
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
