import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/shared/context/LanguageContext'
import {
    User,
    ChevronRight,
    ChevronLeft,
    Save,
    CreditCard,
    Lock,
    Shield,
    ShieldCheck
} from 'lucide-react'
import { useCreateStaff } from '@/features/staff/hooks/useStaff'
import { LoadingModal } from '@/shared/components/LoadingModal'
import type { StaffRole } from '@/features/staff/api/staffService'

export default function AddStaffPage() {
    const navigate = useNavigate()
    const { direction, language } = useLanguage()
    const isRTL = direction === 'rtl'
    const createStaffMutation = useCreateStaff()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'AdminClinical' as 'Coach' | 'AdminOperations' | 'AdminClinical' | 'SuperAdmin',
    })

    const handleSave = async () => {
        try {
            await createStaffMutation.mutateAsync({
                email: formData.email,
                name: formData.name,
                role: formData.role,
                password: formData.password
            })
            navigate('/staff')
        } catch (error) {
            console.error('Failed to create staff:', error)
        }
    }

    const roles = [
        {
            id: 'AdminClinical',
            title: language === 'ar' ? 'مسؤول محتوى' : 'Admin (Content/Clinical)',
            desc: 'Admin (Content/Clinical)',
            icon: <Shield className="w-6 h-6" />
        },
        {
            id: 'AdminOperations',
            title: language === 'ar' ? 'مسؤول عمليات' : 'Admin (Operations)',
            desc: 'Admin (Operations)',
            icon: <ShieldCheck className="w-6 h-6" />
        },
        {
            id: 'Coach',
            title: language === 'ar' ? 'أخصائي نوم' : 'Coach/Specialist',
            desc: 'Coach/Specialist',
            icon: <ShieldCheck className="w-6 h-6" />
        },
        {
            id: 'SuperAdmin',
            title: language === 'ar' ? 'مسؤول نظام' : 'Super Admin',
            desc: '(Super Admin)',
            icon: <Shield className="w-6 h-6" />
        }
    ]

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-10 bg-[#F9FBFC] dark:bg-slate-900 min-h-screen animate-fade-in transition-colors duration-300" dir={direction}>
            {/* Header / Breadcrumb */}
            <div className={`flex justify-between items-center mb-10 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`flex items-center gap-4 text-slate-400 font-bold text-sm ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="flex items-center gap-2">
                        {isRTL ? <ChevronRight size={18} className="text-slate-300" /> : <ChevronLeft size={18} className="text-slate-300" />}
                        <button
                            onClick={() => navigate('/staff')}
                            className="hover:text-[#35788D] transition-colors"
                        >
                            {language === 'ar' ? 'العودة لإدارة المستخدمين' : 'Back to User Management'}
                        </button>
                    </div>
                    <span className="opacity-30 text-lg dark:text-slate-500">|</span>
                    <span className="text-slate-800 dark:text-slate-100 text-base">{language === 'ar' ? 'إضافة مستخدم جديد' : 'Add New User'}</span>
                </div>
            </div>

            <div className="space-y-8">
                {/* Main Content Area */}
                <div className="space-y-8">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Personal Data Section */}
                        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm space-y-10 transition-colors duration-300">
                            <div className={`flex items-center gap-3 text-[#35788D] dark:text-[#4AA0BA] ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                <User size={24} />
                                <h2 className="text-xl font-black">{language === 'ar' ? 'البيانات الشخصية' : 'Personal Data'}</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-3">
                                    <label className="block text-slate-800 dark:text-slate-300 font-black text-sm">{language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder={language === 'ar' ? 'مثلاً: أمين محمود' : 'e.g., Amin Mahmoud'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full p-5 bg-[#F4F9FB]/50 dark:bg-slate-700/50 border border-gray-50 dark:border-slate-600 rounded-2xl outline-none focus:ring-2 focus:ring-[#0095D9]/10 focus:border-[#0095D9]/20 transition-all font-bold text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-slate-800 dark:text-slate-300 font-black text-sm">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            placeholder="Amin23@sarmad.com"
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full p-5 bg-[#F4F9FB]/50 dark:bg-slate-700/50 border border-gray-50 dark:border-slate-600 rounded-2xl outline-none focus:ring-2 focus:ring-[#0095D9]/10 focus:border-[#0095D9]/20 transition-all font-bold text-slate-700 dark:text-slate-100 text-left placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-slate-800 dark:text-slate-300 font-black text-sm">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            className="w-full p-5 bg-[#F4F9FB]/50 dark:bg-slate-700/50 border border-gray-50 dark:border-slate-600 rounded-2xl outline-none focus:ring-2 focus:ring-[#0095D9]/10 focus:border-[#0095D9]/20 transition-all font-bold text-slate-700 dark:text-slate-100 text-left placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                            dir="ltr"
                                        />
                                        <Lock size={18} className={`absolute ${isRTL ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Role Assignment Section */}
                        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm space-y-10 transition-colors duration-300">
                            <div className={`flex items-center gap-3 text-[#35788D] dark:text-[#4AA0BA] ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                <CreditCard size={24} />
                                <h2 className="text-xl font-black">{language === 'ar' ? 'تعيين الدور' : 'Role Assignment'}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => setFormData(prev => ({ ...prev, role: role.id as StaffRole }))}
                                        className={`relative p-8 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-4 ${formData.role === role.id
                                            ? 'border-[#0095D9] bg-sky-50/10 dark:bg-[#0095D9]/10'
                                            : 'border-slate-50 dark:border-slate-700 hover:border-slate-100 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${formData.role === role.id ? 'bg-[#0095D9] text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                                            {role.icon}
                                        </div>
                                        <div>
                                            <h4 className={`text-base font-black mb-1 ${formData.role === role.id ? 'text-[#0095D9]' : 'text-slate-800 dark:text-slate-100'}`}>
                                                {role.title}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">
                                                {role.desc}
                                            </p>
                                        </div>
                                        {formData.role === role.id && (
                                            <div className="absolute top-4 right-4 bg-[#0095D9] text-white rounded-full p-0.5">
                                                <Shield size={12} className="fill-current" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons at the Bottom */}
                    <div className={`flex items-center gap-4 mt-10 ${isRTL ? 'flex-row-reverse justify-start' : 'flex-row justify-end'}`}>
                        <button
                            onClick={() => navigate('/staff')}
                            className="px-10 py-4 rounded-[1.25rem] bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-[#0095D9] font-black hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                        >
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={createStaffMutation.isPending}
                            className="px-12 py-4 rounded-[1.25rem] bg-[#0095D9] text-white font-black flex items-center justify-center gap-3 hover:bg-[#0084c2] transition-all shadow-lg shadow-[#0095D9]/20 disabled:opacity-50"
                        >
                            <Save size={20} />
                            {language === 'ar' ? 'حفظ' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            <LoadingModal
                isOpen={createStaffMutation.isPending}
                title={language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                message={language === 'ar' ? 'يرجى الانتظار، جاري حفظ بيانات الموظف الجديد' : 'Please wait, saving new staff member data'}
            />
        </div>
    )
}
