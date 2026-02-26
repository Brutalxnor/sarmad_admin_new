import { useState, useRef, useEffect } from 'react'
import { useCreateArticle, useUpdateArticle } from '../hooks/use-content'
import { useFiltersByItem, useLinkFilter, useUnlinkFilter } from '@/features/content/hooks/use-filters'
import { FilterSelector } from '@/shared/components/FilterSelector'
import type { ContentItem } from '../types'
import { RichTextEditor } from '@/shared/components/RichTextEditor'
import { useLanguage } from '@/shared/context/LanguageContext'
import { ArrowLeft, Image as ImageIcon, Eye, Save, UserRound } from 'lucide-react'

interface CreateContentFormProps {
    initialData?: Partial<ContentItem>
    onSuccess?: () => void
    onCancel?: () => void
}

export function CreateContentForm({ initialData, onSuccess, onCancel }: CreateContentFormProps) {
    const { mutate: createContent, isPending: isCreating } = useCreateArticle()
    const { mutate: updateContent, isPending: isUpdating } = useUpdateArticle()
    const { direction, language } = useLanguage()

    const { data: linkedFilters = [] } = useFiltersByItem('content', initialData?.id || '')
    const { mutate: linkFilter } = useLinkFilter()
    const { mutate: unlinkFilter } = useUnlinkFilter()

    const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])
    const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([])
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

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

    // Helper to extract topic ID and name Safely
    const getInitialTopicData = (data: Partial<ContentItem> | undefined) => {
        if (!data) return { topicId: undefined, topicName: '' }

        const topic = data.topic
        const topicIdFromData = data.topic_id

        // If topic is an object, it's the joined Topic from backend
        if (topic && typeof topic === 'object') {
            const topicId = topicIdFromData || topic.id || ''
            const topicName = language === 'ar' ? (topic.name_ar || topic.name_en) : (topic.name_en || topic.name_ar)
            return { topicId, topicName }
        }

        // If topic is a string, it might be a legacy name
        const topicName = typeof topic === 'string' ? topic : ''
        return { topicId: topicIdFromData || undefined, topicName }
    }

    const { topicName: initialTopicName } = getInitialTopicData(initialData)

    const [formData, setFormData] = useState<Partial<ContentItem>>({
        type: 'article',
        title: '',
        language: 'ar',
        status: 'draft',
        description: '',
        duration: '',
        media_url: '',
        author: '',
        access_type: 'public',
        segments: initialData?.segments || [],
        ...initialData,
        topic: initialTopicName,
    })

    function processPreviewUrl(image: string | File | undefined) {
        if (typeof image === 'string') return image
        return null
    }

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        processPreviewUrl(initialData?.thumbnail_image)
    )

    useEffect(() => {
        if (initialData) {
            const { topicName } = getInitialTopicData(initialData)

            setFormData(prev => ({
                ...prev,
                ...initialData,
                topic: topicName,
            }))

            if (initialData.thumbnail_image && typeof initialData.thumbnail_image === 'string') {
                setPreviewUrl(initialData.thumbnail_image)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData, language])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData(prev => ({ ...prev, thumbnail_image: file }))
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

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

        const submitData = {
            ...formData,
        }
        // Remove topic_id if it exists in formData to avoid backend UUID error
        delete (submitData as any).topic_id;

        if (isEditMode && initialData?.id) {
            updateContent({ id: initialData.id, data: submitData }, {
                onSuccess: () => {
                    handlePersistFilters(initialData.id!)
                    onSuccess?.()
                }
            })
        } else {
            createContent(submitData, {
                onSuccess: (newContent) => {
                    if (newContent && newContent.id) {
                        handlePersistFilters(newContent.id)
                    }
                    onSuccess?.()
                }
            })
        }
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-10 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
            {/* Top Navigation / Breadcrumbs */}
            <div className={`flex mb-8 ${direction === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="text-slate-800 dark:text-slate-100 font-black transition-colors duration-300">
                        {formData.type === 'video'
                            ? (language === 'ar' ? 'إضافة فيديو' : 'Add Video')
                            : (language === 'ar' ? 'إضافة مقال' : 'Add Article')}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600 mx-2 transition-colors duration-300">|</span>
                    <button type="button" onClick={onCancel} className="text-slate-400 dark:text-slate-500 hover:text-[#35788D] dark:hover:text-[#4AA0BA] transition-colors flex items-center gap-1">
                        <ArrowLeft size={14} className={direction === 'rtl' ? '' : 'rotate-180'} />
                        {language === 'ar' ? 'العودة لإدارة المحتوى' : 'Back to Content'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                {/* Main Content Area (8 cols) - In RTL this will be on the RIGHT */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-slate-700/50 space-y-8 transition-colors duration-300">
                    {formData.type === 'video' ? (
                        <>
                            {/* Video Title */}
                            <div className="space-y-2">
                                <label className="text-base font-bold text-slate-800 dark:text-slate-200 block text-start transition-colors duration-300">عنوان الفيديو</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 text-sm font-black text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-4 focus:ring-[#35788D]/10 dark:focus:ring-[#4AA0BA]/10 focus:border-[#35788D] dark:focus:border-[#4AA0BA] transition-all text-start"
                                    placeholder="مثلاً: كيف تحسن جودة نومك في 7 خطوات بسيطة"
                                />
                            </div>

                            {/* Link and Duration Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 dark:text-slate-200 block text-start transition-colors duration-300">رابط الفيديو</label>
                                    <input
                                        type="text"
                                        value={formData.media_url || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 text-sm font-black text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-4 focus:ring-[#35788D]/10 dark:focus:ring-[#4AA0BA]/10 focus:border-[#35788D] dark:focus:border-[#4AA0BA] transition-all text-start"
                                        placeholder="مثلاً: https://www.youtube.com/vide-675"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 dark:text-slate-200 block text-start transition-colors duration-300">مدة الفيديو</label>
                                    <input
                                        type="text"
                                        value={formData.duration || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                                        className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 text-sm font-black text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-4 focus:ring-[#35788D]/10 dark:focus:ring-[#4AA0BA]/10 focus:border-[#35788D] dark:focus:border-[#4AA0BA] transition-all text-start"
                                        placeholder="مثلاً: 12:45 دقيقة"
                                    />
                                </div>
                            </div>

                            {/* Filter Selectors Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FilterSelector
                                    type="topic"
                                    label={language === 'ar' ? "التصنيف (Topic)" : "Topic"}
                                    selectedIds={selectedTopicIds}
                                    onChange={setSelectedTopicIds}
                                    placeholder={language === 'ar' ? "اختر التصنيف..." : "Select Topic..."}
                                />
                                <FilterSelector
                                    type="segment"
                                    label={language === 'ar' ? "الشرائح المستهدفة (Segment)" : "Target Segments"}
                                    selectedIds={selectedSegmentIds}
                                    onChange={setSelectedSegmentIds}
                                    multiple
                                    placeholder={language === 'ar' ? "اختر الشرائح..." : "Select Segments..."}
                                />
                            </div>

                            <FilterSelector
                                type="tag"
                                label={language === 'ar' ? "الكلمات الدالة (Tags)" : "Tags"}
                                selectedIds={selectedTagIds}
                                onChange={setSelectedTagIds}
                                multiple
                                placeholder={language === 'ar' ? "أضف كلمات دالة..." : "Add tags..."}
                            />

                            {/* Description Editor / Area */}
                            <div className="space-y-2">
                                <label className="text-base font-bold text-slate-800 dark:text-slate-200 block text-start transition-colors duration-300">وصف الفيديو</label>
                                <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm transition-colors duration-300">
                                    <RichTextEditor
                                        value={formData.description || ''}
                                        onChange={content => setFormData(prev => ({ ...prev, description: content }))}
                                        placeholder="اكتب وصفاً مفصلاً لمحتوى الفيديو والفوائد المتوقعة للمشاهد..."
                                        minHeight="250px"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Article Title */}
                            <div className="space-y-2">
                                <label className="text-base font-bold text-slate-800 dark:text-slate-200 block text-start transition-colors duration-300">
                                    {language === 'ar' ? 'عنوان المقال' : 'Article Title'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-white dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 text-sm font-black text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-slate-900 dark:focus:border-slate-500 focus:ring-0 transition-all text-start"
                                    placeholder={language === 'ar' ? 'مثلاً: كيف تحسن جودة نومك في 7 خطوات بسيطة' : 'e.g. How to improve sleep quality'}
                                />
                            </div>

                            {/* Author and Category Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 dark:text-slate-200 block text-start transition-colors duration-300">
                                        {language === 'ar' ? 'اسم الكاتب' : 'Author Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.author || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                                        className="w-full bg-[#F4F9FB]/50 dark:bg-slate-900/30 border border-gray-50 dark:border-slate-700/50 rounded-2xl p-4 text-sm font-black text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-4 focus:ring-[#35788D]/10 dark:focus:ring-[#4AA0BA]/10 transition-all text-start"
                                        placeholder={language === 'ar' ? 'مثلاً: محمد أمين' : 'e.g. John Doe'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <FilterSelector
                                        type="topic"
                                        label={language === 'ar' ? "التصنيف (Topic)" : "Topic"}
                                        selectedIds={selectedTopicIds}
                                        onChange={setSelectedTopicIds}
                                        placeholder={language === 'ar' ? "اختر التصنيف..." : "Select Topic..."}
                                    />
                                </div>
                            </div>

                            {/* Content Editor */}
                            <div className="space-y-2">
                                <label className="text-base font-bold text-slate-800 dark:text-slate-100 block text-start transition-colors">
                                    {language === 'ar' ? 'محتوى المقال' : 'Article Content'}
                                </label>
                                <div className="bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm transition-colors duration-300">
                                    <RichTextEditor
                                        value={formData.description || ''}
                                        onChange={content => setFormData(prev => ({ ...prev, description: content }))}
                                        placeholder={language === 'ar' ? 'ابدأ الكتابة هنا باللغة العربية ...' : 'Start typing here...'}
                                        minHeight="400px"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar (4 cols) - In RTL this will be on the LEFT */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Cover / Thumbnail Image */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-gray-50 dark:border-slate-700/50 flex flex-col items-center transition-colors duration-300">
                        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 block mb-4 uppercase tracking-wider text-center">
                            {formData.type === 'video' ? 'الصورة المصغرة (Thumbnail)' : (language === 'ar' ? 'صورة الغلاف' : 'Cover Image')}
                        </h3>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-sky-100 dark:border-slate-600 bg-[#F4F9FB]/50 dark:bg-slate-900/40 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F4F9FB] dark:hover:bg-slate-900/60 hover:border-[#35788D]/30 dark:hover:border-[#4AA0BA]/30 transition-all overflow-hidden group relative"
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-[#35788D] dark:text-[#4AA0BA] mx-auto group-hover:scale-110 transition-transform">
                                        <ImageIcon size={20} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">{language === 'ar' ? 'انقر لرفع الصورة' : 'Click to Upload'}</p>
                                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">JPG, PNG {language === 'ar' ? 'حتى 5 ميجابايت' : 'up to 5MB'}</p>
                                    </div>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                    </div>

                    {/* Presenter / Staff Input (For Video) */}
                    {formData.type === 'video' && (
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-gray-50 dark:border-slate-700/50 space-y-4 transition-colors duration-300">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 justify-end">
                                مقدم المحتوى
                                <UserRound size={14} />
                            </label>
                            <input
                                type="text"
                                className="w-full bg-[#F4F9FB] dark:bg-slate-900/50 border-none rounded-xl p-4 text-sm font-black text-end text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#35788D]/20 dark:focus:ring-[#4AA0BA]/20 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                placeholder="مثلاً: فاطمة محمد"
                                value={formData.author || ''}
                                onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                            />
                        </div>
                    )}

                    {/* Segments and Tags Selection Card (For Articles) */}
                    {formData.type === 'article' && (
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-gray-50 dark:border-slate-700/50 space-y-6 transition-colors duration-300">
                            <FilterSelector
                                type="segment"
                                label={language === 'ar' ? "الشرائح المستهدفة (Segment)" : "Target Segments"}
                                selectedIds={selectedSegmentIds}
                                onChange={setSelectedSegmentIds}
                                multiple
                                placeholder={language === 'ar' ? "اختر الشرائح..." : "Select Segments..."}
                            />
                            <FilterSelector
                                type="tag"
                                label={language === 'ar' ? "الكلمات الدالة (Tags)" : "Tags"}
                                selectedIds={selectedTagIds}
                                onChange={setSelectedTagIds}
                                multiple
                                placeholder={language === 'ar' ? "أضف كلمات دالة..." : "Add tags..."}
                            />
                        </div>
                    )}

                    {/* Settings Card */}
                    {(formData.type === 'article' || formData.type === 'video') && (
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-gray-50 dark:border-slate-700/50 space-y-6 transition-colors duration-300">
                            {/* Language */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 dark:text-slate-500 block text-start uppercase tracking-wider">{language === 'ar' ? 'اللغة' : 'Language'}</label>
                                <div className="flex bg-[#F4F9FB] dark:bg-slate-900/50 p-1.5 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, language: 'en' }))}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${formData.language === 'en' ? 'bg-white dark:bg-slate-700 text-[#35788D] dark:text-[#4AA0BA] shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                                    >
                                        {language === 'ar' ? 'الإنجليزية' : 'English'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, language: 'ar' }))}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${formData.language === 'ar' ? 'bg-white dark:bg-slate-700 text-[#35788D] dark:text-[#4AA0BA] shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                                    >
                                        {language === 'ar' ? 'العربية' : 'Arabic'}
                                    </button>
                                </div>
                            </div>

                            {/* Reading Time (Only for Articles, Video has it in main area) */}
                            {formData.type === 'article' && (
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 block text-start uppercase tracking-wider">{language === 'ar' ? 'وقت القراءة' : 'Reading Time'}</label>
                                    <input
                                        type="text"
                                        value={formData.duration || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                                        className="w-full bg-[#F4F9FB] dark:bg-slate-900/50 border-none rounded-xl p-3 text-sm font-bold text-start text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                        placeholder={language === 'ar' ? 'مثلاً: 5 دقائق' : 'e.g. 5 mins'}
                                    />
                                </div>
                            )}

                            {/* Status */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 dark:text-slate-500 block text-start uppercase tracking-wider">{language === 'ar' ? 'الحالة' : 'Status'}</label>
                                <div className="relative">
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                                        className="w-full bg-[#F4F9FB] dark:bg-slate-900/50 border-none rounded-xl p-3 text-sm font-bold text-start text-slate-800 dark:text-slate-100 appearance-none cursor-pointer"
                                    >
                                        <option value="draft" className="dark:bg-slate-800">{language === 'ar' ? 'مسودة' : 'Draft'}</option>
                                        <option value="published" className="dark:bg-slate-800">{language === 'ar' ? 'منشور' : 'Published'}</option>
                                    </select>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
                                        <ArrowLeft size={16} className="-rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Access Type */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 dark:text-slate-500 block text-start uppercase tracking-wider">{language === 'ar' ? 'نوع الوصول' : 'Access Type'}</label>
                                <div className="flex bg-[#F4F9FB] dark:bg-slate-900/50 p-1.5 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, access_type: 'members_only' }))}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${formData.access_type === 'members_only' ? 'bg-white dark:bg-slate-700 text-[#35788D] dark:text-[#4AA0BA] shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                                    >
                                        {language === 'ar' ? 'للمشتركين' : 'Members'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, access_type: 'public' }))}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${formData.access_type === 'public' ? 'bg-white dark:bg-slate-700 text-[#35788D] dark:text-[#4AA0BA] shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
                                    >
                                        {language === 'ar' ? 'عام' : 'Public'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons Spacer */}
                    <div className="mt-auto space-y-3">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-4 bg-[#0095D9] dark:bg-brand-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-[#0095D9]/20 dark:shadow-brand-500/20 hover:shadow-[#0095D9]/40 dark:hover:shadow-brand-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {formData.type === 'video'
                                ? (language === 'ar' ? 'حفظ ورفع الفيديو' : 'Save & Upload')
                                : (isPending ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ ورفع المقال' : 'Save & Publish'))}
                        </button>
                        <button
                            type="button"
                            className="w-full py-4 border-2 border-[#0095D9] dark:border-brand-500/50 text-[#0095D9] dark:text-brand-400 rounded-2xl font-black text-sm hover:bg-sky-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                        >
                            <Eye size={18} />
                            {formData.type === 'video' ? (language === 'ar' ? 'معاينة الفيديو قبل الرفع' : 'Preview Video') : (language === 'ar' ? 'معاينة المقال قبل الرفع' : 'Preview Article')}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    )
}
