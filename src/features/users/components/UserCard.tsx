import { Link } from 'react-router-dom'
import type { User } from '../types'
import { useLanguage } from '@/shared/context/LanguageContext'

interface UserCardProps {
    user: User
}

export function UserCard({ user }: UserCardProps) {
    const { t, direction } = useLanguage()

    // Format dates
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return t('users.no_data')
        return new Date(dateStr).toLocaleDateString(direction === 'rtl' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const createdDate = formatDate(user.created_at)

    const isRegisteredUser = user.role === 'RegisteredUser'
    const displayName = isRegisteredUser && user.user_profile
        ? `${user.user_profile.first_name || ''} ${user.user_profile.last_name || ''}`.trim() || user.name
        : user.name

    const avatarStyles = 'bg-brand-50 text-brand-600 border-brand-100'

    return (
        <div className="glass-panel p-5 card-hover bg-white group border-transparent hover:border-brand-100 transition-all duration-300">
            <div className="relative flex items-center gap-4">
                {/* Avatar Placeholder */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold border-2 transition-colors duration-300 ${avatarStyles} overflow-hidden`}>
                    {isRegisteredUser && user.user_profile?.avatar_url ? (
                        <img src={user.user_profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                        displayName?.charAt(0) || '?'
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-base font-bold text-slate-800 truncate transition-colors">
                            {displayName || t('users.no_data')}
                        </h4>
                    </div>
                    <div className="flex items-center text-slate-400 text-xs text-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span dir="ltr">{user.mobile}</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400">{direction === 'rtl' ? 'المدينة' : 'City'}</span>
                    <span className="text-xs font-semibold text-slate-600 truncate">{user.city || t('users.no_data')}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400">{t('users.col.date')}</span>
                    <span className="text-xs font-semibold text-slate-600">{createdDate}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-5">
                <Link
                    to={`/users/${user.id}`}
                    className="w-full py-2.5 px-4 bg-slate-50 text-slate-600 font-bold text-xs rounded-xl hover:bg-brand-50 hover:text-brand-600 transition-all flex items-center justify-center gap-2 group/btn"
                >
                    <span>{t('users.view_details')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform ${direction === 'rtl' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    )
}
