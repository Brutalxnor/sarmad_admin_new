import { useState } from 'react'
import { useUsers } from '../hooks/use-users'
import { useLanguage } from '@/shared/context/LanguageContext'
import { UserCard } from './UserCard'
import type { User } from '../types'

import { usePagination } from '@/shared/hooks/use-pagination'
import { Pagination } from '@/shared/components/Pagination'

export function UserList() {
    const { data: users, isLoading } = useUsers()
    const { t } = useLanguage()
    const [searchQuery, setSearchQuery] = useState('')

    const filteredUsers = users?.filter((user: User) => {
        // Only show RegisteredUser
        if (user.role !== 'RegisteredUser') return false

        const name = user.name || ''
        const mobile = user.mobile || ''
        const search = searchQuery.toLowerCase()

        return name.toLowerCase().includes(search) || mobile.includes(searchQuery)
    })

    // Pagination
    const { currentData: paginatedUsers, currentPage, totalPages, goToPage } = usePagination<User>({
        data: filteredUsers || [],
        itemsPerPage: 7 // Restricted to 7 as requested
    })

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                    <div key={idx} className="glass-panel h-40 animate-pulse bg-slate-100/50 rounded-2xl" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-slate-500">
                        {filteredUsers?.length || 0} {t('users.count_suffix')}
                    </p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder={t('users.search_placeholder')}
                        className="input-modern pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {paginatedUsers && paginatedUsers.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                        {paginatedUsers.map((user: User) => (
                            <UserCard key={user.id} user={user} />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                    />
                </>
            ) : (
                <div className="glass-panel p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <p className="text-slate-500 font-medium">{t('users.empty_desc') || 'لا يوجد مستخدمين متاحين حالياً'}</p>
                </div>
            )}
        </div>
    )
}
