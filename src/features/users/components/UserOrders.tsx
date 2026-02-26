import { useLanguage } from '@/shared/context/LanguageContext'
import type { Order } from '@/features/orders/types'
import { Database, CreditCard, Clock, Truck, FileSearch } from 'lucide-react'

export function UserOrders({ orders }: { orders: Order[] }) {
    const { direction, language } = useLanguage()
    const isRTL = direction === 'rtl'

    if (orders.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-12 text-center border border-gray-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Database size={40} className="text-slate-200 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 mb-2">
                    {isRTL ? 'لا توجد طلبات مسجلة' : 'No orders recorded'}
                </h3>
                <p className="text-slate-300 dark:text-slate-500 font-bold max-w-xs mx-auto">
                    {isRTL ? 'لم يقم هذا المستخدم بتقديم أي طلبات شراء أو اشتراك بعد.' : 'This user has not placed any purchase or subscription orders yet.'}
                </p>
            </div>
        )
    }

    const totalAmount = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const pendingOrders = orders.filter(o => o.operational_status === 'Requested' || o.operational_status === 'Confirmed').length

    const getStatusStyles = (status: string) => {
        const s = status.toLowerCase()
        if (s === 'shipped' || s === 'delivered') return 'bg-sky-50 dark:bg-sky-500/10 text-sky-500 border-sky-100 dark:border-sky-500/20'
        if (s === 'closed' || s === 'confirmed') return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border-emerald-100 dark:border-emerald-500/20'
        if (s === 'requested') return 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 border-rose-100 dark:border-rose-500/20'
        if (s === 'analysis') return 'bg-purple-50 dark:bg-purple-500/10 text-purple-500 border-purple-100 dark:border-purple-500/20'
        return 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-300 border-slate-100 dark:border-slate-600'
    }

    const getStatusLabel = (status: string) => {
        if (!isRTL) return status
        const s = status.toLowerCase()
        switch (s) {
            case 'requested': return 'قيد المعالجة'
            case 'confirmed': return 'تم التأكيد'
            case 'shipped': return 'تم الشحن'
            case 'delivered': return 'تم التوصيل'
            case 'analysis': return 'قيد التحليل'
            case 'closed': return 'تم الانتهاء'
            default: return status
        }
    }

    return (
        <div className="space-y-8">
            {/* Orders Table Card */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
                <div className={`p-8 border-b border-slate-50 dark:border-slate-700/50 bg-slate-50/10 dark:bg-slate-800 flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{isRTL ? 'سجل الطلبات' : 'Orders History'}</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={`bg-slate-50/50 dark:bg-slate-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'رقم الطلب' : 'Order ID'}</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'التاريخ' : 'Date'}</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'الخدمة / المنتج' : 'Service / Product'}</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'السعر' : 'Price'}</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'الحالة' : 'Status'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50 dark:divide-slate-700/50">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-400 dark:text-slate-500 group-hover:text-[#35788D] dark:group-hover:text-[#4AA0BA] transition-colors">#{order.id.slice(-5).toUpperCase()}</span>
                                            {order.tracking_ref && (
                                                <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 flex items-center gap-1">
                                                    <Truck size={10} />
                                                    {order.tracking_ref}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                            {new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-[#35788D]/10 dark:group-hover:bg-[#4AA0BA]/20 group-hover:text-[#35788D] dark:group-hover:text-[#4AA0BA] transition-all">
                                                <FileSearch size={16} />
                                            </div>
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                                                {isRTL ? 'جهاز دراسة النوم المنزلي' : 'Home Sleep Test Device'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black text-[#35788D] dark:text-[#4AA0BA]">
                                            {order.total_amount ? order.total_amount.toLocaleString() : '--'} {isRTL ? 'ر.س' : 'SAR'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(order.operational_status)}`}>
                                            {getStatusLabel(order.operational_status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className={`p-6 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                        <span className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-slate-800/10">1</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 italic">
                        {isRTL ? `عرض 1-${orders.length} من أصل ${orders.length} طلب` : `Showing 1-${orders.length} of ${orders.length} orders`}
                    </span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isRTL ? 'dir-rtl' : ''}`}>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center relative group hover:shadow-md transition-all duration-300">
                    <div className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 flex items-center justify-center`}>
                        <Database size={24} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2 mt-4 transition-colors duration-300">{orders.length}</h3>
                    <p className="text-slate-300 dark:text-slate-500 text-[11px] font-black uppercase tracking-wider">{isRTL ? 'إجمالي الطلبات' : 'Total Orders'}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center relative group hover:shadow-md transition-all duration-300">
                    <div className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-500 lg flex items-center justify-center`}>
                        <CreditCard size={24} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2 mt-4 transition-colors duration-300">{totalAmount.toLocaleString()} <span className="text-sm font-bold text-slate-400 dark:text-slate-500">{isRTL ? 'ر.س' : 'SAR'}</span></h3>
                    <p className="text-slate-300 dark:text-slate-500 text-[11px] font-black uppercase tracking-wider">{isRTL ? 'إجمالي المدفوعات' : 'Total Payments'}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center relative group hover:shadow-md transition-all duration-300">
                    <div className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center`}>
                        <Clock size={24} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2 mt-4 transition-colors duration-300">{pendingOrders}</h3>
                    <p className="text-slate-300 dark:text-slate-500 text-[11px] font-black uppercase tracking-wider">{isRTL ? 'طلبات المعلقة' : 'Pending Orders'}</p>
                </div>
            </div>
        </div>
    )
}
