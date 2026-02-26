import { useState, useEffect, useRef } from 'react'
import { useCreateCourse, useUpdateCourse } from '../hooks/use-courses'
import type { Course } from '../types'
import { RichTextEditor } from '@/shared/components/RichTextEditor'
import { CourseCurriculum } from './CourseCurriculum'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useCallback } from 'react'
import { useFiltersByItem, useLinkFilter, useUnlinkFilter } from '@/features/content/hooks/use-filters'
import { FilterSelector } from '@/shared/components/FilterSelector'
import { FileText, GraduationCap, Globe, Lock, ImageIcon, ArrowRight, CheckCircle } from 'lucide-react'

interface CreateCourseFormProps {
    initialData?: Partial<Course>
    onSuccess?: () => void
    onCancel?: () => void
}

export function CreateCourseForm({ initialData, onSuccess, onCancel }: CreateCourseFormProps) {
    const { mutate: createCourse, isPending: isCreating } = useCreateCourse()
    const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse()
    const { language } = useLanguage()

    const { data: linkedFilters = [] } = useFiltersByItem('content', initialData?.id || '')
    const { mutate: linkFilter } = useLinkFilter()
    const { mutate: unlinkFilter } = useUnlinkFilter()

    const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])
    const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([])
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

    // Initialize selections from linked filters
    // Initialize selections from linked filters
    useEffect(() => {
        if (linkedFilters.length > 0) {
            const topics = linkedFilters.filter(f => f.type === 'topic').map(f => f.id)
            const segments = linkedFilters.filter(f => f.type === 'segment').map(f => f.id)
            const tags = linkedFilters.filter(f => f.type === 'tag').map(f => f.id)

            setSelectedTopicIds(prev => JSON.stringify(prev) !== JSON.stringify(topics) ? topics : prev)
            setSelectedSegmentIds(prev => JSON.stringify(prev) !== JSON.stringify(segments) ? segments : prev)
            setSelectedTagIds(prev => JSON.stringify(prev) !== JSON.stringify(tags) ? tags : prev)
        }
    }, [linkedFilters])

    const isPending = isCreating || isUpdating
    const isEditMode = !!initialData?.id
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.thumbnail_url || (initialData as Record<string, unknown>)?.thumbnail_image as string || null)

    const [formData, setFormData] = useState<Partial<Course>>({
        title: '',
        description: '',
        price: 0,
        access_type: 'public',
        category: '',
        duration: 0,
        ...initialData
    })

    const [activeTab, setActiveTab] = useState<'info' | 'curriculum'>('info')
    const [savedCourseId, setSavedCourseId] = useState<string | null>(initialData?.id || null)

    // Helper to get topic string and ID safely
    const getInitialTopicData = useCallback((data: Partial<Course> | undefined) => {
        const topic = data?.topic
        const topicId = data?.topic_id || (typeof topic === 'object' ? topic?.id : undefined)
        const topicName = typeof topic === 'object'
            ? (language === 'ar' ? topic?.name_ar : topic?.name_en)
            : (topic || data?.category || '')

        return { topicName, topicId }
    }, [language])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData(prev => ({ ...prev, thumbnail_url: file as unknown as string }))
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    useEffect(() => {
        if (!initialData || Object.keys(initialData).length === 0) {
            setFormData(prev => {
                const newData = {
                    title: '',
                    description: '',
                    price: 0,
                    status: 'draft',
                    level: 'beginner',
                    language: 'en',
                    duration: 0,
                    badge: '',
                    is_published: false
                };
                return JSON.stringify(prev) !== JSON.stringify(newData) ? newData : prev;
            });
            setPreviewUrl(null)
            setSavedCourseId(null)
            return
        }

        const { topicName } = getInitialTopicData(initialData)

        setFormData(prev => {
            const newData = {
                ...prev,
                ...initialData,
                title: initialData.title || '',
                description: initialData.description || '',
                price: initialData.price !== undefined ? Number(initialData.price) : 0,
                duration: initialData.duration || 0,
                category: topicName || '',
            };
            return JSON.stringify(prev) !== JSON.stringify(newData) ? newData : prev;
        });

        const thumb = typeof initialData.thumbnail_url === 'string' ? initialData.thumbnail_url : (typeof (initialData as Record<string, unknown>).thumbnail_image === 'string' ? (initialData as Record<string, unknown>).thumbnail_image as string : '')

        if (initialData.id) setSavedCourseId(initialData.id)
        if (thumb) {
            setPreviewUrl(thumb)
        } else {
            setPreviewUrl(null)
        }
    }, [initialData, language, getInitialTopicData])

    const handlePersistFilters = (itemId: string) => {
        const allNewIds = [...selectedTopicIds, ...selectedSegmentIds, ...selectedTagIds]
        const existingIds = linkedFilters.map(f => f.id)

        // Link new filters
        allNewIds.forEach(id => {
            if (!existingIds.includes(id)) {
                linkFilter({ type: 'content', content_id: itemId, filter_id: id })
            }
        })

        // Unlink removed filters
        existingIds.forEach(id => {
            if (!allNewIds.includes(id)) {
                unlinkFilter({ type: 'content', content_id: itemId, filter_id: id })
            }
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Clean up data before sending
        const payload = {
            ...formData,
        }
        // Remove topic_id if it exists to avoid backend UUID error
        delete (payload as any).topic_id;
        // Ensure price is a number
        if (payload.price) payload.price = Number(payload.price)

        if (isEditMode && initialData.id) {
            updateCourse({ id: initialData.id, data: payload }, {
                onSuccess: () => {
                    handlePersistFilters(initialData.id!)
                    if (onSuccess) onSuccess()
                }
            })
        } else {
            createCourse(payload, {
                onSuccess: (newCourse) => {
                    if (newCourse && newCourse.id) {
                        setSavedCourseId(newCourse.id)
                        handlePersistFilters(newCourse.id)
                        setActiveTab('curriculum')
                    }
                }
            })
        }
    }

    return (
        <div className="space-y-8 animate-fade-in text-start">
            {/* Tabs Header */}
            <div className="flex justify-center">
                <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-[2rem] border-2 border-slate-50 dark:border-slate-700/50 shadow-inner transition-colors duration-300">
                    <button
                        type="button"
                        onClick={() => setActiveTab('info')}
                        className={`px-8 py-3 rounded-[1.75rem] font-black text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === 'info'
                            ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xl shadow-slate-200/50 dark:shadow-none translate-z-0 scale-105'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        <FileText size={18} />
                        المعلومات الأساسية
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (savedCourseId) {
                                setActiveTab('curriculum')
                            } else {
                                // Provide feedback that they need to save info first
                                alert('يرجى حفظ المعلومات الأساسية أولاً لتتمكن من إضافة المنهج')
                            }
                        }}
                        className={`px-8 py-3 rounded-[1.75rem] font-black text-sm transition-all duration-300 relative flex items-center gap-2 ${activeTab === 'curriculum'
                            ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xl shadow-slate-200/50 dark:shadow-none translate-z-0 scale-105'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        <GraduationCap size={18} />
                        منهج الدورة
                        {!savedCourseId && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {activeTab === 'info' ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="glass-panel p-8 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 block text-start uppercase tracking-wider">عنوان الدورة</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="input-modern w-full text-xl py-4 font-bold"
                                        placeholder="أدخل عنواناً جذاباً للدورة التعليمية..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 block text-start uppercase tracking-wider">وصف الدورة</label>
                                    <RichTextEditor
                                        value={formData.description || ''}
                                        onChange={content => setFormData(prev => ({ ...prev, description: content }))}
                                        placeholder="اكتب وصفاً شاملاً للمحتوى التعليمي والأهداف..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Settings */}
                        <div className="space-y-6 text-start">
                            <div className="glass-panel p-8 space-y-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-slate-700 block uppercase tracking-wider">نوع الوصول</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { id: 'public', label: 'عام (Public)', icon: <Globe size={20} /> },
                                            { id: 'members_only', label: 'للمشتركين فقط', icon: <Lock size={20} /> }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, access_type: opt.id as 'public' | 'members_only' }))}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${formData.access_type === opt.id
                                                    ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 dark:border-brand-500/50 text-brand-700 dark:text-brand-400 shadow-lg shadow-brand-500/10'
                                                    : 'bg-white dark:bg-slate-900/50 border-slate-50 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-600'
                                                    }`}
                                            >
                                                <span className={formData.access_type === opt.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-300 dark:text-slate-600'}>
                                                    {opt.icon}
                                                </span>
                                                <span className="font-bold text-sm">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-black text-slate-700 block uppercase tracking-wider">السعر التقديري</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                            className="input-modern w-full py-4 text-center text-2xl font-black text-brand-600 disabled:opacity-30 disabled:grayscale transition-all"
                                            placeholder="0.00"
                                            disabled={formData.access_type === 'public'}
                                        />
                                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300 transition-opacity ${formData.access_type === 'public' ? 'opacity-0' : 'opacity-100'}`}>SAR</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold text-center">سيتم تجاهل السعر إذا كان نوع الوصول "عام"</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-black text-slate-700 block uppercase tracking-wider">الصورة التعريفية (Thumbnail)</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900/40 border-2 border-slate-50 dark:border-slate-700/50 hover:border-brand-200 dark:hover:border-brand-500/30 transition-all cursor-pointer"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        {previewUrl ? (
                                            <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-slate-50 dark:from-slate-800 to-slate-100 dark:to-slate-900">
                                                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                                                <div className="flex flex-col items-center gap-2 z-10">
                                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-600">
                                                        <ImageIcon size={24} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4">انقر لرفع صورة الغلاف</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-brand-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="bg-white/90 px-4 py-2 rounded-xl text-xs font-black text-brand-600 shadow-xl">
                                                تغيير الصورة
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            إلغاء التعديلات
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-12 py-4 bg-slate-950 text-white rounded-[2rem] font-black shadow-2xl shadow-slate-200 hover:bg-brand-600 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center gap-4"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    جاري المعالجة...
                                </>
                            ) : (
                                <>
                                    <span>{isEditMode ? 'تحديث وحفظ' : 'إنشاء الدورة والمتابعة'}</span>
                                    {!isEditMode && <ArrowRight size={20} className="rotate-180" />}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="animate-slide-up">
                    <CourseCurriculum courseId={savedCourseId!} />

                    <div className="flex justify-center pt-12 mt-12 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onSuccess}
                            className="px-12 py-4 bg-emerald-600 text-white rounded-[2rem] font-black shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all hover:-translate-y-1 flex items-center gap-3"
                        >
                            <CheckCircle size={20} />
                            تم الانتهاء من بناء الدورة
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
