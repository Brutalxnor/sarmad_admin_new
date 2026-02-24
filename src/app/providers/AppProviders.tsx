import type { ReactNode } from 'react'
import { QueryProvider } from './QueryProvider'
import { LanguageProvider } from '@/shared/context/LanguageContext'
import { AuthProvider } from '@/features/staff/context/AuthContext'
import { BrowserRouter } from 'react-router-dom'

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <BrowserRouter>
            <QueryProvider>
                <LanguageProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </LanguageProvider>
            </QueryProvider>
        </BrowserRouter>
    )
}
