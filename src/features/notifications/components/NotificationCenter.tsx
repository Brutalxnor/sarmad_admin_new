import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks/use-notifications'
import { useLanguage } from '@/shared/context/LanguageContext'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale/ar'
import { enUS } from 'date-fns/locale/en-US'

interface NotificationCenterProps {
    onClose?: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
    const { data: notifications, isLoading } = useNotifications()
    const { mutate: markRead } = useMarkNotificationRead()
    const { mutate: markAllRead } = useMarkAllNotificationsRead()
    const { language, direction } = useLanguage()

    const locale = language === 'ar' ? ar : enUS

    const getLocalizedContent = (content: string) => {
        if (!content) return ''
        const parts = content.split(' | ')
        if (parts.length === 2) {
            return language === 'ar' ? parts[1] : parts[0]
        }
        return content
    }

    if (isLoading) {
        return (
            <div className="w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
                <div className="p-4 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                    <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
                        {direction === 'rtl' ? 'الإشعارات' : 'Notifications'}
                    </h3>
                </div>
                <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                    <div className="w-8 h-8 border-2 border-brand-200 dark:border-brand-900 border-t-brand-600 dark:border-t-brand-400 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest transition-colors">
                        {direction === 'rtl' ? 'جاري التحميل...' : 'Loading...'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
            <div className="p-4 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
                        {direction === 'rtl' ? 'الإشعارات' : 'Notifications'}
                    </h3>
                    {notifications && notifications.filter(n => !n.is_read).length > 0 && (
                        <span className="px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-[10px] font-black rounded-full transition-colors">
                            {notifications.filter(n => !n.is_read).length}
                        </span>
                    )}
                </div>
                {notifications && notifications.length > 0 && (
                    <button
                        onClick={() => markAllRead()}
                        className="text-[10px] font-black text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 uppercase tracking-widest transition-colors"
                    >
                        {direction === 'rtl' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                    </button>
                )}
            </div>

            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                {notifications && notifications.length > 0 ? (
                    <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => !n.is_read && markRead(n.id)}
                                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group relative ${!n.is_read ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg transition-colors ${!n.is_read ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                                        {n.type === 'new_order' ? '🛍️' : '🔔'}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className={`text-sm leading-tight transition-colors ${!n.is_read ? 'font-black text-slate-800 dark:text-slate-100' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
                                                {getLocalizedContent(n.title)}
                                            </p>
                                            {!n.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-brand-500 dark:bg-brand-400 shrink-0 mt-1 transition-colors" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed transition-colors">
                                            {getLocalizedContent(n.message)}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest pt-1 transition-colors">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center space-y-3">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto text-3xl grayscale opacity-50 transition-colors">
                            📭
                        </div>
                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 transition-colors">
                            {direction === 'rtl' ? 'لا توجد إشعارات حالياً' : 'No notifications yet'}
                        </p>
                    </div>
                )}
            </div>

            {onClose && (
                <div className="p-3 border-t border-slate-50 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800/30 transition-colors">
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-xs font-black text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
                    >
                        {direction === 'rtl' ? 'إغلاق' : 'Close'}
                    </button>
                </div>
            )}
        </div>
    )
}
