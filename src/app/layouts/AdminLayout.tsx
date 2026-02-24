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
    Search,
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
    Package,
    DollarSign,
    BarChart2,
    Shield,
    Sliders,
    ChevronsRight,
    Users
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

export function AdminLayout() {
    useRealtimeNotifications()
    const { data: unreadCount } = useUnreadNotificationsCount()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { direction, t, language, toggleLanguage } = useLanguage()
    const { user, isLoading, logout, isAuthenticated } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const navItems = useMemo(() => [
        { path: '/', icon: <Home size={22} />, label: t('nav.dashboard') },
        { path: '/cms', icon: <BookOpen size={22} />, label: t('nav.cms') },
        { path: '/assessments', icon: <CheckSquare size={22} />, label: t('nav.questions') },
        { path: '/staff', icon: <UserRound size={22} />, label: t('nav.staff') },
        { path: '/users', icon: <Users size={22} />, label: t('nav.users') },
        { path: '/pricing', icon: <Package size={22} />, label: t('nav.pricing') },
        { path: '/orders', icon: <DollarSign size={22} />, label: t('nav.orders') },
        { path: '/reports', icon: <BarChart2 size={22} />, label: t('nav.reports') },
        { path: '/integrations', icon: <Settings size={22} />, label: t('nav.integrations') || 'Integrations' },
        { path: '/audit', icon: <Shield size={22} />, label: t('nav.audit') || 'Audit' },
        { path: '/settings', icon: <Sliders size={22} />, label: t('nav.platform_settings') || 'Platform Settings' },
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
        <div className="h-screen overflow-hidden bg-surface-50 flex text-slate-800 font-sans" dir={direction}>

            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
                fixed inset-y-0 ${direction === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'} z-40 bg-white border-gray-100 
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
                        className={`p-2 text-gray-300 hover:text-brand-500 hover:bg-gray-50 rounded-xl transition-all hidden md:block ${isCollapsed ? 'mt-4' : ''}`}
                    >
                        <ChevronsRight size={24} className={`transition-transform duration-500 ${isCollapsed ? '' : 'rotate-180'}`} />
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
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
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
                <div className="px-4 py-6 space-y-3 border-t border-gray-50">
                    <button
                        onClick={() => setIsNotificationsOpen(true)}
                        className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                        <Bell size={22} className={`flex-shrink-0 ${isCollapsed ? '' : 'ml-3'}`} />
                        {!isCollapsed && <span className="font-bold text-sm flex-1 text-start">{t('nav.notifications') || 'الإشعارات'}</span>}
                    </button>

                    <button
                        onClick={logout}
                        className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                        <LogOut size={22} className={`flex-shrink-0 ${isCollapsed ? '' : 'ml-3'}`} />
                        {!isCollapsed && <span className="font-bold text-sm flex-1 text-start">{t('auth.logout')}</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top Header */}
                <header className="h-20 bg-white border-b border-gray-100 px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-gray-100/50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>

                        {/* Page Title */}
                        <h2 className="text-xl font-black text-slate-800 hidden sm:block">
                            {navItems.find(i => i.path === location.pathname)?.label || t('nav.dashboard')}
                        </h2>
                    </div>

                    <div className="flex-1 flex justify-center max-w-2xl px-8">
                        {/* Search Bar */}
                        <div className="relative w-full group">
                            <input
                                type="text"
                                placeholder={t('search.placeholder_platform') || 'بحث في المنصة...'}
                                className="w-full bg-[#F3F7F9] border-none rounded-2xl py-3 px-6 pr-12 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all"
                            />
                            <div className={`absolute ${direction === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors`}>
                                <Search size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Divider */}
                        <div className="hidden md:block w-px h-8 bg-gray-100" />

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-gray-50 hover:text-slate-600 transition-all">
                                <Settings size={22} />
                            </button>

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

                            <button
                                onClick={toggleLanguage}
                                className="px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black bg-[#F3F7F9] text-[#35788D] hover:bg-[#35788D] hover:text-white transition-all shadow-sm active:scale-95"
                            >
                                <span className="uppercase">{language === 'ar' ? 'EN' : 'AR'}</span>
                                <div className="w-px h-3 bg-current opacity-20" />
                                <span>{language === 'ar' ? 'English' : 'العربية'}</span>
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-4 border-r border-gray-100 pr-6 mr-2 hidden lg:flex">
                            <div className="text-left hidden xl:block">
                                <p className="text-sm font-black text-slate-800 leading-none mb-1">{user?.name}</p>
                                <p className="text-[11px] text-gray-400 font-bold">{t(`role.${user?.role?.toLowerCase()}`) || user?.role}</p>
                            </div>
                            <div className="relative group cursor-pointer" onClick={() => navigate('/profile')}>
                                <img
                                    src={user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=0d9488&color=fff`}
                                    alt={user?.name}
                                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-400 ring-offset-2 transition-transform group-hover:scale-105"
                                />
                            </div>
                            <button className="text-gray-300 hover:text-brand-500 transition-colors">
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
