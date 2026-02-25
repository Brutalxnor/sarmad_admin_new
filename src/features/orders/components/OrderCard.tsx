import { useState } from 'react'
import { useUpdateOrderStatus } from '../hooks/use-orders'
import { OrderDetailsModal } from './OrderDetailsModal'
import { useLanguage } from '@/shared/context/LanguageContext'
import type { Order, OrderStatus } from '../types'

interface OrderCardProps {
    order: Order
}

export function OrderCard({ order }: OrderCardProps) {
    const [showDetails, setShowDetails] = useState(false)
    const { mutate: updateStatus, isPending } = useUpdateOrderStatus()
    const { t, direction } = useLanguage()

    const date = new Date(order.created_at || new Date()).toLocaleDateString(direction === 'rtl' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const statusConfig: Record<string, { label: string, color: string }> = {
        Requested: { label: t('orders.status.requested'), color: 'bg-blue-50 text-blue-600 border-blue-100' },
        Confirmed: { label: t('orders.status.confirmed'), color: 'bg-amber-50 text-amber-600 border-amber-100' },
        Shipped: { label: t('orders.status.shipped'), color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        Delivered: { label: t('orders.status.delivered'), color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        'In Use': { label: t('orders.status.in_use'), color: 'bg-purple-50 text-purple-600 border-purple-100' },
        Returned: { label: t('orders.status.returned'), color: 'bg-slate-100 text-slate-600 border-slate-200' },
        Analysis: { label: t('orders.status.analysis'), color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
        'Report Ready': { label: t('orders.status.report_ready'), color: 'bg-brand-50 text-brand-600 border-brand-100' },
        Closed: { label: t('orders.status.closed'), color: 'bg-gray-100 text-gray-500 border-gray-200' },
    }

    const currentStatus = statusConfig[order.operational_status as keyof typeof statusConfig] || { label: order.operational_status, color: 'bg-gray-50 text-gray-600' }

    const handleStatusChange = (newStatus: OrderStatus) => {
        if (newStatus === order.operational_status) return
        updateStatus({ id: order.id, status: newStatus })
    }

    return (
        <>
            <div className="glass-panel p-5 card-hover bg-white border-transparent hover:border-brand-100 transition-all duration-300 relative">
                {isPending && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100/50 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 11h14l1 12H4L5 11z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('orders.card.id')}</h4>
                            <p className="text-sm font-extrabold text-slate-800 break-all">#{order.id.slice(0, 8)}</p>
                        </div>
                    </div>

                    <div className="relative group">
                        <select
                            value={order.operational_status}
                            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                            disabled={isPending}
                            className={`appearance-none cursor-pointer text-[11px] px-3 py-1.5 ${direction === 'rtl' ? 'pr-3 pl-8' : 'pl-3 pr-8'} rounded-full border font-bold outline-none transition-all shadow-sm ${currentStatus.color} hover:bg-white`}
                        >
                            {Object.entries(statusConfig).map(([key, value]) => (
                                <option key={key} value={key} className="bg-white text-slate-700">{value.label}</option>
                            ))}
                        </select>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 absolute ${direction === 'rtl' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 pointer-events-none opacity-50`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                            <span className="text-[10px] text-slate-400 block mb-1">{t('orders.card.customer')}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-extrabold border border-white shadow-sm transition-transform hover:scale-110">
                                    {order.users?.name?.charAt(0) || 'U'}
                                </div>
                                <span className="text-xs font-bold text-slate-700 truncate">{order.users?.name || t('common.no_data')}</span>
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                            <span className="text-[10px] text-slate-400 block mb-1">{t('orders.card.date')}</span>
                            <div className="flex items-center gap-1.5 text-slate-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-extrabold">{date}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-brand-50/30 rounded-2xl border border-brand-100/30 flex justify-between items-center group/price">
                        <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">{t('orders.card.amount')}</span>
                            <span className="text-sm font-black text-brand-700 tracking-tight">{order.total_amount || '---'} {order.currency || t('common.currency')}</span>
                        </div>
                        {order.tracking_ref ? (
                            <div className={`${direction === 'rtl' ? 'text-left' : 'text-right'}`}>
                                <span className="text-[10px] text-slate-400 block mb-0.5">{t('orders.card.tracking')}</span>
                                <span className="text-[11px] font-bold text-brand-600 font-mono bg-white px-2 py-0.5 rounded-lg border border-brand-100/50">{order.tracking_ref}</span>
                            </div>
                        ) : (
                            <div className={`${direction === 'rtl' ? 'text-left' : 'text-right'}`}>
                                <span className="text-[10px] text-slate-400 block mb-0.5">---</span>
                                <span className="text-[10px] font-bold text-slate-400 italic">{t('orders.card.no_tracking')}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-5">
                    <button
                        onClick={() => setShowDetails(true)}
                        className="flex-1 py-2.5 text-xs font-extrabold text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all border border-slate-100 hover:border-brand-200 active:scale-95 flex items-center justify-center gap-2 group"
                    >
                        <span>{t('orders.card.btn_details')}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 transition-transform ${direction === 'rtl' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: direction === 'rtl' ? 'scaleX(1)' : 'scaleX(-1)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                    <button className="flex-1 py-2.5 text-xs font-extrabold text-white bg-linear-to-r from-brand-600 to-brand-500 rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all active:scale-95">
                        {t('orders.card.btn_track')}
                    </button>
                </div>
            </div>

            {showDetails && (
                <OrderDetailsModal
                    order={order}
                    onClose={() => setShowDetails(false)}
                />
            )}
        </>
    )
}
