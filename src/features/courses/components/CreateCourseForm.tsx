import { useState, useEffect } from 'react'
import { useCreateCourse, useUpdateCourse } from '../hooks/use-courses'
import type { Course } from '../types'
import { RichTextEditor } from '@/shared/components/RichTextEditor'
import { CourseCurriculum } from './CourseCurriculum'
import { useTopics } from '@/features/content/hooks/use-content'
import { useLanguage } from '@/shared/context/LanguageContext'

interface CreateCourseFormProps {
    initialData?: Partial<Course>
    onSuccess?: () => void
    onCancel?: () => void
}

export function CreateCourseForm({ initialData, onSuccess, onCancel }: CreateCourseFormProps) {
    const { mutate: createCourse, isPending: isCreating } = useCreateCourse()
    const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse()
    const { data: topics, isLoading: isLoadingTopics } = useTopics()
    const { language } = useLanguage()

    const isPending = isCreating || isUpdating
    const isEditMode = !!initialData?.id

    // Helper to get topic string and ID safely
    const getInitialTopicData = (data: Partial<Course> | undefined) => {
        const topic = data?.topic
        const topicId = data?.topic_id || (typeof topic === 'object' ? topic?.id : '')
        const topicName = typeof topic === 'object'
            ? (language === 'ar' ? topic?.name_ar : topic?.name_en)
            : (topic || data?.category || '')

        return { topicName, topicId }
    }

    const { topicName: initialTopicName, topicId: initialTopicId } = getInitialTopicData(initialData)

    const [formData, setFormData] = useState<Partial<Course>>({
        title: '',
        description: '',
        price: 0,
        access_type: 'public',
        thumbnail_url: '',
        ...initialData,
        category: initialTopicName,
        topic_id: initialTopicId
    })

    const [activeTab, setActiveTab] = useState<'info' | 'curriculum'>('info')
    const [savedCourseId, setSavedCourseId] = useState<string | null>(initialData?.id || null)

    useEffect(() => {
        if (initialData) {
            const { topicName, topicId } = getInitialTopicData(initialData)
            setFormData({
                title: '',
                description: '',
                price: 0,
                access_type: 'public',
                thumbnail_url: '',
                ...initialData,
                category: topicName,
                topic_id: topicId
            })
            if (initialData.id) setSavedCourseId(initialData.id)
        }
    }, [initialData, language])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Clean up data before sending
        const payload = { ...formData }
        // Ensure price is a number
        if (payload.price) payload.price = Number(payload.price)

        if (isEditMode && initialData.id) {
            updateCourse({ id: initialData.id, data: payload }, {
                onSuccess: () => {
                    // Success, could show a toast or just stay here
                }
            })
        } else {
            createCourse(payload, {
                onSuccess: (newCourse) => {
                    if (newCourse && newCourse.id) {
                        setSavedCourseId(newCourse.id)
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
                <div className="inline-flex p-1.5 bg-slate-100 rounded-[2rem] border-2 border-slate-50 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setActiveTab('info')}
                        className={`px-8 py-3 rounded-[1.75rem] font-black text-sm transition-all duration-300 ${activeTab === 'info'
                            ? 'bg-white text-brand-600 shadow-xl shadow-slate-200/50 translate-z-0 scale-105'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        📝 المعلومات الأساسية
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
                        className={`px-8 py-3 rounded-[1.75rem] font-black text-sm transition-all duration-300 relative ${activeTab === 'curriculum'
                            ? 'bg-white text-brand-600 shadow-xl shadow-slate-200/50 translate-z-0 scale-105'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        📚 منهج الدورة
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

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 block text-start uppercase tracking-wider">التصنيف (Category)</label>
                                    <select
                                        value={formData.topic_id || ''}
                                        onChange={e => {
                                            const selectedTopic = topics?.find(t => t.id === e.target.value)
                                            setFormData(prev => ({
                                                ...prev,
                                                topic_id: e.target.value,
                                                category: selectedTopic ? (language === 'ar' ? selectedTopic.name_ar : selectedTopic.name_en) : ''
                                            }))
                                        }}
                                        className="input-modern w-full font-bold disabled:opacity-50"
                                        required
                                        disabled={isLoadingTopics}
                                    >
                                        <option value="">{isLoadingTopics ? 'جاري تحميل المواضيع...' : 'اختر التصنيف...'}</option>
                                        {topics?.map(topic => (
                                            <option key={topic.id} value={topic.id}>
                                                {language === 'ar' ? topic.name_ar : topic.name_en}
                                            </option>
                                        ))}
                                    </select>
                                </div>

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
                                            { id: 'public', label: 'عام (Public)', icon: '🌍' },
                                            { id: 'members_only', label: 'للمشتركين فقط', icon: '👑' }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, access_type: opt.id as any }))}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${formData.access_type === opt.id
                                                    ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-lg shadow-brand-500/10'
                                                    : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'
                                                    }`}
                                            >
                                                <span className="text-xl">{opt.icon}</span>
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
                                    <div className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-50 hover:border-brand-200 transition-all">
                                        {formData.thumbnail_url ? (
                                            <img src={formData.thumbnail_url} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                                                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">
                                                        🖼️
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image Preview</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                            <input
                                                type="text"
                                                value={formData.thumbnail_url}
                                                onChange={e => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                                                className="w-full bg-white border-none rounded-xl py-2 px-3 text-xs font-bold text-slate-700 shadow-2xl"
                                                placeholder="ضع رابط الصورة هنا..."
                                            />
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
                                    {!isEditMode && <span>➡️</span>}
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
                            className="px-12 py-4 bg-emerald-600 text-white rounded-[2rem] font-black shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all hover:-translate-y-1"
                        >
                            تم الانتهاء من بناء الدورة 🎉
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
