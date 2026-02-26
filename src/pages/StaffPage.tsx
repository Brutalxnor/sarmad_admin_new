import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StaffList } from '@/features/staff/components/StaffList'

import { useLanguage } from '@/shared/context/LanguageContext'
import { useStaffList } from '@/features/staff/hooks/useStaff'
import {
    Users,
    UserCheck,
    UserMinus,
    Plus,
    Search,
    Filter,
    ChevronDown
} from 'lucide-react'
import { CreateStaffModal } from '@/features/staff/components/CreateStaffModal'

export default function StaffPage() {
    const navigate = useNavigate()
    const { t, direction, language } = useLanguage()

    const { data: staffListResponse, isLoading } = useStaffList()
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const isRTL = direction === 'rtl'
    const staff = staffListResponse?.data || []

    const stats = [
        {
            label: language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users',
            value: staff.length.toString(),
            icon: <Users className="text-[#35788D]" />,
            iconBg: 'bg-[#F4F9FB]',
            suffix: ''
        },
        {
            label: language === 'ar' ? 'المستخدمين النشطين' : 'Active Staff',
            value: staff.filter(s => !s.must_change_password).length.toString(),
            icon: <UserCheck className="text-emerald-500" />,
            iconBg: 'bg-emerald-50',
            suffix: ''
        },
        {
            label: language === 'ar' ? 'حسابات غير نشطة' : 'Inactive Accounts',
            value: staff.filter(s => s.must_change_password).length.toString(),
            icon: <UserMinus className="text-rose-500" />,
            iconBg: 'bg-rose-50',
            suffix: ''
        }
    ]

    if (isLoading) {
        return (
            <div className="max-w-[1600px] mx-auto py-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0095D9]"></div>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 animate-fade-in" dir={direction}>
            {/* Page Header */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={isRTL ? 'text-start' : 'text-end'}>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
                        {language === 'ar' ? 'إدارة الموظفين' : 'Staff Management'}
                    </h1>
                    <p className="text-slate-400 font-bold max-w-xl">
                        {language === 'ar'
                            ? 'إدارة صلاحيات الوصول والتحكم في حسابات فريق عمل سرمد'
                            : 'Manage access permissions and control accounts for the Sarmad team'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/staff/add')}
                    className="bg-[#0095D9] text-white px-8 py-4 rounded-full font-black text-lg shadow-lg shadow-[#0095D9]/30 hover:shadow-[#0095D9]/40 hover:-translate-y-1 transition-all flex items-center gap-3"
                >
                    <Plus size={24} />
                    {language === 'ar' ? 'إضافة مستخدم جديد' : 'Add New User'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center group hover:shadow-md transition-all relative">
                        <div className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} w-14 h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-4xl font-black text-slate-800 mb-2 mt-8">{stat.value}</h3>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full relative group">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={language === 'ar' ? 'بحث عن مستخدم بالاسم أو البريد...' : 'Search by name or email...'}
                        className={`w-full bg-[#F3F7F9] border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
                    />
                    <div className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors`}>
                        <Search size={20} />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-400">{language === 'ar' ? 'تصفية حسب :' : 'Filter by :'}</span>
                        <div className="relative">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="appearance-none bg-[#F4F9FB] px-6 py-3 pr-10 rounded-2xl text-slate-600 font-black text-sm hover:bg-slate-100 transition-all cursor-pointer outline-none border-none"
                            >
                                <option value="all">{language === 'ar' ? 'كل الأدوار' : 'All Roles'}</option>
                                <option value="Coach">{t('staff.role.Coach')}</option>
                                <option value="AdminOperations">{t('staff.role.AdminOperations')}</option>
                                <option value="AdminClinical">{t('staff.role.AdminClinical')}</option>
                                <option value="SuperAdmin">{t('role.superadmin')}</option>
                            </select>
                            <ChevronDown size={16} className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`} />
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-[#F4F9FB] px-6 py-3 pr-10 rounded-2xl text-slate-600 font-black text-sm hover:bg-slate-100 transition-all cursor-pointer outline-none border-none"
                        >
                            <option value="all">{language === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
                            <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
                            <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                        </select>
                        <ChevronDown size={16} className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`} />
                    </div>

                    <button
                        onClick={() => {
                            setSearchTerm('')
                            setRoleFilter('all')
                            setStatusFilter('all')
                        }}
                        className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                        title={language === 'ar' ? 'إعادة تعيين' : 'Reset Filters'}
                    >
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Staff List Table */}
            <StaffList
                searchTerm={searchTerm}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
            />

            {/* Modals */}
            <CreateStaffModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    )
}

