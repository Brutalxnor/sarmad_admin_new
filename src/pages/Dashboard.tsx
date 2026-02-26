import { useLanguage } from '../shared/context/LanguageContext'
import { useAuth } from '@/features/staff/context/AuthContext'
import { Users, Activity, Video, Database } from 'lucide-react'
import { useRecentAuditLogs } from '@/features/staff/hooks/useAuditLogs'
import { useDashboardStats } from '@/features/dashboard/hooks/use-dashboard-stats'
import { useNotifications, useMarkNotificationRead } from '@/features/notifications/hooks/use-notifications'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

export default function Dashboard() {
    const { t, language } = useLanguage()
    const { user } = useAuth()
    const isRTL = language === 'ar'

    const { data: recentLogsResponse, isLoading: isLoadingLogs } = useRecentAuditLogs(5)
    const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats()
    const { data: notifications, isLoading: isLoadingNotifications } = useNotifications(5)
    const { mutate: markRead } = useMarkNotificationRead()

    const statsData = dashboardStats || {
        users: 0,
        orders: 0,
        assessments: 0,
        webinars: 0
    }

    const stats = [
        {
            title: t('dashboard.users'),
            value: statsData.users.toLocaleString(),
            change: '+12.5% عن الشهر الماضي',
            icon: <Users size={24} className="text-sky-400" />,
            bgColor: 'bg-sky-50',
            trend: 'up'
        },
        {
            title: t('dashboard.completed_tests'),
            value: statsData.assessments.toLocaleString(),
            change: '+8.2% عن الشهر الماضي',
            icon: <Activity size={24} className="text-teal-400" />,
            bgColor: 'bg-teal-50',
            trend: 'up'
        },
        {
            title: t('dashboard.upcoming_webinars'),
            value: statsData.webinars.toLocaleString(),
            change: 'ويبنار قادم (هذا الشهر)',
            icon: <Video size={24} className="text-rose-400" />,
            bgColor: 'bg-rose-50',
            trend: 'neutral'
        },
        {
            title: t('dashboard.new_orders') || 'طلبات جديدة',
            value: statsData.orders.toLocaleString(),
            change: '+13.2% عن الشهر الماضي',
            icon: <Database size={24} className="text-emerald-400" />,
            bgColor: 'bg-emerald-50',
            trend: 'up'
        },
    ]

    const getModuleStyle = (module: string) => {
        const styles: Record<string, string> = {
            'Content': 'bg-blue-100 text-blue-600',
            'Order': 'bg-sky-100 text-sky-600',
            'Webinar': 'bg-slate-100 text-slate-600',
            'StaffAuth': 'bg-indigo-100 text-indigo-600',
            'System': 'bg-gray-100 text-gray-600',
        }
        return styles[module] || 'bg-slate-50 text-slate-400'
    }

    const activities = (recentLogsResponse?.data || []).map(log => ({
        id: log.id,
        text: log.message_ar,
        user: log.staff_name || (isRTL ? 'النظام' : 'System'),
        time: formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: isRTL ? ar : undefined }),
        initial: (log.staff_name || 'S').charAt(0),
        color: getModuleStyle(log.module)
    }))

    const getAlertColor = (priority?: string, is_read?: boolean) => {
        if (is_read) return 'bg-slate-50 border-slate-200 text-slate-600'
        if (priority === 'high') return 'bg-rose-50 border-rose-200 text-rose-800'
        if (priority === 'medium') return 'bg-orange-50 border-orange-200 text-orange-800'
        return 'bg-sky-50 border-sky-200 text-sky-800'
    }

    const unreadCount = notifications?.filter(n => !n.is_read).length ?? 0

    return (
        <div className="space-y-10 animate-fade-in max-w-[1600px] mx-auto px-4 py-6">
            {/* Branding Header Area (Dashboard Exclusive) */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-800">{t('dashboard.overview') || 'نظرة عامة على النظام'}</h2>
                </div>
            </div>

            {/* Welcome Section */}
            <div className="mb-10 text-right">
                <h1 className="text-4xl font-black text-[#35788D] mb-3">
                    {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || 'أحمد' })}
                </h1>
                <p className="text-gray-400 font-bold text-sm">{t('dashboard.subtitle')}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoadingStats ? (
                    // Stats Skeletons
                    [1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col items-center lg:items-start animate-pulse">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 mb-6"></div>
                            <div className="w-1/2 h-3 bg-gray-100 rounded-full mb-3"></div>
                            <div className="w-3/4 h-8 bg-gray-100 rounded-full mb-3"></div>
                            <div className="w-1/3 h-2 bg-gray-50 rounded-full"></div>
                        </div>
                    ))
                ) : (
                    stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col items-center lg:items-start group hover:shadow-md transition-shadow">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center mb-6`}>
                                {stat.icon}
                            </div>
                            <div className="text-center lg:text-start">
                                <p className="text-gray-400 font-bold text-xs mb-2">{stat.title}</p>
                                <h3 className="text-4xl font-black text-slate-800 mb-2">
                                    {stat.value}
                                </h3>

                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Recent Activities - Right Side (Larger) */}
                <div className="lg:col-span-8 bg-white rounded-[2rem] p-10 shadow-sm border border-gray-50">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-slate-800">{t('dashboard.recent_activity')}</h3>
                        <button className="text-gray-400 font-bold text-sm hover:text-[#35788D] transition-colors">{t('dashboard.view_all') || 'عرض الكل'}</button>
                    </div>

                    <div className="space-y-8">
                        {isLoadingLogs ? (
                            // Loading Skeletons
                            [1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between animate-pulse">
                                    <div className="space-y-3 flex-1">
                                        <div className="h-5 bg-gray-100 rounded-full w-3/4"></div>
                                        <div className="h-3 bg-gray-50 rounded-full w-1/2"></div>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-gray-100"></div>
                                </div>
                            ))
                        ) : activities.length === 0 ? (
                            <div className="py-10 text-center text-gray-400 italic font-bold">
                                {isRTL ? 'لا توجد أنشطة حالية' : 'No recent activities'}
                            </div>
                        ) : (
                            activities.map((act) => (
                                <div key={act.id} className="flex items-center justify-between group cursor-default">
                                    <div className="text-start">
                                        <h4 className="font-bold text-slate-800 text-lg mb-1">{act.text}</h4>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">{act.time}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-gray-400 font-bold">{act.user}</span>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-12 rounded-full ${act.color} flex items-center justify-center font-black text-lg shadow-inner`}>
                                        {act.initial}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* System Alerts - Left Side (Smaller) */}
                <div className="lg:col-span-4 bg-white rounded-[2rem] p-10 shadow-sm border border-gray-50 relative">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black text-slate-800">{t('dashboard.system_alerts') || 'تنبيهات النظام'}</h3>
                        {unreadCount > 0 && (
                            <div className="w-6 h-6 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-rose-200">
                                {unreadCount}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 mb-10">
                        {isLoadingNotifications ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse bg-slate-50 rounded-2xl p-5 h-16" />
                            ))
                        ) : notifications && notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => !notification.is_read && markRead(notification.id)}
                                    className={`${getAlertColor(notification.priority, notification.is_read)} p-5 rounded-2xl border-s-4 transition-all hover:scale-[1.02] cursor-pointer text-start`}
                                >
                                    <h4 className={`text-sm mb-1.5 ${!notification.is_read ? 'font-black' : 'font-bold opacity-70'}`}>
                                        {notification.message}
                                    </h4>
                                    <span className="opacity-60 text-xs font-bold">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: isRTL ? ar : undefined })}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center text-slate-300">
                                <p className="text-sm font-bold">{isRTL ? 'لا توجد تنبيهات' : 'No notifications'}</p>
                            </div>
                        )}
                    </div>

                    <button className="w-full py-4 bg-[#0095D9] text-white font-black rounded-2xl shadow-lg shadow-[#0095D9]/30 hover:shadow-[#0095D9]/40 hover:-translate-y-0.5 transition-all">
                        {t('dashboard.view_all_alerts') || 'عرض جميع التنبيهات'}
                    </button>
                </div>

            </div>
        </div>
    )
}
