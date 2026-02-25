import type { Order } from '../types'

interface OrderDetailsModalProps {
    order: Order
    onClose: () => void
}

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-slide-up no-scrollbar">
                {/* Header */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
                    <h3 className="text-xl font-extrabold text-slate-800">تفاصيل الطلب #{order.id.slice(0, 8)}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-8 text-start">
                    {/* Status & Payment Band */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">حالة التشغيل</span>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-brand-500 animate-pulse" />
                                <span className="font-bold text-slate-700">{order.operational_status}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">حالة الدفع</span>
                            <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {order.payment_status || 'Paid'}
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-brand-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <h4 className="font-bold">معلومات العميل</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <DetailItem label="الأسم الكامل" value={order.users?.name} />
                            <DetailItem label="رقم الهاتف" value={order.users?.mobile} isLtr />
                            <DetailItem label="البريد الإلكتروني" value={order.users?.email || '—'} />
                            <DetailItem label="المدينة" value={order.users?.city || '—'} />
                            <div className="col-span-full">
                                <DetailItem label="عنوان الشحن" value={order.address} />
                            </div>
                        </div>
                    </section>

                    {/* Order Details */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-brand-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <h4 className="font-bold">معلومات المنتج والتتبع</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <DetailItem label="قيمة الطلب" value={`${order.total_amount} ${order.currency}`} />
                            <DetailItem label="رقم التتبع" value={order.tracking_ref || 'لم يتم الشحن بعد'} isLtr={!!order.tracking_ref} />
                            <DetailItem label="تاريخ الطلب" value={formatDate(order.created_at)} />
                            <DetailItem label="آخر تحديث" value={formatDate(order.updated_at)} />
                            {order.report_url && (
                                <div className="col-span-full pt-2">
                                    <a
                                        href={order.report_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        عرض التقرير الطبي
                                    </a>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        إغلاق النافذة
                    </button>
                </div>
            </div>
        </div>
    )
}

function DetailItem({ label, value, isLtr }: { label: string, value?: string, isLtr?: boolean }) {
    return (
        <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <p className={`text-sm font-extrabold text-slate-700 truncate ${isLtr ? 'font-mono' : ''}`} dir={isLtr ? 'ltr' : 'rtl'}>
                {value || '—'}
            </p>
        </div>
    )
}
