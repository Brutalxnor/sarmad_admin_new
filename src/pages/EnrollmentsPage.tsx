import { EnrollmentList } from '@/features/enrollments/components/EnrollmentList'
import { useLanguage } from '@/shared/context/LanguageContext'

export default function EnrollmentsPage() {
    const { t } = useLanguage()

    return (
        <div className="space-y-8 animate-slide-up max-w-7xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                        {t('enrollments.title')}
                    </h1>
                    <p className="text-slate-500 font-bold mt-1">
                        Monitor user progress and adherence across all program templates
                    </p>
                </div>
            </div>

            <EnrollmentList />
        </div>
    )
}
