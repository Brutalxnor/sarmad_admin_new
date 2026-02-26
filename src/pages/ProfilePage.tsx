import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/features/staff/context/AuthContext'
import { staffService, type UserProfile } from '@/features/staff/api/staffService'
import { useLanguage } from '@/shared/context/LanguageContext'
import toast from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Briefcase, FileText, Camera } from 'lucide-react'

export default function ProfilePage() {
    const { user, checkAuth } = useAuth()
    const { t, language, direction } = useLanguage()
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const isRTL = language === 'ar'

    const { register, handleSubmit, setValue, watch, reset } = useForm<UserProfile>({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            mobile: user?.mobile || '',
            city: user?.city || '',
            gender: user?.gender || '',
            age_range: user?.age_range || '',
            specialization: user?.specialization || '',
            bio: user?.bio || '',
            profile_picture: user?.profile_picture || ''
        }
    })

    // Populate form when user data is available
    useEffect(() => {
        if (user) {
            reset({
                name: user.name || '',
                email: user.email || '',
                mobile: user.mobile || '',
                city: user.city || '',
                gender: user.gender || '',
                age_range: user.age_range || '',
                specialization: user.specialization || '',
                bio: user.bio || '',
                profile_picture: user.profile_picture || ''
            })
        }
    }, [user, reset])

    const profilePicture = watch('profile_picture')

    const onSubmit = async (data: UserProfile) => {
        setIsLoading(true)
        try {
            // Remove email from update data as it's readonly
            const updateData = { ...data }
            delete (updateData as any).email

            await staffService.updateProfile(updateData, selectedFile || undefined)
            await checkAuth() // Refresh user data
            toast.success(t('profile.update_success'))
            setSelectedFile(null)
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast.error(t('profile.update_error'))
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setSelectedFile(file)
        const previewUrl = URL.createObjectURL(file)
        setValue('profile_picture', previewUrl)
        toast.success(isRTL ? 'تم اختيار الصورة' : 'Image selected')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in py-10" dir={direction}>
            {/* Header Content */}
            <div className="text-center space-y-2">
                <div className="relative inline-block group">
                    <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-2xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center mx-auto transition-all duration-300">
                        {profilePicture ? (
                            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={64} className="text-slate-200 dark:text-slate-600 transition-colors duration-300" />
                        )}
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center rounded-full transition-colors duration-300">
                                <div className="w-8 h-8 border-4 border-[#0095D9]/30 border-t-[#0095D9] dark:border-[#4AA0BA]/30 dark:border-t-[#4AA0BA] rounded-full animate-spin transition-colors duration-300" />
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-1 right-1 w-10 h-10 bg-white dark:bg-slate-700 shadow-lg rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors border border-slate-100 dark:border-slate-600">
                        <Camera size={20} className="text-[#0095D9] dark:text-[#4AA0BA] transition-colors duration-300" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>
                <p className="text-slate-400 dark:text-slate-500 font-bold text-sm mt-4 transition-colors duration-300">{t('profile.change_photo')}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-12 border border-slate-100 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                        {/* Full Name */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors duration-300">
                                <User size={18} className="text-[#0095D9] dark:text-[#4AA0BA] transition-colors duration-300" />
                                {t('profile.name')}
                            </label>
                            <input
                                {...register('name')}
                                className="w-full p-5 bg-[#F4F9FB]/50 dark:bg-slate-900/30 border border-gray-50 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0095D9]/20 dark:focus:ring-[#4AA0BA]/20 focus:border-[#0095D9]/30 dark:focus:border-[#4AA0BA]/30 transition-all font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                placeholder={t('profile.name_placeholder')}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors duration-300">
                                <Mail size={18} className="text-[#0095D9] dark:text-[#4AA0BA] transition-colors duration-300" />
                                {t('profile.email')}
                            </label>
                            <input
                                {...register('email')}
                                readOnly
                                className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/30 rounded-2xl font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed transition-colors duration-300"
                                dir="ltr"
                            />
                        </div>

                        {/* Mobile */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors duration-300">
                                <Phone size={18} className="text-[#0095D9] dark:text-[#4AA0BA] transition-colors duration-300" />
                                {t('profile.mobile')}
                            </label>
                            <input
                                {...register('mobile')}
                                className="w-full p-5 bg-[#F4F9FB]/50 dark:bg-slate-900/30 border border-gray-50 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0095D9]/20 dark:focus:ring-[#4AA0BA]/20 focus:border-[#0095D9]/30 dark:focus:border-[#4AA0BA]/30 transition-all font-bold text-slate-700 dark:text-slate-200 text-left placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                placeholder="+966"
                                dir="ltr"
                            />
                        </div>

                        {/* City */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors duration-300">
                                <MapPin size={18} className="text-[#0095D9] dark:text-[#4AA0BA] transition-colors duration-300" />
                                {t('profile.city')}
                            </label>
                            <input
                                {...register('city')}
                                className="w-full p-5 bg-[#F4F9FB]/50 dark:bg-slate-900/30 border border-gray-50 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0095D9]/20 dark:focus:ring-[#4AA0BA]/20 focus:border-[#0095D9]/30 dark:focus:border-[#4AA0BA]/30 transition-all font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            />
                        </div>

                        {/* Gender */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors duration-300">
                                {t('profile.gender')}
                            </label>
                            <select
                                {...register('gender')}
                                className="w-full p-5 bg-[#F4F9FB]/50 dark:bg-slate-900/30 border border-gray-50 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0095D9]/20 dark:focus:ring-[#4AA0BA]/20 focus:border-[#0095D9]/30 dark:focus:border-[#4AA0BA]/30 transition-all font-bold text-slate-700 dark:text-slate-200 appearance-none bg-no-repeat bg-[center_left_1.5rem]"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23cbd5e1' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`, backgroundSize: '1rem' }}
                            >
                                <option value="" className="dark:bg-slate-800">{t('common.select')}</option>
                                <option value="male" className="dark:bg-slate-800">{t('gender.male')}</option>
                                <option value="female" className="dark:bg-slate-800">{t('gender.female')}</option>
                            </select>
                        </div>

                        {/* Age Range */}
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors duration-300">
                                {t('profile.age_range')}
                            </label>
                            <select
                                {...register('age_range')}
                                className="w-full p-5 bg-[#F4F9FB]/50 dark:bg-slate-900/30 border border-gray-50 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0095D9]/20 dark:focus:ring-[#4AA0BA]/20 focus:border-[#0095D9]/30 dark:focus:border-[#4AA0BA]/30 transition-all font-bold text-slate-700 dark:text-slate-200 appearance-none bg-no-repeat bg-[center_left_1.5rem]"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23cbd5e1' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`, backgroundSize: '1rem' }}
                            >
                                <option value="" className="dark:bg-slate-800">{t('common.select')}</option>
                                <option value="18-24" className="dark:bg-slate-800">18-24</option>
                                <option value="25-34" className="dark:bg-slate-800">25-34</option>
                                <option value="35-44" className="dark:bg-slate-800">35-44</option>
                                <option value="45-54" className="dark:bg-slate-800">45-54</option>
                                <option value="55+" className="dark:bg-slate-800">55+</option>
                            </select>
                        </div>

                        {/* Specialization */}
                        <div className="space-y-3 md:col-span-2">
                            <label className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors duration-300">
                                <Briefcase size={18} className="text-[#0095D9] dark:text-[#4AA0BA] transition-colors duration-300" />
                                {t('profile.specialization')}
                            </label>
                            <input
                                {...register('specialization')}
                                className="w-full p-5 bg-[#F4F9FB]/50 dark:bg-slate-900/30 border border-gray-50 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0095D9]/20 dark:focus:ring-[#4AA0BA]/20 focus:border-[#0095D9]/30 dark:focus:border-[#4AA0BA]/30 transition-all font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                placeholder={t('profile.specialization_placeholder')}
                            />
                        </div>

                        {/* Bio */}
                        <div className="space-y-3 md:col-span-2">
                            <label className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors duration-300">
                                <FileText size={18} className="text-[#0095D9] dark:text-[#4AA0BA] transition-colors duration-300" />
                                {t('profile.bio')}
                            </label>
                            <textarea
                                {...register('bio')}
                                className="w-full p-5 bg-[#F4F9FB]/50 dark:bg-slate-900/30 border border-gray-50 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-[#0095D9]/20 dark:focus:ring-[#4AA0BA]/20 focus:border-[#0095D9]/30 dark:focus:border-[#4AA0BA]/30 transition-all font-bold text-slate-700 dark:text-slate-200 min-h-[160px] resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                placeholder={t('profile.bio_placeholder')}
                            />
                        </div>
                    </div>

                    <div className="pt-10 flex justify-start">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#0095D9] dark:bg-[#4AA0BA] text-white px-10 py-4 rounded-[1.25rem] font-black text-lg hover:bg-[#0084c2] dark:hover:bg-[#4AA0BA]/90 transition-all shadow-lg shadow-[#0095D9]/20 dark:shadow-[#4AA0BA]/20 disabled:opacity-50 flex items-center gap-3"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : null}
                            <span>{t('common.save') || (isRTL ? 'حفظ التغييرات' : 'Save Changes')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
