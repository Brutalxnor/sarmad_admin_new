import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsers } from '@/features/users/hooks/use-users'
import { useLanguage } from '@/shared/context/LanguageContext'
import { usePagination } from '@/shared/hooks/use-pagination'
import type { User } from '@/features/users/types'

export interface ProcessedUser extends User {
    status: string;
    lastLogin: string;
    roleName: string;
    avatar_url?: string;
}
import {
    Search,
    Users,
    UserCheck,
    UserCog,
    Eye,
    CheckCircle2,
    XCircle,
    MoreHorizontal
} from 'lucide-react'

export default function UsersPage() {
    const navigate = useNavigate()
    const { direction } = useLanguage()
    const { data: users, isLoading } = useUsers()
    const [searchQuery, setSearchQuery] = useState('')
    const isRTL = direction === 'rtl'

    // Mock data for last login and status if not in DB
    const processedUsers = useMemo(() => {
        if (!users) return []
        return users.map((user: User, index: number) => ({
            ...user,
            // Adding mock data for missing fields to match UI
            status: index % 3 === 0 ? 'inactive' : 'active',
            lastLogin: index === 0 ? 'منذ 5 دقائق' : 'منذ 2 ساعة',
            roleName: user.role === 'RegisteredUser' ? (isRTL ? 'مريض' : 'Patient') : (isRTL ? 'أخصائي' : 'Specialist')
        }))
    }, [users, isRTL])

    const filteredUsers = useMemo(() => {
        const query = searchQuery.toLowerCase()
        return processedUsers.filter((user: ProcessedUser) =>
            (user.name || '').toLowerCase().includes(query) ||
            (user.email || '').toLowerCase().includes(query)
        )
    }, [processedUsers, searchQuery])

    const {
        currentData: paginatedUsers,
        currentPage,
        totalPages,
        goToPage,
        startIndex,
        endIndex
    } = usePagination<ProcessedUser>({
        data: filteredUsers,
        itemsPerPage: 8
    })

    const stats = useMemo(() => {
        const total = users?.length || 0
        const patients = users?.filter((u: User) => u.role === 'RegisteredUser').length || 0
        const specialists = users?.filter((u: User) => u.role === 'specialist').length || 0

        return [
            {
                label: isRTL ? 'إجمالي المستخدمين' : 'Total Users',
                value: total.toLocaleString(),
                icon: <Users className="text-sky-500" size={24} />,
                bg: 'bg-sky-50',
                iconColor: 'text-sky-500'
            },
            {
                label: isRTL ? 'المرضى النشطون' : 'Active Patients',
                value: patients.toLocaleString(),
                icon: <UserCheck className="text-[#0095D9]" size={24} />,
                bg: 'bg-sky-50',
                iconColor: 'text-[#0095D9]'
            },
            {
                label: isRTL ? 'الأخصائيين' : 'Specialists',
                value: specialists.toLocaleString(),
                icon: <UserCog className="text-emerald-500" size={24} />,
                bg: 'bg-emerald-50',
                iconColor: 'text-emerald-500'
            }
        ]
    }, [users, isRTL])

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#35788D]"></div>
        </div>
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-10 bg-[#F9FBFC] dark:bg-slate-900 min-h-screen transition-colors duration-300" dir={direction}>
            {/* Header */}
            <div className={`flex flex-col md:flex-row justify-between items-center gap-6 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors duration-300">
                    {isRTL ? 'إدارة المستخدمين' : 'Users Management'}
                </h1>

            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-md transition-all duration-300 relative overflow-hidden">
                        <div className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} w-14 h-14 rounded-2xl ${stat.bg} dark:bg-opacity-10 flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-1 mt-8 transition-colors duration-300">{stat.value}</h3>
                        <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
                {/* Search Bar */}
                <div className="p-8 border-b border-gray-50 dark:border-slate-700/50 bg-[#F9FBFC]/30 dark:bg-slate-800/50">
                    <div className="relative max-w-4xl mx-auto group">
                        <Search className={`absolute ${isRTL ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-sky-400 dark:text-sky-500 transition-colors group-focus-within:text-[#0095D9]`} size={20} />
                        <input
                            type="text"
                            placeholder={isRTL ? 'بحث عن مستخدم...' : 'Search for a user...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-[1.5rem] py-5 ${isRTL ? 'pr-14 pl-6' : 'pl-14 pr-6'} outline-none focus:ring-4 focus:ring-[#0095D9]/20 focus:border-[#0095D9]/30 transition-all font-bold text-slate-600 dark:text-slate-200 shadow-sm text-lg`}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-[#F4F9FB]/50 dark:bg-slate-800/80 border-b border-gray-50 dark:border-slate-700/50">
                                <th className="px-8 py-6 text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{isRTL ? 'المستخدم' : 'User'}</th>
                                <th className="px-8 py-6 text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{isRTL ? 'الدور' : 'Role'}</th>
                                <th className="px-8 py-6 text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">{isRTL ? 'الحالة' : 'Status'}</th>
                                <th className="px-8 py-6 text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">{isRTL ? 'آخر تسجيل دخول' : 'Last Login'}</th>
                                <th className="px-8 py-6 text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
                                                <img
                                                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '')}&background=random`}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-700 dark:text-slate-200 text-base transition-colors duration-300">{user.name}</span>
                                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black text-slate-500 dark:text-slate-400">{user.roleName}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 ${user.status === 'active'
                                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 grayscale opacity-70'
                                                }`}>
                                                {user.status === 'active' ? (
                                                    <>
                                                        {isRTL ? 'نشط' : 'Active'}
                                                        <CheckCircle2 size={12} />
                                                    </>
                                                ) : (
                                                    <>
                                                        {isRTL ? 'غير نشط' : 'Inactive'}
                                                        <XCircle size={12} />
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-black text-slate-400 dark:text-slate-500 text-center">
                                            {user.lastLogin}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => navigate(`/users/${user.id}`)}
                                                className="p-2.5 bg-sky-50 dark:bg-sky-500/10 text-sky-500 dark:text-sky-400 rounded-xl hover:bg-[#0095D9] hover:text-white dark:hover:bg-sky-500 transition-all shadow-sm"
                                                title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2.5 bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all shadow-sm">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className={`p-8 bg-[#F9FBFC]/30 dark:bg-slate-800/50 border-t border-gray-50 dark:border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-6 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="text-slate-400 dark:text-slate-500 font-black text-sm">
                        {isRTL
                            ? `عرض ${startIndex + 1}-${Math.min(endIndex, filteredUsers.length)} من أصل ${filteredUsers.length} مستخدم`
                            : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredUsers.length)} of ${filteredUsers.length} users`
                        }
                    </div>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`w-10 h-10 rounded-xl font-black text-sm transition-all shadow-sm ${currentPage === page
                                    ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900'
                                    : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-700'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
