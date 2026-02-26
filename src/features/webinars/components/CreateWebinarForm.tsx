import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { webinarsApi } from '../api'
import type { Webinar } from '../types'
import { useLanguage } from '@/shared/context/LanguageContext'
import { RichTextEditor } from '@/shared/components/RichTextEditor'
import { useFiltersByItem, useLinkFilter, useUnlinkFilter } from '@/features/content/hooks/use-filters'
import { FilterSelector } from '@/shared/components/FilterSelector'
import { Link as LinkIcon, Bell, Calendar, Clock, FileText, ArrowLeft, CheckSquare, Square, ImagePlus, Trash2 } from 'lucide-react'

interface CreateWebinarFormProps {
    initialData?: Partial<Webinar>
    onSuccess?: () => void
    onCancel?: () => void
}

interface Speaker {
    id: string
    full_name?: string
    name?: string
    specialty?: string
    avatar_url?: string
    profile_image?: string
    role?: string
}

export function CreateWebinarForm({ initialData, onSuccess, onCancel }: CreateWebinarFormProps) {
    const { direction } = useLanguage()
    const isRTL = direction === 'rtl'
    const queryClient = useQueryClient()
    const isEditMode = !!initialData?.id

    const { data: linkedFilters = [] } = useFiltersByItem('webinar', initialData?.id || '')
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

            // Only update if changed to avoid cascading renders
            setSelectedTopicIds(prev => JSON.stringify([...prev].sort()) !== JSON.stringify([...topics].sort()) ? topics : prev)
            setSelectedSegmentIds(prev => JSON.stringify([...prev].sort()) !== JSON.stringify([...segments].sort()) ? segments : prev)
            setSelectedTagIds(prev => JSON.stringify([...prev].sort()) !== JSON.stringify([...tags].sort()) ? tags : prev)
        } else if (isEditMode) {
            setSelectedTopicIds([])
            setSelectedSegmentIds([])
            setSelectedTagIds([])
        }
    }, [linkedFilters, isEditMode])

    const [formData, setFormData] = useState<Partial<Webinar>>({
        title: '',
        speaker: '',
        date_time: '',
        capacity: 45,
        recording_url: '',
        description: '',
        price: 0,
        access_type: 'public',
        lang: 'ar',
        ...initialData
    })

    const [platform, setPlatform] = useState('Zoom Meetings')
    const [inviteLink, setInviteLink] = useState(initialData?.recording_url || 'https://www.zoom.com/j9jy9s')
    const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>(initialData?.speaker_id || '')
    const [dateValue, setDateValue] = useState('')
    const [timeValue, setTimeValue] = useState('')
    const [duration, setDuration] = useState('50')
    const [remindOnRegister, setRemindOnRegister] = useState(true)
    const [remind30Min, setRemind30Min] = useState(false)

    // Fetch speakers/coaches from backend
    const { data: speakers = [], isLoading: isSpeakersLoading } = useQuery<Speaker[]>({
        queryKey: ['coaches'],
        queryFn: async () => {
            const res = await apiClient.get('/users/coaches')
            return res.data.data
        },
    })

    useEffect(() => {
        if (initialData) {
            // eslint-disable-next-line
            setFormData(prev => ({ ...prev, ...initialData }))
            if (initialData.date_time) {
                const dt = new Date(initialData.date_time)
                setDateValue(dt.toISOString().split('T')[0])
                setTimeValue(dt.toTimeString().slice(0, 5))
            }
            if (initialData.recording_url) {
                setInviteLink(initialData.recording_url)
            }
            if (initialData.speaker_id) {
                setSelectedSpeakerId(initialData.speaker_id)
            }
        }
    }, [initialData])

    const createMutation = useMutation({
        mutationFn: webinarsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['webinars'] })
            onSuccess?.()
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Webinar> }) => webinarsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['webinars'] })
            onSuccess?.()
        }
    })

    const isPending = createMutation.isPending || updateMutation.isPending

    const handlePersistFilters = (itemId: string) => {
        const allNewIds = [...selectedTopicIds, ...selectedSegmentIds, ...selectedTagIds]
        const existingIds = linkedFilters.map(f => f.id)

        // Link new filters
        allNewIds.forEach(id => {
            if (!existingIds.includes(id)) {
                linkFilter({ type: 'webinar', webinar_id: itemId, filter_id: id })
            }
        })

        // Unlink removed filters
        existingIds.forEach(id => {
            if (!allNewIds.includes(id)) {
                unlinkFilter({ type: 'webinar', webinar_id: itemId, filter_id: id })
            }
        })
    }

    const handleSubmit = (asDraft = false) => {
        // Validation: If not draft, required fields must be present
        if (!asDraft) {
            if (!formData.title) {
                alert(isRTL ? 'يرجى إدخال عنوان الندوة' : 'Please enter webinar title')
                return
            }
            if (!dateValue || !timeValue) {
                alert(isRTL ? 'يرجى تحديد التاريخ والوقت' : 'Please select date and time')
                return
            }
            if (!selectedSpeakerId) {
                alert(isRTL ? 'يرجى اختيار المتحدث' : 'Please select a speaker')
                return
            }
        }

        // Format date_time properly. If missing, send null instead of empty string
        let dateTime: string | null = null
        if (dateValue && timeValue) {
            try {
                // Combine date and time into a valid Date object
                const dt = new Date(`${dateValue}T${timeValue}`)
                if (!isNaN(dt.getTime())) {
                    dateTime = dt.toISOString()
                }
            } catch (e) {
                console.error("Date formatting error:", e)
            }
        }

        const submitData = {
            ...formData,
            date_time: dateTime || undefined, // undefined will be skipped by API, ensuring DB null or default
            recording_url: inviteLink,
            speaker_id: selectedSpeakerId
        }

        if (isEditMode && initialData?.id) {
            updateMutation.mutate({ id: initialData.id, data: submitData }, {
                onSuccess: () => {
                    handlePersistFilters(initialData.id!)
                }
            })
        } else {
            createMutation.mutate(submitData, {
                onSuccess: (newWebinar) => {
                    if (newWebinar && newWebinar.id) {
                        handlePersistFilters(newWebinar.id)
                    }
                }
            })
        }
    }


    const inputClasses = "w-full bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#35788D]/20 dark:focus:ring-brand-500/20 transition-all shadow-sm outline-none"

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in">

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main content — first in DOM = RIGHT in RTL */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Title */}
                    <div className="space-y-2">
                        <label className={`text-base font-black text-slate-800 dark:text-slate-100 block ${isRTL ? 'text-start' : 'text-end'}`}>
                            {isRTL ? 'عنوان ندوة مباشرة جديدة (باللغه العربيه)' : 'New Webinar Title'}
                        </label>
                        <input
                            type="text"
                            dir="rtl"
                            value={formData.title || ''}
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder={isRTL ? 'مثلا: كيف تحسن جودة نومك في 7 خطوات بسيطة' : 'e.g. How to improve your sleep quality'}
                            className={inputClasses}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className={`text-base font-black text-slate-800 dark:text-slate-100 block ${isRTL ? 'text-start' : 'text-end'}`}>
                            {isRTL ? 'وصف الندوة' : 'Webinar Description'}
                        </label>
                        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700/50 overflow-hidden shadow-sm min-h-[220px] transition-colors duration-300">
                            <RichTextEditor
                                value={formData.description || ''}
                                onChange={value => setFormData(prev => ({ ...prev, description: value }))}
                                placeholder={isRTL ? 'أكتب تفاصيل عن محاور الندوة وما سيتعلمه الحضور...' : 'Write details about the webinar topics...'}
                            />
                        </div>
                    </div>

                    {/* Filter Selection Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FilterSelector
                            type="topic"
                            label={isRTL ? "التصنيف (Topic)" : "Topic"}
                            selectedIds={selectedTopicIds}
                            onChange={setSelectedTopicIds}
                            placeholder={isRTL ? "اختر التصنيف..." : "Select Topic..."}
                        />
                        <FilterSelector
                            type="segment"
                            label={isRTL ? "الشرائح المستهدفة (Segment)" : "Target Segments"}
                            selectedIds={selectedSegmentIds}
                            onChange={setSelectedSegmentIds}
                            multiple
                            placeholder={isRTL ? "اختر الشرائح..." : "Select Segments..."}
                        />
                    </div>

                    <FilterSelector
                        type="tag"
                        label={isRTL ? "الكلمات الدالة (Tags)" : "Tags"}
                        selectedIds={selectedTagIds}
                        onChange={setSelectedTagIds}
                        multiple
                        placeholder={isRTL ? "أضف كلمات دالة..." : "Add tags..."}
                    />

                    {/* Date + Time + Duration row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date */}
                        <div className="space-y-2">
                            <label className={`text-sm font-black text-slate-800 dark:text-slate-100 block ${isRTL ? 'text-start' : 'text-end'}`}>
                                {isRTL ? 'تاريخ الندوة' : 'Webinar Date'}
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={dateValue}
                                    onChange={e => setDateValue(e.target.value)}
                                    className={inputClasses + ' pe-12'}
                                />
                                <Calendar size={16} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} text-slate-300 pointer-events-none`} />
                            </div>
                        </div>

                        {/* Time + Duration */}
                        <div className="space-y-2">
                            <label className={`text-sm font-black text-slate-800 dark:text-slate-100 block ${isRTL ? 'text-start' : 'text-end'}`}>
                                {isRTL ? 'وقت البدء والمدة' : 'Start Time & Duration'}
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50 rounded-2xl px-4 py-4 shadow-sm flex-1 transition-colors duration-300">
                                    <input
                                        type="text"
                                        value={duration}
                                        onChange={e => setDuration(e.target.value)}
                                        className="w-12 text-sm font-bold text-slate-700 dark:text-slate-100 outline-none text-center bg-transparent transition-colors"
                                    />
                                    <span className="text-xs text-slate-400 dark:text-slate-500 font-bold transition-colors">{isRTL ? 'دقيقة' : 'min'}</span>
                                </div>
                                <div className="relative flex-1">
                                    <input
                                        type="time"
                                        value={timeValue}
                                        onChange={e => setTimeValue(e.target.value)}
                                        className={inputClasses}
                                    />
                                    <Clock size={14} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} text-slate-300 pointer-events-none`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Speaker selection */}
                    <div className="space-y-3">
                        <label className={`text-base font-black text-slate-800 dark:text-slate-100 block ${isRTL ? 'text-start' : 'text-end'}`}>
                            {isRTL ? 'اختيار المتحدث (من أخصائي العيادة)' : 'Select Speaker (from clinic specialists)'}
                        </label>
                        <div className="flex flex-wrap gap-4">
                            {isSpeakersLoading ? (
                                <div className="flex gap-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="w-52 h-16 rounded-2xl bg-gray-100 animate-pulse" />
                                    ))}
                                </div>
                            ) : speakers.length > 0 ? (
                                speakers.map((speaker: Speaker) => {
                                    const displayName = speaker.full_name || speaker.name || 'Unknown'
                                    const avatarUrl = speaker.avatar_url || speaker.profile_image || ''
                                    const isSelected = selectedSpeakerId === speaker.id
                                    return (
                                        <button
                                            key={speaker.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedSpeakerId(speaker.id)
                                                setFormData(prev => ({ ...prev, speaker: displayName, speaker_id: speaker.id }))
                                            }}
                                            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all ${isSelected
                                                ? 'border-[#35788D] dark:border-brand-500 bg-sky-50/50 dark:bg-brand-900/20 shadow-md'
                                                : 'border-gray-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 hover:border-gray-200 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            {isSelected ? (
                                                <CheckSquare size={18} className="text-[#35788D] shrink-0" />
                                            ) : (
                                                <Square size={18} className="text-gray-300 shrink-0" />
                                            )}
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#35788D] to-[#0095D9] flex items-center justify-center text-white text-xs font-black shrink-0">
                                                    {displayName.charAt(0)}
                                                </div>
                                            )}
                                            <div className={`${isRTL ? 'text-start' : 'text-end'}`}>
                                                <p className="text-sm font-black text-slate-800 dark:text-slate-100">{displayName}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{speaker.specialty || speaker.role || ''}</p>
                                            </div>
                                        </button>
                                    )
                                })
                            ) : (
                                <p className="text-sm text-slate-400 font-bold">
                                    {isRTL ? 'لا يوجد متحدثين متاحين' : 'No speakers available'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Access Type & Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className={`text-base font-black text-slate-800 dark:text-slate-100 block ${isRTL ? 'text-start' : 'text-end'}`}>
                                {isRTL ? 'نوع الوصول' : 'Access Type'}
                            </label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, access_type: 'public' }))}
                                    className={`flex-1 py-4 rounded-2xl border-2 font-black text-sm transition-all ${formData.access_type === 'public'
                                        ? 'border-[#35788D] dark:border-brand-500 bg-sky-50 dark:bg-brand-900/20 text-[#35788D] dark:text-brand-400'
                                        : 'border-gray-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 hover:border-gray-200 dark:hover:border-slate-600'
                                        }`}
                                >
                                    {isRTL ? 'عام' : 'Public'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, access_type: 'members_only' }))}
                                    className={`flex-1 py-4 rounded-2xl border-2 font-black text-sm transition-all ${formData.access_type === 'members_only'
                                        ? 'border-[#35788D] dark:border-brand-500 bg-sky-50 dark:bg-brand-900/20 text-[#35788D] dark:text-brand-400'
                                        : 'border-gray-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 hover:border-gray-200 dark:hover:border-slate-600'
                                        }`}
                                >
                                    {isRTL ? 'للمشتركين فقط' : 'Members Only'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={`text-base font-black text-slate-800 dark:text-slate-100 block ${isRTL ? 'text-start' : 'text-end'}`}>
                                {isRTL ? 'السعر (EGP)' : 'Price (EGP)'}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.price || ''}
                                    onChange={e => {
                                        const val = parseFloat(e.target.value)
                                        setFormData(prev => ({ ...prev, price: isNaN(val) ? 0 : val }))
                                    }}
                                    placeholder="0.00"
                                    className={inputClasses}
                                />
                                <div className="absolute top-1/2 -translate-y-1/2 end-5 text-xs font-black text-slate-400 pointer-events-none">
                                    EGP
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold px-1">
                                {isRTL ? 'ادخل 0 إذا كانت الندوة مجانية' : 'Enter 0 if the webinar is free'}
                            </p>
                        </div>
                    </div>

                    {/* Capacity */}
                    <div className="space-y-2">
                        <label className={`text-base font-black text-slate-800 dark:text-slate-100 block ${isRTL ? 'text-start' : 'text-end'}`}>
                            {isRTL ? 'سعة الحضور' : 'Attendance Capacity'}
                        </label>
                        <p className="text-xs text-slate-400 font-bold">
                            {isRTL ? 'اتركها فارغه إذا كان العدد غير محدد' : 'Leave empty if unlimited'}
                        </p>
                        <div className="flex items-center gap-3 max-w-xs">
                            <input
                                type="number"
                                min="0"
                                value={formData.capacity || ''}
                                onChange={e => {
                                    const val = parseInt(e.target.value)
                                    setFormData(prev => ({ ...prev, capacity: isNaN(val) ? 0 : val }))
                                }}
                                placeholder={isRTL ? 'مثلا: 45' : 'e.g. 45'}
                                className={inputClasses + ' max-w-[120px]'}
                            />
                            <span className="text-sm font-black text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-2xl px-5 py-4 shadow-sm transition-colors duration-300">
                                {isRTL ? 'مقعد' : 'seats'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sidebar — second in DOM = LEFT in RTL */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Thumbnail Upload */}
                    <div className="bg-white dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6 space-y-4 transition-colors duration-300">
                        <div className="flex items-center gap-2">
                            <ImagePlus size={18} className="text-[#35788D] dark:text-brand-500" />
                            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                                {isRTL ? 'صورة الغلاف' : 'Thumbnail Image'}
                            </h3>
                        </div>

                        <div className="group relative">
                            <div className={`aspect-video w-full rounded-xl overflow-hidden border-2 border-dashed transition-all duration-300 flex items-center justify-center ${formData.thumbnail_image
                                ? 'border-[#35788D]/20 dark:border-brand-500/20 bg-white dark:bg-slate-900/50'
                                : 'border-gray-200 dark:border-slate-700/50 hover:border-[#35788D]/40 dark:hover:border-brand-500/40 bg-[#F4F9FB] dark:bg-slate-800/50 hover:bg-sky-50/50 dark:hover:bg-slate-800/80'
                                }`}>
                                {formData.thumbnail_image ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={
                                                typeof formData.thumbnail_image === 'string'
                                                    ? formData.thumbnail_image
                                                    : URL.createObjectURL(formData.thumbnail_image)
                                            }
                                            alt="Thumbnail"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, thumbnail_image: undefined }))}
                                                className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-rose-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-4 pointer-events-none">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                                            <ImagePlus size={22} className="text-[#35788D] dark:text-brand-500" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                            {isRTL ? 'اسحب الصورة أو اضغط للرفع' : 'Drag or click to upload'}
                                        </p>
                                        <p className="text-[10px] text-slate-300 font-medium">PNG, JPG (max 2MB)</p>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files?.[0]
                                        if (file) setFormData(prev => ({ ...prev, thumbnail_image: file }))
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Session Link */}
                    <div className="bg-white dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6 space-y-5 transition-colors duration-300">
                        <div className="flex items-center gap-2">
                            <LinkIcon size={18} className="text-[#35788D] dark:text-brand-500" />
                            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                                {isRTL ? 'رابط الجلسة' : 'Session Link'}
                            </h3>
                        </div>

                        {/* Platform */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 block">
                                {isRTL ? 'المنصة المستخدمة' : 'Platform'}
                            </label>
                            <select
                                value={platform}
                                onChange={e => setPlatform(e.target.value)}
                                className="w-full bg-[#F4F9FB] dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-[#35788D]/20 dark:focus:ring-brand-500/20 transition-colors duration-300"
                            >
                                <option className="dark:bg-slate-900">Zoom Meetings</option>
                                <option className="dark:bg-slate-900">Google Meet</option>
                                <option className="dark:bg-slate-900">Microsoft Teams</option>
                            </select>
                        </div>

                        {/* Invite link */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 block">
                                {isRTL ? 'رابط الدعوة' : 'Invite Link'}
                            </label>
                            <input
                                type="url"
                                value={inviteLink}
                                onChange={e => setInviteLink(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-[#F4F9FB] dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-500 outline-none transition-colors duration-300"
                                dir="ltr"
                            />
                        </div>

                        {/* Info banner */}
                        <div className="bg-[#0095D9] text-white rounded-xl px-4 py-3 text-xs font-bold leading-relaxed">
                            {isRTL
                                ? 'سيتم إرسال هذا الرابط تلقائيا للمسجلين قبل موعد ب 30 دقيقة'
                                : 'This link will be sent automatically to registrants 30 minutes before the event'}
                        </div>
                    </div>

                    {/* Reminder Settings */}
                    <div className="bg-white dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6 space-y-4 transition-colors duration-300">
                        <div className="flex items-center gap-2">
                            <Bell size={18} className="text-[#35788D] dark:text-brand-500" />
                            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                                {isRTL ? 'إعدادات التذكير' : 'Reminder Settings'}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <label
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => setRemindOnRegister(prev => !prev)}
                            >
                                {remindOnRegister ? (
                                    <CheckSquare size={18} className="text-[#35788D] shrink-0" />
                                ) : (
                                    <Square size={18} className="text-gray-300 shrink-0" />
                                )}
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#35788D] dark:group-hover:text-brand-400 transition-colors">
                                    {isRTL ? 'إرسال بريد إلكتروني عند التسجيل' : 'Send email on registration'}
                                </span>
                            </label>

                            <label
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => setRemind30Min(prev => !prev)}
                            >
                                {remind30Min ? (
                                    <CheckSquare size={18} className="text-[#35788D] shrink-0" />
                                ) : (
                                    <Square size={18} className="text-gray-300 shrink-0" />
                                )}
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#35788D] dark:group-hover:text-brand-400 transition-colors">
                                    {isRTL ? 'تذكير قبل 30 دقيقة (Email)' : 'Reminder 30 min before (Email)'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom action bar */}
            <div className={`flex items-center gap-4 pt-2 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
                <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    disabled={isPending}
                    className="bg-[#0095D9] text-white px-7 py-3.5 rounded-full font-black text-sm shadow-lg shadow-[#0095D9]/30 hover:shadow-[#0095D9]/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-60"
                >
                    {isRTL ? 'جدولة الندوة' : 'Schedule Webinar'}
                    <ArrowLeft size={16} className={isRTL ? '' : 'rotate-180'} />
                </button>

                <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={isPending}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-7 py-3.5 rounded-full font-black text-sm hover:bg-gray-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-60"
                >
                    <FileText size={16} />
                    {isRTL ? 'حفظ كمسودة' : 'Save as Draft'}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 px-7 py-3.5 rounded-full font-bold text-sm transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
            </div>
        </div>
    )
}
