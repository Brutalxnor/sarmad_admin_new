import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/features/staff/context/AuthContext'
import { staffService, type UserProfile } from '@/features/staff/api/staffService'
import { useLanguage } from '@/shared/context/LanguageContext'
import toast from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Briefcase, FileText, Camera } from 'lucide-react'

export default function ProfilePage() {
    const { user, checkAuth } = useAuth()
    const { t } = useLanguage()
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const { register, handleSubmit, setValue, watch } = useForm<UserProfile>({
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

    const profilePicture = watch('profile_picture')

    const onSubmit = async (data: UserProfile) => {
        setIsLoading(true)
        try {
            await staffService.updateProfile(data)
            await checkAuth() // Refresh user data
            toast.success(t('profile.update_success') || 'Profile updated successfully')
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast.error(t('profile.update_error') || 'Failed to update profile')
        } finally {
            setIsLoading(false)
        }
    }

    // Mock upload function - in real app would upload to storage and return URL
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        // Simulate upload delay
        setTimeout(() => {
            // honest mock - just using a placeholder for now as requested by user
            // In a real scenario, this would be the URL returned from storage
            const fakeUrl = URL.createObjectURL(file)
            setValue('profile_picture', fakeUrl)
            setIsUploading(false)
            toast.success('Image uploaded (simulation)')
        }, 1000)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{t('profile.title') || 'My Profile'}</h1>
                    <p className="text-slate-500 mt-1">{t('profile.subtitle') || 'Manage your personal information'}</p>
                </div>
            </div>

            <div className="glass-panel p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex items-center justify-center">
                                {profilePicture ? (
                                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-gray-300" />
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera size={24} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">{t('profile.change_photo') || 'Click to change photo'}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <User size={16} className="text-brand-500" />
                                {t('profile.name') || 'Full Name'}
                            </label>
                            <input
                                {...register('name', { required: true })}
                                className="input-modern"
                                placeholder={t('profile.name_placeholder') || 'Enter your name'}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Mail size={16} className="text-brand-500" />
                                {t('profile.email') || 'Email Address'}
                            </label>
                            <input
                                {...register('email')}
                                readOnly
                                className="input-modern bg-gray-100 cursor-not-allowed opacity-70"
                            />
                        </div>

                        {/* Mobile */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Phone size={16} className="text-brand-500" />
                                {t('profile.mobile') || 'Mobile Number'}
                            </label>
                            <input
                                {...register('mobile')}
                                className="input-modern"
                                placeholder="+966"
                                dir="ltr"
                            />
                        </div>

                        {/* City */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <MapPin size={16} className="text-brand-500" />
                                {t('profile.city') || 'City'}
                            </label>
                            <input
                                {...register('city')}
                                className="input-modern"
                            />
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                {t('profile.gender') || 'Gender'}
                            </label>
                            <select {...register('gender')} className="input-modern appearance-none">
                                <option value="">{t('common.select') || 'Select'}</option>
                                <option value="male">{t('gender.male') || 'Male'}</option>
                                <option value="female">{t('gender.female') || 'Female'}</option>
                            </select>
                        </div>

                        {/* Age Range */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                {t('profile.age_range') || 'Age Range'}
                            </label>
                            <select {...register('age_range')} className="input-modern appearance-none">
                                <option value="">{t('common.select') || 'Select'}</option>
                                <option value="18-24">18-24</option>
                                <option value="25-34">25-34</option>
                                <option value="35-44">35-44</option>
                                <option value="45-54">45-54</option>
                                <option value="55+">55+</option>
                            </select>
                        </div>

                        {/* Specialization */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Briefcase size={16} className="text-brand-500" />
                                {t('profile.specialization') || 'Specialization'}
                            </label>
                            <input
                                {...register('specialization')}
                                className="input-modern"
                                placeholder={t('profile.specialization_placeholder') || 'E.g. Sleep Medicine, Clinical Psychology'}
                            />
                        </div>

                        {/* Bio */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <FileText size={16} className="text-brand-500" />
                                {t('profile.bio') || 'Bio'}
                            </label>
                            <textarea
                                {...register('bio')}
                                className="input-modern min-h-[120px] resize-y"
                                placeholder={t('profile.bio_placeholder') || 'Write a brief biography'}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading || isUploading}
                            className="btn-primary min-w-[150px] flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{t('common.saving') || 'Saving...'}</span>
                                </>
                            ) : (
                                <span>{t('common.save') || 'Save Changes'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
