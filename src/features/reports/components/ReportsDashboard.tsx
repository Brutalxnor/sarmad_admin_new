import { useReports } from '../hooks/use-reports'
import { useLanguage } from '@/shared/context/LanguageContext'

export function ReportsDashboard() {
    useReports()
    const { t } = useLanguage()

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6">
                    <h4 className="text-slate-500 text-sm mb-2">{t('reports.revenue')}</h4>
                    <p className="text-2xl font-bold text-slate-800">0 {t('common.currency')}</p>
                </div>
                <div className="glass-panel p-6">
                    <h4 className="text-slate-500 text-sm mb-2">{t('reports.new_users')}</h4>
                    <p className="text-2xl font-bold text-slate-800">0</p>
                </div>
                <div className="glass-panel p-6">
                    <h4 className="text-slate-500 text-sm mb-2">{t('reports.conversion')}</h4>
                    <p className="text-2xl font-bold text-slate-800">0%</p>
                </div>
            </div>

            <div className="glass-panel p-6 h-96 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                {t('reports.chart_area')}
            </div>
        </div>
    )
}
