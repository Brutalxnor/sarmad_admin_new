import { useState } from 'react'
import { useOrders } from '../hooks/use-orders'
import { useLanguage } from '@/shared/context/LanguageContext'
import { OrderCard } from './OrderCard'
import type { Order } from '../types'

import { usePagination } from '@/shared/hooks/use-pagination'
import { Pagination } from '@/shared/components/Pagination'

export function OrderList() {
    const { data: orders, isLoading } = useOrders()
    const { t, direction } = useLanguage()
    const [selectedStatus, setSelectedStatus] = useState<string>('all')

    const statuses = [
        { id: 'all', label: t('orders.status.all') },
        { id: 'Requested', label: t('orders.status.requested') },
        { id: 'Confirmed', label: t('orders.status.confirmed') },
        { id: 'Shipped', label: t('orders.status.shipped') },
        { id: 'Delivered', label: t('orders.status.delivered') },
        { id: 'In Use', label: t('orders.status.in_use') },
        { id: 'Returned', label: t('orders.status.returned') },
        { id: 'Analysis', label: t('orders.status.analysis') },
        { id: 'Report Ready', label: t('orders.status.report_ready') },
        { id: 'Closed', label: t('orders.status.closed') },
    ]

    const filteredOrders = orders?.filter((order: Order) =>
        selectedStatus === 'all' || order.operational_status === selectedStatus
    )

    // Pagination - Important: Paginate the FILTERED results
    const { currentData: paginatedOrders, currentPage, totalPages, goToPage } = usePagination<Order>({
        data: filteredOrders || [],
        itemsPerPage: 10
    })

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((idx) => (
                    <div key={idx} className="glass-panel h-64 animate-pulse bg-slate-100/50 rounded-2xl" />
                ))}
            </div>
        )
    }



    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500">
                        {filteredOrders?.length || 0} {t('orders.count_suffix')}
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <span className={`absolute ${direction === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </span>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className={`w-full appearance-none bg-white border border-slate-200 rounded-2xl py-2.5 ${direction === 'rtl' ? 'pr-11 pl-10 text-right' : 'pl-11 pr-10 text-left'} text-sm font-bold text-slate-700 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all cursor-pointer shadow-sm shadow-slate-200/50`}
                        >
                            {statuses.map(status => (
                                <option key={status.id} value={status.id}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                        <span className={`absolute ${direction === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>

            {!filteredOrders || filteredOrders.length === 0 ? (
                <div className="glass-panel p-20 text-center animate-fade-in bg-white/50 border-dashed border-2 border-slate-100">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 11h14l1 12H4L5 11z" />
                        </svg>
                    </div>
                    <h4 className="text-xl font-black text-slate-800 mb-2">{t('orders.empty')}</h4>
                    <p className="text-slate-400 font-bold max-w-sm mx-auto">{t('orders.empty_desc')}</p>
                    {selectedStatus !== 'all' && (
                        <button
                            onClick={() => setSelectedStatus('all')}
                            className="mt-6 text-brand-600 font-black text-sm hover:underline"
                        >
                            View all orders
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                        {paginatedOrders.map((order: Order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                    />
                </>
            )}
        </div>
    )
}
