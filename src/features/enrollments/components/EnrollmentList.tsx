import { useEnrollments } from '../hooks/use-enrollments'
import { EnrollmentCard } from './EnrollmentCard'
import { useLanguage } from '@/shared/context/LanguageContext'

import { usePagination } from '@/shared/hooks/use-pagination'
import { Pagination } from '@/shared/components/Pagination'
import type { ProgramEnrollment as Enrollment } from '../types'

export function EnrollmentList() {
    const { data: enrollments, isLoading } = useEnrollments()
    const { t } = useLanguage()

    // Pagination
    const { currentData: paginatedEnrollments, currentPage, totalPages, goToPage } = usePagination<Enrollment>({
        data: enrollments || [],
        itemsPerPage: 9
    })

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-panel h-64 animate-pulse bg-slate-100/50 rounded-2xl" />
                ))}
            </div>
        )
    }

    if (!enrollments || enrollments.length === 0) {
        return (
            <div className="glass-panel p-20 text-center animate-fade-in">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100">
                    <span className="text-4xl">📋</span>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">{t('enrollments.empty')}</h3>
                <p className="text-slate-400 font-bold max-w-sm mx-auto">
                    Users haven't started any program templates yet. They will appear here once they enroll.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-slate-500">
                    {enrollments.length} Active Enrollments found
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedEnrollments.map((enrollment: Enrollment) => (
                    <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
            />
        </div>
    )
}
