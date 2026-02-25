import { useState, useRef, useEffect } from 'react'
import { useCreateArticle, useUpdateArticle, useTopics } from '../hooks/use-content'
import { useSegments } from '@/features/filters/hooks/use-filters'
import type { ContentItem } from '../types'
import { RichTextEditor } from '@/shared/components/RichTextEditor'
import { useLanguage } from '@/shared/context/LanguageContext'
import { ArrowLeft, Image as ImageIcon, Eye, Save, UserRound, Tag, Check, X } from 'lucide-react'

interface CreateContentFormProps {
    initialData?: Partial<ContentItem>
    onSuccess?: () => void
    onCancel?: () => void
}

export function CreateContentForm({ initialData, onSuccess, onCancel }: CreateContentFormProps) {
    const { mutate: createContent, isPending: isCreating } = useCreateArticle()
    const { mutate: updateContent, isPending: isUpdating } = useUpdateArticle()
    const { direction, language } = useLanguage()

    const { data: topics = [], isLoading: isLoadingTopics } = useTopics()
    const { data: segments = [], isLoading: isLoadingSegments } = useSegments()

    const isPending = isCreating || isUpdating || isLoadingTopics || isLoadingSegments
    const isEditMode = !!initialData?.id
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Helper to extract topic ID and name Safely
    const getInitialTopicData = (data: Partial<ContentItem> | undefined) => {
        if (!data) return { topicId: '', topicName: '' }

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
        return { topicId: topicIdFromData || '', topicName }
    }

    const { topicId: initialTopicId, topicName: initialTopicName } = getInitialTopicData(initialData)

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
        topic_id: initialTopicId
    })

    useEffect(() => {
        if (initialData) {
            const { topicId, topicName } = getInitialTopicData(initialData)

            // Resolve topic_id from topics list if we only have a name
            let resolvedTopicId = topicId
            if (!resolvedTopicId && topicName && topics.length > 0) {
                const foundTopic = topics.find(t =>
                    t.name_ar === topicName ||
                    t.name_en === topicName ||
                    t.id === topicId
                )
                if (foundTopic) resolvedTopicId = foundTopic.id
            }

            setFormData(prev => ({
                ...prev,
                ...initialData,
                segments: initialData.segments || [],
                topic: topicName,
                topic_id: resolvedTopicId || topicId
            }))

            if (initialData.thumbnail_image && typeof initialData.thumbnail_image === 'string') {
                setPreviewUrl(initialData.thumbnail_image)
            }
        }
    }, [initialData, language, topics])

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        processPreviewUrl(initialData?.thumbnail_image)
    )

    function processPreviewUrl(image: string | File | undefined) {
        if (typeof image === 'string') return image
        return null
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData(prev => ({ ...prev, thumbnail_image: file }))
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const toggleSegment = (segmentName: string) => {
        setFormData(prev => {
            const currentSegments = prev.segments || []
            if (currentSegments.includes(segmentName)) {
                return { ...prev, segments: currentSegments.filter(s => s !== segmentName) }
            } else {
                return { ...prev, segments: [...currentSegments, segmentName] }
            }
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isEditMode && initialData?.id) {
            updateContent({ id: initialData.id, data: formData }, { onSuccess: () => onSuccess?.() })
        } else {
            createContent(formData, { onSuccess: () => onSuccess?.() })
        }
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-10 animate-fade-in">
            {/* Top Navigation / Breadcrumbs */}
            <div className={`flex mb-8 ${direction === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="text-slate-800 font-black">
                        {formData.type === 'video'
                            ? (language === 'ar' ? 'إضافة فيديو' : 'Add Video')
                            : (language === 'ar' ? 'إضافة مقال' : 'Add Article')}
                    </span>
                    <span className="text-slate-300 mx-2">|</span>
                    <button onClick={onCancel} className="text-slate-400 hover:text-[#35788D] transition-colors flex items-center gap-1">
                        <ArrowLeft size={14} className={direction === 'rtl' ? '' : 'rotate-180'} />
                        {language === 'ar' ? 'العودة لإدارة المحتوى' : 'Back to Content'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                {/* Main Content Area (8 cols) - In RTL this will be on the RIGHT */}
                <div className="lg:col-span-8 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-8">
                    {formData.type === 'video' ? (
                        <>
                            {/* Video Title */}
                            <div className="space-y-2">
                                <label className="text-base font-bold text-slate-800 block text-start">عنوان الفيديو</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-black placeholder:text-slate-300 focus:ring-4 focus:ring-[#35788D]/10 focus:border-[#35788D] transition-all text-start"
                                    placeholder="مثلاً: كيف تحسن جودة نومك في 7 خطوات بسيطة"
                                />
                            </div>

                            {/* Link and Duration Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 block text-start">رابط الفيديو</label>
                                    <input
                                        type="text"
                                        value={formData.media_url || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                                        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-black placeholder:text-slate-300 focus:ring-4 focus:ring-[#35788D]/10 focus:border-[#35788D] transition-all text-start"
                                        placeholder="مثلاً: https://www.youtube.com/vide-675"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 block text-start">مدة الفيديو</label>
                                    <input
                                        type="text"
                                        value={formData.duration || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                                        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-black placeholder:text-slate-300 focus:ring-4 focus:ring-[#35788D]/10 focus:border-[#35788D] transition-all text-start"
                                        placeholder="مثلاً: 12:45 دقيقة"
                                    />
                                </div>
                            </div>

                            {/* Category for Video */}
                            <div className="space-y-2">
                                <label className="text-base font-bold text-slate-800 block text-start">
                                    {language === 'ar' ? 'التصنيف' : 'Category'}
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.topic_id || ''}
                                        onChange={e => {
                                            const topicId = e.target.value
                                            const selectedTopic = topics.find(t => t.id === topicId)
                                            const localizedName = language === 'ar' ? selectedTopic?.name_ar : selectedTopic?.name_en
                                            setFormData(prev => ({
                                                ...prev,
                                                topic_id: topicId,
                                                topic: localizedName || ''
                                            }))
                                        }}
                                        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-black appearance-none cursor-pointer focus:ring-4 focus:ring-[#35788D]/10 focus:border-[#35788D] transition-all text-start"
                                    >
                                        <option value="">{isLoadingTopics ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : (language === 'ar' ? 'اختر تصنيفاً...' : 'Select a category...')}</option>
                                        {topics.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {language === 'ar' ? t.name_ar : t.name_en}
                                            </option>
                                        ))}
                                    </select>
                                    <div className={`absolute ${direction === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none text-slate-400`}>
                                        <ArrowLeft size={16} className="-rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Description Editor / Area */}
                            <div className="space-y-2">
                                <label className="text-base font-bold text-slate-800 block text-start">وصف الفيديو</label>
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
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
                                <label className="text-base font-bold text-slate-800 block text-start">
                                    {language === 'ar' ? 'عنوان المقال' : 'Article Title'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-white border-2 border-slate-200 rounded-2xl p-5 text-sm font-black placeholder:text-slate-300 focus:border-slate-900 focus:ring-0 transition-all text-start"
                                    placeholder={language === 'ar' ? 'مثلاً: كيف تحسن جودة نومك في 7 خطوات بسيطة' : 'e.g. How to improve sleep quality'}
                                />
                            </div>

                            {/* Author and Category Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 block text-start">
                                        {language === 'ar' ? 'اسم الكاتب' : 'Author Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.author || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                                        className="w-full bg-[#F4F9FB]/50 border-none rounded-2xl p-4 text-sm font-black placeholder:text-slate-300 focus:ring-4 focus:ring-[#35788D]/10 transition-all text-start"
                                        placeholder={language === 'ar' ? 'مثلاً: محمد أمين' : 'e.g. John Doe'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 block text-start">
                                        {language === 'ar' ? 'التصنيف' : 'Category'}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.topic_id || ''}
                                            onChange={e => {
                                                const topicId = e.target.value
                                                const selectedTopic = topics.find(t => t.id === topicId)
                                                const localizedName = language === 'ar' ? selectedTopic?.name_ar : selectedTopic?.name_en
                                                setFormData(prev => ({
                                                    ...prev,
                                                    topic_id: topicId,
                                                    topic: localizedName || ''
                                                }))
                                            }}
                                            className="w-full bg-[#F4F9FB]/50 border-none rounded-2xl p-4 text-sm font-black appearance-none cursor-pointer focus:ring-4 focus:ring-[#35788D]/10 transition-all text-start"
                                        >
                                            <option value="">{isLoadingTopics ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : (language === 'ar' ? 'اختر تصنيفاً...' : 'Select a category...')}</option>
                                            {topics.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {language === 'ar' ? t.name_ar : t.name_en}
                                                </option>
                                            ))}
                                        </select>
                                        <div className={`absolute ${direction === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none text-slate-400`}>
                                            <ArrowLeft size={16} className="-rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Editor */}
                            <div className="space-y-2">
                                <label className="text-base font-bold text-slate-800 block text-start">
                                    {language === 'ar' ? 'محتوى المقال' : 'Article Content'}
                                </label>
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
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
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 flex flex-col items-center">
                        <h3 className="text-xs font-bold text-slate-400 block mb-4 uppercase tracking-wider text-center">
                            {formData.type === 'video' ? 'الصورة المصغرة (Thumbnail)' : (language === 'ar' ? 'صورة الغلاف' : 'Cover Image')}
                        </h3>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-sky-100 bg-[#F4F9FB]/50 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F4F9FB] hover:border-[#35788D]/30 transition-all overflow-hidden group relative"
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#35788D] mx-auto group-hover:scale-110 transition-transform">
                                        <ImageIcon size={20} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-black text-slate-800">{language === 'ar' ? 'انقر لرفع الصورة' : 'Click to Upload'}</p>
                                        <p className="text-[9px] font-bold text-slate-400">JPG, PNG {language === 'ar' ? 'حتى 5 ميجابايت' : 'up to 5MB'}</p>
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
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 space-y-4">
                            <label className="text-xs font-bold text-slate-500 flex items-center gap-2 justify-end">
                                مقدم المحتوى
                                <UserRound size={14} />
                            </label>
                            <input
                                type="text"
                                className="w-full bg-[#F4F9FB] border-none rounded-xl p-4 text-sm font-black text-end focus:ring-2 focus:ring-[#35788D]/20 transition-all placeholder:text-slate-300"
                                placeholder="مثلاً: فاطمة محمد"
                                value={formData.author || ''}
                                onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                            />
                        </div>
                    )}

                    {/* Segments Selection Card */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 space-y-4">
                        <div className={`flex items-center justify-between ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                {language === 'ar' ? 'الشرائح المستهدفة' : 'Target Segments'}
                            </h3>
                            <Tag size={14} className="text-slate-400" />
                        </div>

                        {isLoadingSegments ? (
                            <div className="py-4 flex justify-center">
                                <div className="w-5 h-5 border-2 border-[#35788D] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {segments.length > 0 ? (
                                    segments.map(seg => {
                                        const segIdentifier = seg.name_en || seg.name
                                        const isSelected = formData.segments?.includes(segIdentifier)
                                        return (
                                            <div
                                                key={seg.id}
                                                onClick={() => toggleSegment(segIdentifier)}
                                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected
                                                    ? 'bg-[#F4F9FB] border-[#35788D]/20 text-[#35788D]'
                                                    : 'bg-white border-transparent text-slate-500 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected
                                                    ? 'bg-[#35788D] border-[#35788D]'
                                                    : 'border-slate-200 bg-white'
                                                    }`}>
                                                    {isSelected && <Check size={12} className="text-white" />}
                                                </div>
                                                <span className="text-xs font-black">
                                                    {language === 'ar' ? (seg.name || seg.name_en) : (seg.name_en || seg.name)}
                                                </span>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="text-[10px] text-slate-400 font-bold text-center py-4 italic">
                                        {language === 'ar' ? 'لا يوجد شرائح متاحة حالياً' : 'No segments available'}
                                    </p>
                                )}
                            </div>
                        )}

                        {formData.segments && formData.segments.length > 0 && (
                            <div className="pt-2 border-t border-slate-50 flex flex-wrap gap-1.5">
                                <span className="text-[9px] font-black text-slate-400 w-full mb-1">
                                    {language === 'ar' ? 'المختار:' : 'Selected:'}
                                </span>
                                {formData.segments.map(segName => {
                                    const seg = segments.find(s => (s.name_en || s.name) === segName)
                                    if (!seg) return (
                                        <div key={segName} className="flex items-center gap-1 bg-[#35788D]/10 text-[#35788D] px-2.5 py-1 rounded-full text-[10px] font-black">
                                            {segName}
                                            <X size={10} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSegment(segName); }} />
                                        </div>
                                    )
                                    return (
                                        <div key={segName} className="flex items-center gap-1 bg-[#35788D]/10 text-[#35788D] px-2.5 py-1 rounded-full text-[10px] font-black">
                                            {language === 'ar' ? (seg.name || seg.name_en) : (seg.name_en || seg.name)}
                                            <X size={10} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSegment(segName); }} />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Settings Card */}
                    {(formData.type === 'article' || formData.type === 'video') && (
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 space-y-6">
                            {/* Language */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 block text-start uppercase tracking-wider">{language === 'ar' ? 'اللغة' : 'Language'}</label>
                                <div className="flex bg-[#F4F9FB] p-1.5 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, language: 'en' }))}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${formData.language === 'en' ? 'bg-white text-[#35788D] shadow-sm' : 'text-slate-400'}`}
                                    >
                                        {language === 'ar' ? 'الإنجليزية' : 'English'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, language: 'ar' }))}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${formData.language === 'ar' ? 'bg-white text-[#35788D] shadow-sm' : 'text-slate-400'}`}
                                    >
                                        {language === 'ar' ? 'العربية' : 'Arabic'}
                                    </button>
                                </div>
                            </div>

                            {/* Reading Time (Only for Articles, Video has it in main area) */}
                            {formData.type === 'article' && (
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 block text-start uppercase tracking-wider">{language === 'ar' ? 'وقت القراءة' : 'Reading Time'}</label>
                                    <input
                                        type="text"
                                        value={formData.duration || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                                        className="w-full bg-[#F4F9FB] border-none rounded-xl p-3 text-sm font-bold text-start placeholder:text-slate-300"
                                        placeholder={language === 'ar' ? 'مثلاً: 5 دقائق' : 'e.g. 5 mins'}
                                    />
                                </div>
                            )}

                            {/* Status */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 block text-start uppercase tracking-wider">{language === 'ar' ? 'الحالة' : 'Status'}</label>
                                <div className="relative">
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                                        className="w-full bg-[#F4F9FB] border-none rounded-xl p-3 text-sm font-bold text-start appearance-none cursor-pointer"
                                    >
                                        <option value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</option>
                                        <option value="published">{language === 'ar' ? 'منشور' : 'Published'}</option>
                                    </select>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ArrowLeft size={16} className="-rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Access Type */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 block text-start uppercase tracking-wider">{language === 'ar' ? 'نوع الوصول' : 'Access Type'}</label>
                                <div className="flex bg-[#F4F9FB] p-1.5 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, access_type: 'members_only' }))}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${formData.access_type === 'members_only' ? 'bg-white text-[#35788D] shadow-sm' : 'text-slate-400'}`}
                                    >
                                        {language === 'ar' ? 'للمشتركين' : 'Members'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, access_type: 'public' }))}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${formData.access_type === 'public' ? 'bg-white text-[#35788D] shadow-sm' : 'text-slate-400'}`}
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
                            className="w-full py-4 bg-[#0095D9] text-white rounded-2xl font-black text-sm shadow-lg shadow-[#0095D9]/20 hover:shadow-[#0095D9]/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {formData.type === 'video'
                                ? 'حفظ ورفع الفيديو'
                                : (isPending ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ ورفع المقال' : 'Save & Publish'))}
                        </button>
                        <button
                            type="button"
                            className="w-full py-4 border-2 border-[#0095D9] text-[#0095D9] rounded-2xl font-black text-sm hover:bg-sky-50 transition-all flex items-center justify-center gap-3"
                        >
                            <Eye size={18} />
                            {formData.type === 'video' ? 'معاينة الفيديو قبل الرفع' : (language === 'ar' ? 'معاينة المقال قبل الرفع' : 'Preview Article')}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    )
}
