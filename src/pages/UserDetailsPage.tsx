import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUserDetails } from '@/features/users/hooks/use-users'
import { useLanguage } from '@/shared/context/LanguageContext'
import { AssessmentList } from '../features/users/components/UserAssessments'
import { UserOrders } from '../features/users/components/UserOrders'
import { UserBookings } from '../features/users/components/UserBookings'
import {
    Activity,
    Mail,
    Phone,
    Calendar,
    TrendingUp,
    Users,
    Clock,
    MoreHorizontal
} from 'lucide-react'

export default function UserDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user, assessments, orders, bookings, isLoadingAll } = useUserDetails(id || '')
    const { direction } = useLanguage()
    const [activeTab, setActiveTab] = useState('personal')

    const isRTL = direction === 'rtl'

    if (isLoadingAll) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F9FBFC]">
                <div className="w-12 h-12 border-4 border-[#35788D] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="p-12 text-center bg-[#F9FBFC] dark:bg-slate-900 min-h-screen transition-colors duration-300">
                <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-6">{isRTL ? 'لم يتم العثور على المستخدم' : 'User not found'}</p>
                    <button onClick={() => navigate('/users')} className="bg-[#35788D] text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-[#35788D]/20 hover:-translate-y-1 transition-all">
                        {isRTL ? 'العودة للقائمة' : 'Go Back'}
                    </button>
                </div>
            </div>
        )
    }

    const tabs = [
        { id: 'personal', label: isRTL ? 'معلومات شخصية' : 'Personal Info' },
        { id: 'sleep', label: isRTL ? 'سجل النوم' : 'Sleep Log' },
        { id: 'tests', label: isRTL ? 'سجل الإختبارات' : 'Tests Log' },
        { id: 'orders', label: isRTL ? 'الطلبات' : 'Orders' },
        { id: 'bookings', label: isRTL ? 'الحجوزات' : 'Bookings' },
    ]

    const supervisors = [
        { name: isRTL ? 'أحمد عبدالله' : 'Ahmed Abdullah', role: isRTL ? 'أخصائي طب النوم' : 'Sleep Specialist', img: 'https://i.pravatar.cc/150?u=a1' },
        { name: isRTL ? 'أحمد عبدالله' : 'Ahmed Abdullah', role: isRTL ? 'أخصائي طب النوم' : 'Sleep Specialist', img: 'https://i.pravatar.cc/150?u=a2' },
    ]

    return (
        <div className="bg-[#F9FBFC] dark:bg-slate-900 min-h-screen pb-20 transition-colors duration-300" dir={direction}>
            {/* Top Bar / Breadcrumb */}
            <div className="max-w-[1400px] mx-auto px-6 pt-8 mb-8">
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <h1 className="text-[28px] font-black text-slate-800 dark:text-slate-100 transition-colors duration-300">{isRTL ? 'ملف المريض' : 'Patient File'}</h1>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 space-y-8">
                {/* Header Card */}
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group transition-colors duration-300">
                    <div className={`flex flex-col lg:flex-row items-center justify-between gap-10 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {/* User Main Info */}
                        <div className={`flex flex-col lg:flex-row items-center gap-8 flex-1 ${isRTL ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-slate-50 dark:border-slate-700 overflow-hidden shadow-xl ring-4 ring-[#35788D]/5 transition-transform duration-500 group-hover:scale-105">
                                    <img
                                        src={user.user_profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=35788D&color=fff&size=200`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full shadow-sm" />
                            </div>

                            <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                                <div className={`flex flex-wrap items-center gap-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                    <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors duration-300">{user.name}</h2>
                                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <span className="bg-sky-50 dark:bg-sky-500/10 text-sky-500 px-4 py-1.5 rounded-xl text-xs font-black border border-sky-100/50 dark:border-sky-500/20 uppercase">
                                            {isRTL ? `رقم المريض #${user.id.slice(-5)}` : `Patient ID #${user.id.slice(-5)}`}
                                        </span>
                                        <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-400 px-4 py-1.5 rounded-xl text-xs font-black border border-rose-100/50 dark:border-rose-500/20 uppercase">
                                            VIP
                                        </span>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                    <Calendar size={16} />
                                    <span>{isRTL ? `تم التسجيل منذ: ${new Date(user.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}` : `Registered since: ${new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className={`flex items-center gap-6 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className="bg-[#F8FBFC] dark:bg-slate-700/50 p-6 rounded-[2rem] border border-gray-50 dark:border-slate-600 flex flex-col items-center justify-center min-w-[160px] group/stat hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all duration-300">
                                <span className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-300">
                                    {assessments && assessments.length > 0 ? assessments[0].score : 0}
                                    <span className="text-sm text-slate-300 dark:text-slate-500 ml-1">/100</span>
                                </span>
                                <div className="flex items-center gap-2 text-[#35788D] dark:text-[#4AA0BA]">
                                    <TrendingUp size={14} />
                                    <span className="text-[11px] font-black uppercase tracking-wider">{isRTL ? 'آخر نتيجة تقييم' : 'Last assessment'}</span>
                                </div>
                            </div>
                            <div className="bg-[#F8FBFC] dark:bg-slate-700/50 p-6 rounded-[2rem] border border-gray-50 dark:border-slate-600 flex flex-col items-center justify-center min-w-[160px] group/stat hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all duration-300">
                                <span className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-300">{assessments?.length || 0}</span>
                                <span className="text-slate-300 dark:text-slate-500 text-[11px] font-black uppercase tracking-wider">{isRTL ? 'الجلسات المكتملة' : 'Completed Sessions'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Sidebar */}
                    <div className="lg:w-[380px] space-y-8 order-2 lg:order-1">
                        {/* Activity Summary Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-700 shadow-sm space-y-8 transition-colors duration-300">
                            <div className={`flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`flex items-center gap-3 text-[#35788D] dark:text-[#4AA0BA] ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <Activity size={24} />
                                    <h3 className="text-lg font-black dark:text-slate-100">{isRTL ? 'ملخص النشاط الأخير' : 'Recent Activity Summary'}</h3>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className={`flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <span className="text-slate-400 dark:text-slate-500 font-bold">{isRTL ? 'متوسط ساعات النوم' : 'Avg. Sleep Hours'}</span>
                                    <span className="text-slate-800 dark:text-slate-100 font-black">
                                        {assessments && assessments.length > 0 ? (assessments[0].score > 80 ? '7.5' : '6.2') : '--'} {isRTL ? 'ساعة' : 'Hrs'}
                                    </span>
                                </div>
                                <div className={`flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <span className="text-slate-400 dark:text-slate-500 font-bold">{isRTL ? 'انقطاع التنفس' : 'Sleep Apnea'}</span>
                                    <span className={`font-black ${assessments && assessments.length > 0 ? (assessments[0].score > 70 ? 'text-rose-500' : 'text-emerald-500') : 'text-slate-300 dark:text-slate-600'}`}>
                                        {assessments && assessments.length > 0
                                            ? (assessments[0].score > 70 ? (isRTL ? 'مرتفع' : 'High') : (isRTL ? 'منخفض' : 'Low'))
                                            : '--'}
                                    </span>
                                </div>
                                <div className={`flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <span className="text-slate-400 dark:text-slate-500 font-bold">{isRTL ? 'جودة النوم' : 'Sleep Quality'}</span>
                                    <span className={`font-black ${assessments && assessments.length > 0 ? (assessments[0].score > 50 ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-300 dark:text-slate-600'}`}>
                                        {assessments && assessments.length > 0
                                            ? (assessments[0].score > 50 ? (isRTL ? 'ممتاز' : 'Excellent') : (isRTL ? 'متوسط' : 'Medium'))
                                            : '--'}
                                    </span>
                                </div>
                            </div>

                            <button className="w-full py-4 rounded-2xl bg-[#F8FBFC] dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 text-slate-500 dark:text-slate-300 font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                                {isRTL ? 'عرض التقرير المفصل' : 'View Detailed Report'}
                            </button>
                        </div>

                        {/* Specialists Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-700 shadow-sm space-y-8 transition-colors duration-300">
                            <div className={`flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`flex items-center gap-3 text-[#35788D] dark:text-[#4AA0BA] ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <Users size={24} />
                                    <h3 className="text-lg font-black dark:text-slate-100">{isRTL ? 'المشرفين' : 'Supervisors'}</h3>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {supervisors.map((staff, i) => (
                                    <div key={i} className={`flex items-center gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-50 dark:border-slate-700 shadow-sm">
                                            <img src={staff.img} alt={staff.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className={isRTL ? 'text-right' : 'text-left'}>
                                            <h4 className="font-black text-slate-800 dark:text-slate-100">{staff.name}</h4>
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{staff.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area (Tabs + Details) */}
                    <div className="flex-1 space-y-8 order-1 lg:order-2">
                        {/* Tabs Navigation */}
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden p-2 transition-colors duration-300">
                            <div className={`flex items-center ${isRTL ? 'flex-row' : 'flex-row-reverse'} overflow-x-auto no-scrollbar`}>
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 min-w-max px-4 py-4 text-sm font-black transition-all relative rounded-xl ${activeTab === tab.id
                                            ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-500 shadow-sm ring-1 ring-sky-100 dark:ring-sky-500/20'
                                            : 'text-slate-300 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="animate-fade-in">
                            {activeTab === 'personal' && (
                                <div className="space-y-8">
                                    {/* Contact Details Section */}
                                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
                                        <div className={`p-8 border-b border-slate-50 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800 flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{isRTL ? 'بيانات الاتصال' : 'Contact Details'}</h3>
                                            <button className="text-slate-300 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                                                <MoreHorizontal size={24} />
                                            </button>
                                        </div>
                                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-10">
                                            <InfoItem
                                                icon={<Mail size={20} className="text-[#35788D]" />}
                                                label={isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                                                value={user.email || 'N/A'}
                                                isRTL={isRTL}
                                            />
                                            <InfoItem
                                                icon={<Phone size={20} className="text-[#35788D]" />}
                                                label={isRTL ? 'رقم الجوال' : 'Mobile Number'}
                                                value={user.mobile}
                                                isRTL={isRTL}
                                                dir="ltr"
                                            />
                                            <InfoItem
                                                icon={<Calendar size={20} className="text-[#35788D]" />}
                                                label={isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}
                                                value={isRTL ? '12 مايو 1988 (36 سنة)' : 'May 12, 1988 (36 yrs)'}
                                                isRTL={isRTL}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'tests' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{isRTL ? 'سجل الإختبارات' : 'Tests Log'}</h2>
                                        <span className="bg-sky-50 dark:bg-sky-500/10 text-sky-500 px-4 py-1 rounded-full text-xs font-black ring-1 ring-sky-100 dark:ring-sky-500/20">{assessments?.length || 0}</span>
                                    </div>
                                    <AssessmentList assessments={assessments || []} />
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{isRTL ? 'الطلبات' : 'Orders'}</h2>
                                        <span className="bg-sky-50 dark:bg-sky-500/10 text-sky-500 px-4 py-1 rounded-full text-xs font-black ring-1 ring-sky-100 dark:ring-sky-500/20">{orders?.length || 0}</span>
                                    </div>
                                    <UserOrders orders={orders || []} />
                                </div>
                            )}

                            {activeTab === 'bookings' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{isRTL ? 'الحجوزات' : 'Bookings'}</h2>
                                        <span className="bg-sky-50 dark:bg-sky-500/10 text-sky-500 px-4 py-1 rounded-full text-xs font-black ring-1 ring-sky-100 dark:ring-sky-500/20">{bookings?.length || 0}</span>
                                    </div>
                                    <UserBookings bookings={bookings || []} />
                                </div>
                            )}

                            {activeTab === 'sleep' && (
                                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-16 border border-gray-100 dark:border-slate-700 shadow-sm text-center transition-colors duration-300">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 dark:text-slate-600">
                                        <Clock size={40} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 mb-2">{isRTL ? 'لا يوجد سجل نوم متاح' : 'No sleep log available'}</h3>
                                    <p className="text-slate-300 dark:text-slate-500 font-bold max-w-xs mx-auto">{isRTL ? 'سيتم مزامنة بيانات سجل النوم من تطبيق المستخدم قريباً' : 'Sleep log data will be synced from the user app soon'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface InfoItemProps {
    label: string
    value: string
    icon: React.ReactNode
    isRTL: boolean
    dir?: string
}

function InfoItem({ label, value, icon, isRTL, dir }: InfoItemProps) {
    return (
        <div className={`flex items-start gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className="w-12 h-12 rounded-2xl bg-[#F8FBFC] dark:bg-slate-700/50 border border-gray-50 dark:border-slate-600 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className={`space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest block">{label}</span>
                <span className="text-base font-black text-slate-700 dark:text-slate-200 block" dir={dir}>{value}</span>
            </div>
        </div>
    )
}
