import { ReportsDashboard } from '@/features/reports/components/ReportsDashboard'

export default function ReportsPage() {
    return (
        <div className="space-y-6 animate-slide-up">
            <h1 className="text-3xl font-extrabold text-slate-800">التقارير والإحصائيات</h1>
            <ReportsDashboard />
        </div>
    )
}
