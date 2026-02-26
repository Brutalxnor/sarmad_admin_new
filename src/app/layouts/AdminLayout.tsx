import { Outlet, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useLanguage } from '../../shared/context/LanguageContext'
import { useAuth } from '@/features/staff/context/AuthContext'
import type { StaffRole } from '@/features/staff/api/staffService'
import { useRealtimeNotifications } from '@/shared/hooks/use-realtime-notifications'
import { Toaster } from 'react-hot-toast'
import { useUnreadNotificationsCount } from '@/features/notifications/hooks/use-notifications'
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter'
import {
    // Search, // Temporarily unused
    Bell,
    Menu,
    LogOut,
    Settings,
    ChevronLeft,
    ChevronRight,
    Home,
    BookOpen,
    CheckSquare,
    UserRound,
    DollarSign,
    ChevronsRight,
    Users,
    Sun,
    Moon
} from 'lucide-react'

// Define permissions map
const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
    // Coach: Consultations, Enrollments (Programs), Profile
    Coach: ['/consultations', '/enrollments', '/profile'],

    // Admin (Operations): Dashboard, Orders, Enrollments, Content (CMS - View/Edit/Delete only), Profile
    AdminOperations: ['/', '/orders', '/enrollments', '/cms', '/profile'],

    // Admin (Clinical): Dashboard, CMS, Assessments, Webinars, Profile
    AdminClinical: ['/', '/cms', '/assessments', '/webinars', '/profile'],

    // Super Admin: All access
    SuperAdmin: ['*']
}

import { useTheme } from '@/shared/hooks/use-theme'

