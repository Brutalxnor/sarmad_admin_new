import { OrderList } from '@/features/orders/components/OrderList'
import { useLanguage } from '@/shared/context/LanguageContext'

export default function OrdersPage() {
    const { t } = useLanguage()

    return (
        <div className="space-y-6 animate-slide-up">
            <h1 className="text-3xl font-extrabold text-slate-800">{t('nav.orders')}</h1>
            <OrderList />
        </div>
    )
}
