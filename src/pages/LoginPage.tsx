import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/shared/context/LanguageContext'
import { staffService } from '@/features/staff/api/staffService'

import { useAuth } from '@/features/staff/context/AuthContext'

export default function LoginPage() {
    const { t, direction } = useLanguage()
    const navigate = useNavigate()
    const { login, isAuthenticated, user, checkAuth, isLoading: isAuthLoading } = useAuth()

    const [step, setStep] = useState<'login' | 'change_password'>('login')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Login Form State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // Change Password Form State
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        if (!isAuthLoading) {
            if (isAuthenticated && user) {
                if (user.must_change_password) {
                    setStep('change_password')
                } else {
                    navigate('/')
                }
            }
        }
    }, [isAuthenticated, user, navigate, isAuthLoading])


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await staffService.login({ email, password })

            if (response.success && response.data) {
                const mustChange = !!(response.data.must_change_password || response.data.user?.must_change_password);

                // Save tokens and update context with merged flag
                const accessToken = response.data.session?.access_token;
                const refreshToken = response.data.session?.refresh_token;

                if (accessToken && refreshToken && response.data.user) {
                    const userWithFlag = {
                        ...response.data.user,
                        must_change_password: mustChange
                    };
                    login(accessToken, refreshToken, userWithFlag)
                }

                if (mustChange) {
                    setStep('change_password')
                } else {
                    navigate('/')
                }
            } else {
                setError(response.message || 'Login failed')
            }
        } catch (err) {
            console.error('Login error:', err)
            const message = err instanceof Error ? err.message : 'An error occurred during login'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setError(t('staff.password_mismatch') || 'Passwords do not match')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const response = await staffService.changePassword(newPassword)
            if (response.success) {
                await checkAuth() // CRITICAL: Refresh user state to clear must_change_password flag
                navigate('/')
            } else {
                setError(response.message || 'Password change failed')
            }
        } catch (err) {
            console.error('Password change error:', err)
            const message = err instanceof Error ? err.message : 'An error occurred during password change'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-50">
                <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-brand-50/30" dir={direction}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-up border border-slate-100/50">
                {/* Header / Logo */}
                <div className="h-32 bg-brand-600 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-700"></div>
                    <div className="relative z-10 flex flex-col items-center text-white">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg mb-4 p-2">
                            <img src="/logo.png" alt={t('app.title')} className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">{t('app.title')}</h1>
                    </div>
                    {/* Decorative Circles */}
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
                </div>

                <div className="p-8">
                    {step === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">{t('auth.login_title')}</h2>
                                <p className="text-sm text-slate-500">{t('auth.login_subtitle')}</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-start gap-2">
                                    <span className="mt-0.5">⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {t('staff.form.email')}
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-black focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {t('staff.form.password')}
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-black focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? t('common.loading') : t('auth.login_button')}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-5">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">{t('auth.change_password_title')}</h2>
                                <p className="text-sm text-slate-500">{t('auth.change_password_subtitle')}</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-start gap-2">
                                    <span className="mt-0.5">⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {t('auth.new_password')}
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-black focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {t('auth.confirm_password')}
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-black focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? t('common.loading') : t('auth.change_password_button')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