export function AdminLayout() {
    useRealtimeNotifications()
    const { data: unreadCount } = useUnreadNotificationsCount()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    // const [searchQuery, setSearchQuery] = useState('') // Temporarily disabled
    const { direction, t, language, toggleLanguage } = useLanguage()
    const { user, isLoading, logout, isAuthenticated } = useAuth()
    const { setTheme, isDark } = useTheme()
    const location = useLocation()
    const navigate = useNavigate()

    const navItems = useMemo(() => [
        { path: '/', icon: <Home size={22} />, label: t('nav.dashboard') },
        { path: '/cms', icon: <BookOpen size={22} />, label: t('nav.cms') },
        { path: '/assessments', icon: <CheckSquare size={22} />, label: t('nav.questions') },
        { path: '/staff', icon: <UserRound size={22} />, label: t('nav.staff') },
        { path: '/users', icon: <Users size={22} />, label: t('nav.users') },
        //  { path: '/pricing', icon: <Package size={22} />, label: t('nav.pricing') },
        { path: '/orders', icon: <DollarSign size={22} />, label: t('nav.orders') },
        // { path: '/reports', icon: <BarChart2 size={22} />, label: t('nav.reports') },
        // { path: '/integrations', icon: <Settings size={22} />, label: t('nav.integrations') || 'Integrations' },
        // { path: '/audit', icon: <Shield size={22} />, label: t('nav.audit') || 'Audit' },
        // { path: '/settings', icon: <Sliders size={22} />, label: t('nav.platform_settings') || 'Platform Settings' },
    ], [t])

    // Filter nav items based on user role
    const filteredNavItems = useMemo(() => {
        if (!user) return []

        // Super Admin gets everything EXCEPT Profile (as per request "unless superadmin")
        if (user.role === 'SuperAdmin') {
            return navItems.filter(item => item.path !== '/profile')
        }

        const allowedPaths = ROLE_PERMISSIONS[user.role] || []
        return navItems.filter(item => allowedPaths.includes(item.path))
    }, [user, navItems])

    // const searchResults = useMemo(() => {
    //     if (!searchQuery.trim()) return []
    //     const query = searchQuery.toLowerCase()
    //     return filteredNavItems.filter(item =>
    //         item.label.toLowerCase().includes(query) ||
    //         item.path.toLowerCase().includes(query)
    //     )
    // }, [searchQuery, filteredNavItems])

    // Auth Guard
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-50">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (user?.must_change_password) {
        return <Navigate to="/login" replace />
    }

    // Optional: Redirect if trying to access unauthorized route
    const isAuthorized = (path: string) => {
        if (!user) return false
        if (user.role === 'SuperAdmin') return true

        const allowedPaths = ROLE_PERMISSIONS[user.role] || []
        if (path === '/') return allowedPaths.includes('/')

        return allowedPaths.some(allowed => path.startsWith(allowed))
    }

    const currentPathRoot = '/' + location.pathname.split('/')[1]
    const isCurrentPathAllowed = isAuthorized(currentPathRoot) || location.pathname === '/'

    if (!isCurrentPathAllowed) {
        return <Navigate to="/" replace />
    }

    return (
        <div className="h-screen overflow-hidden bg-surface-50 dark:bg-slate-900 flex text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300" dir={direction}>

            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
                fixed inset-y-0 ${direction === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'} z-40 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 
                transition-all duration-300 ease-in-out md:static flex flex-col group
                ${isMobileMenuOpen ? 'translate-x-0' : (direction === 'rtl' ? 'translate-x-full' : '-translate-x-full')}
                md:translate-x-0 ${isCollapsed ? 'w-24' : 'w-80'}
            `}>
                {/* Logo Area */}
                <div className={`h-28 flex items-center px-10 relative ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <div className="flex flex-col items-center flex-1">
                            <span className="text-5xl font-black bg-linear-to-b from-[#0096CC] to-[#000000] bg-clip-text text-transparent tracking-tighter hover:scale-105 transition-transform cursor-default">سرمد</span>
                            <span className="text-[11px] text-gray-400 font-bold mt-1 tracking-[0.2em] opacity-80 uppercase">لوحة المسؤول</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`p-2 text-gray-300 hover:text-brand-500 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all hidden md:block ${isCollapsed ? 'mt-4' : ''}`}
                    >
                        <ChevronsRight size={24} className={`transition-transform duration-500 ${direction === 'rtl'
                            ? (isCollapsed ? 'rotate-180' : '')
                            : (isCollapsed ? '' : 'rotate-180')
                            }`} />
                    </button>
                    {isCollapsed && <span className="text-sm font-black bg-linear-to-b from-[#0096CC] to-[#000000] bg-clip-text text-transparent absolute -bottom-4 opacity-70">سرمد</span>}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto no-scrollbar">
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative ${isActive
                                    ? 'bg-[#35788D] text-white shadow-xl shadow-[#35788D]/30 active-nav-glow'
                                    : 'text-gray-400 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-200'
                                } ${isCollapsed ? 'justify-center px-0' : ''}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${isCollapsed ? '' : 'ml-3'}`}>
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && <span className="font-bold flex-1 text-sm">{item.label}</span>}
                                    {!isActive && !isCollapsed && (
                                        <div className="text-gray-300">
                                            {direction === 'rtl' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="px-4 py-6 space-y-3 border-t border-gray-50 dark:border-slate-800">
                    {/* <button
                        onClick={() => setIsNotificationsOpen(true)}
                        className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-200 transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                        <Bell size={22} className={`flex-shrink-0 ${isCollapsed ? '' : 'ml-3'}`} />
                        {!isCollapsed && <span className="font-bold text-sm flex-1 text-start">{t('nav.notifications') || 'الإشعارات'}</span>}
                    </button> */}

                    <button
                        onClick={logout}
                        className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                        <LogOut size={22} className={`flex-shrink-0 ${isCollapsed ? '' : 'ml-3'}`} />
                        {!isCollapsed && <span className="font-bold text-sm flex-1 text-start">{t('auth.logout')}</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top Header */}
                <header className="h-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-gray-100/50 dark:shadow-none transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>

                        {/* Page Title */}
                        <h2 className="text-xl font-black text-slate-800 dark:text-white hidden sm:block transition-colors duration-300">
                            {navItems.find(i => i.path === location.pathname)?.label || t('nav.dashboard')}
                        </h2>
                    </div>

                    <div className="flex-1 flex justify-center max-w-2xl px-8 relative">
                        {/* Search Bar (Temporarily Disabled per request)
                        <div className="relative w-full group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('search.placeholder_platform') || 'بحث في المنصة...'}
                                className="w-full bg-[#F3F7F9] dark:bg-slate-800 border-none rounded-2xl py-3 px-6 pr-12 text-sm font-bold text-slate-600 dark:text-slate-200 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                            />
                            <div className={`absolute ${direction === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors`}>
                                <Search size={20} />
                            </div>

                            // Search Results Dropdown
                            {searchResults.length > 0 && (
                                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 py-3 z-50 animate-slide-up overflow-hidden">
                                    <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-700/50 mb-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('search.results') || 'نتائج البحث'}</p>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto no-scrollbar px-2">
                                        {searchResults.map(result => (
                                            <button
                                                key={result.path}
                                                onClick={() => {
                                                    navigate(result.path)
                                                    setSearchQuery('')
                                                }}
                                                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group text-start"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-slate-700 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all">
                                                    {result.icon}
                                                </div>
                                                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{result.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {searchQuery.trim() !== '' && searchResults.length === 0 && (
                                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-6 z-50 animate-slide-up text-center">
                                    <p className="text-sm font-bold text-slate-400">{t('search.no_results') || 'لا توجد نتائج تطابق بحثك'}</p>
                                </div>
                            )}
                        </div>
                        */}
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Divider */}
                        <div className="hidden md:block w-px h-8 bg-gray-100 dark:bg-slate-800" />

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-brand-500`}
                                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {isDark ? <Sun size={22} className="text-amber-400" /> : <Moon size={22} />}
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSettingsOpen ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:bg-gray-50 hover:text-slate-600'}`}
                                >
                                    <Settings size={22} />
                                </button>

                                {isSettingsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[100]" onClick={() => setIsSettingsOpen(false)} />
                                        <div className={`absolute top-full mt-2 ${direction === 'rtl' ? 'left-0' : 'right-0'} z-[110] w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 py-3 animate-slide-up overflow-hidden transition-colors duration-300`}>
                                            <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-700/50 mb-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('nav.settings') || (language === 'ar' ? 'الإعدادات' : 'Settings')}</p>
                                            </div>

                                            <div className="px-2 space-y-1">
                                                {/* Language Toggle Link */}
                                                <button
                                                    onClick={() => {
                                                        toggleLanguage()
                                                        setIsSettingsOpen(false)
                                                    }}
                                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-slate-700 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all">
                                                            <span className="text-xs font-black uppercase">{language === 'ar' ? 'EN' : 'AR'}</span>
                                                        </div>
                                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{language === 'ar' ? 'تغيير للإنجليزية' : 'Switch to Arabic'}</span>
                                                    </div>
                                                </button>

                                                {/* Profile Link */}
                                                <button
                                                    onClick={() => {
                                                        navigate('/profile')
                                                        setIsSettingsOpen(false)
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-300 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all">
                                                        <UserRound size={18} />
                                                    </div>
                                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{t('profile.title') || (language === 'ar' ? 'الملف الشخصي' : 'Profile')}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group ${isNotificationsOpen ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:bg-gray-50 hover:text-slate-600'}`}
                                >
                                    <Bell size={22} />
                                    {unreadCount && unreadCount > 0 && (
                                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
                                    )}
                                </button>

                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[100]" onClick={() => setIsNotificationsOpen(false)} />
                                        <div className={`absolute top-full mt-2 ${direction === 'rtl' ? 'left-0' : 'right-0'} z-[110]`}>
                                            <NotificationCenter onClose={() => setIsNotificationsOpen(false)} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-4 border-r border-gray-100 dark:border-slate-800 pr-6 mr-2 hidden lg:flex">
                            <div className="text-left hidden xl:block">
                                <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none mb-1">{user?.name}</p>
                                <p className="text-[11px] text-gray-400 dark:text-slate-400 font-bold">{t(`role.${user?.role?.toLowerCase()}`) || user?.role}</p>
                            </div>
                            <div className="relative group cursor-pointer" onClick={() => navigate('/profile')}>
                                <img
                                    src={user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=0d9488&color=fff`}
                                    alt={user?.name}
                                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-400 dark:ring-emerald-500/50 ring-offset-2 dark:ring-offset-slate-900 transition-transform group-hover:scale-105"
                                />
                            </div>
                            <button className="text-gray-300 dark:text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                                {direction === 'rtl' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto pb-10">
                        <Outlet />
                    </div>
                </div>
            </main>
            <Toaster />
        </div>
    )
}
