import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { staffService, type StaffUser } from '@/features/staff/api/staffService'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
    user: StaffUser | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (token: string, refreshToken: string, user: StaffUser) => void
    logout: () => void
    checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<StaffUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    const checkAuth = async () => {
        const token = localStorage.getItem('admin_token')

        if (!token) {
            setIsLoading(false)
            return
        }

        try {
            // console.log('Verifying token...')
            const response = await staffService.getCurrentUser()
            console.log('Auth check response:', response)

            // Check if user is nested in data.user or directly in data
            const userData = response.data?.user || (response.data as unknown as StaffUser)

            if (response.success && userData) {
                // Merge top-level flag if present to ensure it's always on the user object
                const mustChange = response.data?.must_change_password ?? userData.must_change_password
                const finalUser = { ...userData, must_change_password: !!mustChange }

                setUser(finalUser)
            } else {
                console.warn('Token validation failed:', response)
                // Invalid token or session expired
                localStorage.removeItem('admin_token')
                setUser(null)
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
            localStorage.removeItem('admin_token')
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    // Check for existing token and fetch user on mount
    useEffect(() => {
        checkAuth()
    }, [])

    const login = (token: string, refreshToken: string, newUser: StaffUser) => {
        localStorage.setItem('admin_token', token)
        localStorage.setItem('admin_refresh_token', refreshToken)
        setUser(newUser)
    }

    const logout = async () => {
        setIsLoading(true)
        try {
            await staffService.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('admin_token')
            localStorage.removeItem('admin_refresh_token')
            setUser(null)
            setIsLoading(false)
            navigate('/login')
        }
    }

    // Protect routes (optional, can be moved to a specific component or layout if needed)
    // For now, we just provide the state

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth
    }

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
            {isLoading && (
                <div className="min-h-screen flex items-center justify-center bg-surface-50">
                    <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                </div>
            )}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
