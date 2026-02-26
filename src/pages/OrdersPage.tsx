import { useState } from 'react'
import { useOrders, useUpdateOrderStatus } from '@/features/orders/hooks/use-orders'
import { useConsultations } from '@/features/consultations/hooks/use-consultations'
import { usePagination } from '@/shared/hooks/use-pagination'
import { Pagination } from '@/shared/components/Pagination'
import { toast } from 'react-hot-toast'
import {
    Search,
    Video,
    TrendingUp,
    Package,
    Users,
    Eye,
    Edit2,
    XCircle,
    Clock,
    Box,
    AlertCircle,
    ChevronDown
} from 'lucide-react'

type OrderRow = {
    id: string;
    rawId: string;
    type: string;
    user: string;
    userId: string;
    status: string;
    statusLabel: string;
    operationalStatus: string;
    assignee: string;
    sla: string;
    slaStatus: string;
};

type ConsultationsRow = {
    id: string;
    rawId: string;
    patient: string;
    patientId: string;
    patientImg: string;
    doctor: string;
    dateTime: string;
    time: string;
    type: string;
    rawStatus: string;
    status: string;
    statusLabel: string;
}

type PaginatedDataItem = OrderRow | ConsultationsRow;


const TABS = [
    { id: 'all', label: 'جميع الطلبات' },
    { id: 'consultations', label: 'الاستشارات' },
    { id: 'programs', label: 'البرامج' },
    { id: 'sla', label: 'SLA' }
]

const ORDER_STATUS_FILTERS = [
    { id: 'all', label: 'الكل' },
    { id: 'pending', label: 'قيد الانتظار' },
    { id: 'in_progress', label: 'قيد التنفيذ' },
    { id: 'completed', label: 'مكتمل' }
]

export default function OrdersPage() {
    const { data: realOrders, isLoading: ordersLoading } = useOrders()
    const { data: consultations, isLoading: consultationsLoading, updateStatus: updateConsultationStatus } = useConsultations()
    const updateOrderMutation = useUpdateOrderStatus()

    const [activeTab, setActiveTab] = useState('all')
    const [orderStatusFilter, setOrderStatusFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Map backend orders to UI structure
    const mappedOrders: OrderRow[] = !realOrders ? [] : realOrders.map((order: any): OrderRow => {
        const status = (order.operational_status || '').toLowerCase();
        let uiStatus = 'pending';
        let uiLabel = 'قيد الانتظار';

        if (status === 'completed' || status === 'delivered') {
            uiStatus = 'completed';
            uiLabel = 'مكتملة';
        } else if (status === 'confirmed' || status === 'shipped' || status === 'in use') {
            uiStatus = 'in_progress';
            uiLabel = 'قيد التنفيذ';
        }

        return {
            id: rowId(order.id),
            rawId: order.id,
            type: (order.id || '').startsWith('HST') ? 'دراسة نوم منزلية' : 'طلب خدمة',
            user: order.users?.name || 'مستخدم غير معروف',
            userId: order.users?.id,
            status: uiStatus,
            statusLabel: uiLabel,
            operationalStatus: order.operational_status,
            assignee: 'غير محدد',
            sla: '36 ساعة متبقية',
            slaStatus: 'normal'
        }
    })

    const mappedConsultations: ConsultationsRow[] = !consultations ? [] : consultations.map((item: any): ConsultationsRow => {
        const status = (item.status || 'pending').toLowerCase()
        const scheduledDate = item.scheduled_at ? new Date(item.scheduled_at) : null

        return {
            id: item.id,
            rawId: item.id,
            patient: item.users?.name || item.user?.name || 'مستخدم غير معروف',
            patientId: item.user_id?.substring(0, 8),
            patientImg: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.users?.name || 'U')}&background=random`,
            doctor: item.specialist?.name || 'غير محدد',
            dateTime: scheduledDate ? scheduledDate.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }) : 'غير محدد',
            time: scheduledDate ? scheduledDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '',
            type: item.type?.name_ar || 'استشارة',
            rawStatus: item.status,
            status: status === 'confirmed' ? 'in_progress' : status === 'completed' ? 'completed' : status === 'cancelled' ? 'canceled' : 'pending',
            statusLabel: status === 'confirmed' ? 'تم التأكيد' : status === 'completed' ? 'مكتمل' : status === 'cancelled' ? 'ملغي' : 'قيد الانتظار'
        }
    })

    function rowId(id: string) {
        if (!id) return ''
        if (id.length > 8 && !id.includes('-')) return `HST-${id.substring(0, 4)}`
        return id
    }

    let filteredData: PaginatedDataItem[] = [];
    if (activeTab === 'all') {
        let data: PaginatedDataItem[] = mappedOrders;
        if (orderStatusFilter !== 'all') {
            data = data.filter((o) => (o as OrderRow).status === orderStatusFilter)
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter((o) =>
                (o as OrderRow).id.toLowerCase().includes(q) ||
                (o as OrderRow).user.toLowerCase().includes(q)
            )
        }
        filteredData = data;
    } else if (activeTab === 'consultations') {
        let data: PaginatedDataItem[] = mappedConsultations;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter((item) =>
                (item as ConsultationsRow).patient.toLowerCase().includes(q) ||
                (item as ConsultationsRow).doctor.toLowerCase().includes(q)
            )
        }
        filteredData = data;
    }

    const {
        currentData: paginatedData,
        currentPage,
        totalPages,
        goToPage,
        startIndex,
        endIndex,
        totalItems
    } = usePagination<PaginatedDataItem>({
        data: filteredData,
        itemsPerPage: 5
    })

    const today = new Date().toDateString()
    const consultationsToday = mappedConsultations.filter((c: ConsultationsRow) => {
        if (!c.dateTime) return false
        // This is a simple check, in reality, we might need to parse the date properly
        return c.dateTime.includes(today) || c.status === 'pending'
    }).length

    const activePrograms = mappedOrders.filter((o: OrderRow) => o.status === 'in_progress').length
    const totalServices = mappedOrders.length
    const activeUsersCount = new Set(mappedOrders.map((o: OrderRow) => o.userId).filter(Boolean)).size

    const stats = [
        {
            count: consultationsToday,
            label: 'الاستشارات اليوم',
            icon: <Video size={20} />,
            bg: 'bg-blue-50',
            textColor: 'text-blue-500',
            gradient: 'from-blue-500/10 to-transparent'
        },
        {
            count: activePrograms,
            label: 'البرامج النشطة',
            icon: <TrendingUp size={20} />,
            bg: 'bg-emerald-50',
            textColor: 'text-emerald-500',
            gradient: 'from-emerald-500/10 to-transparent'
        },
        {
            count: totalServices,
            label: 'إجمالي الخدمات',
            icon: <Package size={20} />,
            bg: 'bg-[#E0F7F9]',
            textColor: 'text-[#00BCD4]',
            gradient: 'from-[#00BCD4]/10 to-transparent'
        },
        {
            count: activeUsersCount,
            label: 'المستخدمين النشطين',
            icon: <Users size={20} />,
            bg: 'bg-orange-50',
            textColor: 'text-orange-500',
            gradient: 'from-orange-500/10 to-transparent'
        }
    ]

    const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await updateOrderMutation.mutateAsync({ id: orderId, status: newStatus })
            toast.success('تم تحديث حالة الطلب بنجاح')
        } catch (error) {
            console.error('Failed to update status:', error)
            toast.error('فشل في تحديث حالة الطلب')
        }
    }

    const handleConsultationStatusChange = async (bookingId: string, newStatus: string) => {
        try {
            await updateConsultationStatus({ id: bookingId, status: newStatus })
            toast.success('تم تحديث حالة الاستشارة بنجاح')
        } catch (error) {
            console.error('Failed to update consultation status:', error)
            toast.error('فشل في تحديث حالة الاستشارة')
        }
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]'
            case 'pending':
                return 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]'
            case 'in_progress':
                return 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]'
            case 'canceled':
            case 'cancelled':
                return 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]'
            default:
                return 'bg-gray-50 text-gray-600 border-gray-100'
        }
    }


    const isLoading = activeTab === 'all' ? ordersLoading : consultationsLoading

    return (
        <div className="space-y-8 animate-slide-up pb-10 bg-[#F9FBFC] dark:bg-slate-900 min-h-screen transition-colors duration-300">
            {/* Header */}
            <div className="flex justify-between items-end mb-4 px-6 pt-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors duration-300">إدارة الخدمات</h1>
                    <p className="text-slate-400 dark:text-slate-500 font-bold text-base">الطلبات، الاستشارات، البرامج، و SLA</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-500 cursor-default">
                        <div className={`absolute -right-4 -top-4 w-32 h-32 bg-linear-to-br ${stat.gradient} opacity-20 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-40`} />
                        <div className={`w-14 h-14 rounded-[1.25rem] ${stat.bg} dark:bg-opacity-10 ${stat.textColor} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                            {stat.icon}
                        </div>
                        <div className="text-center relative z-10">
                            <h3 className="text-5xl font-black text-slate-800 dark:text-slate-100 mb-2 tabular-nums transition-colors duration-300">{stat.count}</h3>
                            <p className="text-slate-400 dark:text-slate-500 font-bold text-sm uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Strip */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-2 shadow-sm border border-gray-50 dark:border-slate-700 mx-6 overflow-x-auto no-scrollbar transition-colors duration-300">
                <div className="flex items-center min-w-max">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id)
                                goToPage(1)
                            }}
                            className={`relative px-8 py-4 text-sm font-black transition-all duration-300 ${activeTab === tab.id
                                ? 'text-[#35788D] dark:text-[#4AA0BA]'
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                {tab.id === 'all' && <Box size={18} />}
                                {tab.id === 'consultations' && <Video size={18} />}
                                {tab.id === 'programs' && <TrendingUp size={18} />}
                                {tab.id === 'sla' && <Clock size={18} />}
                                {tab.label}
                            </span>
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#35788D] rounded-full shadow-[0_-2px_10px_rgba(53,120,141,0.5)]" />
                            )}
                        </button>
                    ))}
                    <div className="flex-1" />
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-sm border border-gray-50 dark:border-slate-700 mx-6 flex flex-col md:flex-row items-center gap-6 transition-colors duration-300">
                <div className="relative flex-1 group w-full">
                    <input
                        type="text"
                        placeholder="ابحث عن مريض، دكتور، رقم الموعد"
                        className="w-full bg-[#F3F7F9] dark:bg-slate-900/50 border-none rounded-2xl py-4 px-12 text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-[#35788D]/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-[#35788D] dark:group-focus-within:text-[#4AA0BA] transition-colors" size={20} />
                </div>

                {activeTab === 'all' && (
                    <div className="flex bg-[#F3F7F9] dark:bg-slate-900/50 p-1.5 rounded-2xl gap-2 w-full md:w-auto">
                        {ORDER_STATUS_FILTERS.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => {
                                    setOrderStatusFilter(filter.id)
                                    goToPage(1)
                                }}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-black transition-all ${orderStatusFilter === filter.id
                                    ? 'bg-[#1D353E] dark:bg-slate-700 text-white shadow-lg'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Table Area */}
            <div className="px-6">
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-gray-50 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-[#F8FAFB] dark:bg-slate-800/80 border-b border-gray-50 dark:border-slate-700/50 transition-colors duration-300">
                                    {activeTab === 'all' ? (
                                        <>
                                            <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-slate-400 transition-colors duration-300">رقم الطلب</th>
                                            <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-slate-400 transition-colors duration-300">النوع</th>
                                            <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-slate-400 transition-colors duration-300">المستخدم</th>
                                            <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-slate-400 transition-colors duration-300">الحالة</th>
                                            <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-slate-400 transition-colors duration-300">المسؤول</th>
                                            <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-slate-400 transition-colors duration-300">SLA</th>
                                            <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-slate-400 transition-colors duration-300 text-center">إجراءات</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-slate-400 transition-colors duration-300">اسم المريض</th>
                                            <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-slate-400 transition-colors duration-300">الطبيب المختص</th>
                                            <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-slate-400 transition-colors duration-300">التاريخ والوقت</th>
                                            <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-slate-400 transition-colors duration-300">النوع</th>
                                            <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-slate-400 transition-colors duration-300">الحالة</th>
                                            <th className="px-8 py-6 text-sm font-black text-slate-500 dark:text-slate-400 transition-colors duration-300 text-center">إجراءات</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={activeTab === 'all' ? 7 : 6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-4 border-[#35788D]/20 border-t-[#35788D] dark:border-[#4AA0BA]/20 dark:border-t-[#4AA0BA] rounded-full animate-spin" />
                                                <p className="text-slate-400 dark:text-slate-500 font-bold">جاري تحميل البيانات...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={activeTab === 'all' ? 7 : 6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <AlertCircle size={40} className="text-slate-200 dark:text-slate-700 transition-colors duration-300" />
                                                <p className="text-slate-400 dark:text-slate-500 font-bold text-lg transition-colors duration-300">لا توجد بيانات متاحة حالياً</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedData.map((row: PaginatedDataItem) => (
                                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                                        {activeTab === 'all' ? (
                                            <>
                                                <td className="px-8 py-6 font-black text-slate-700 dark:text-slate-200 transition-colors duration-300">{(row as OrderRow).id}</td>
                                                <td className="px-8 py-6">
                                                    <span className="px-4 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black transition-colors duration-300">
                                                        {(row as OrderRow).type}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 font-bold text-slate-600 dark:text-slate-300">{(row as OrderRow).user}</td>
                                                <td className="px-8 py-6">
                                                    <div className="relative group/status inline-block">
                                                        <select
                                                            value={(row as OrderRow).operationalStatus || 'Requested'}
                                                            onChange={(e) => handleOrderStatusChange((row as OrderRow).rawId, e.target.value)}
                                                            className={`appearance-none inline-flex items-center px-4 py-2 rounded-xl text-xs font-black border tracking-wide gap-2 outline-none cursor-pointer transition-all dark:bg-opacity-20 dark:border-opacity-30 ${getStatusStyles((row as OrderRow).status)}`}
                                                        >
                                                            <option value="Requested" className="dark:bg-slate-800 dark:text-slate-200">قيد الانتظار (Requested)</option>
                                                            <option value="Confirmed" className="dark:bg-slate-800 dark:text-slate-200">تم التأكيد (Confirmed)</option>
                                                            <option value="Shipped" className="dark:bg-slate-800 dark:text-slate-200">تم الشحن (Shipped)</option>
                                                            <option value="Delivered" className="dark:bg-slate-800 dark:text-slate-200">تم التوصيل (Delivered)</option>
                                                            <option value="In Use" className="dark:bg-slate-800 dark:text-slate-200">قيد الاستخدام (In Use)</option>
                                                            <option value="Returned" className="dark:bg-slate-800 dark:text-slate-200">تم الارجاع (Returned)</option>
                                                            <option value="Analysis" className="dark:bg-slate-800 dark:text-slate-200">قيد التحليل (Analysis)</option>
                                                            <option value="Report Ready" className="dark:bg-slate-800 dark:text-slate-200">التقرير جاهز (Report Ready)</option>
                                                            <option value="Closed" className="dark:bg-slate-800 dark:text-slate-200">مغلق (Closed)</option>
                                                        </select>
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover/status:opacity-100">
                                                            <ChevronDown size={12} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-slate-400 dark:text-slate-500 font-bold transition-colors duration-300">{(row as OrderRow).assignee}</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 font-black text-sm transition-colors duration-300">
                                                        <Clock size={16} />
                                                        {(row as OrderRow).sla}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-center">
                                                        <button className="p-2.5 text-[#35788D] dark:text-[#4AA0BA] hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm hover:shadow-md">
                                                            <Eye size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <img src={(row as ConsultationsRow).patientImg} alt={(row as ConsultationsRow).patient} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 transition-colors duration-300" />
                                                        <div>
                                                            <p className="font-black text-slate-800 dark:text-slate-200 transition-colors duration-300">{(row as ConsultationsRow).patient}</p>
                                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold mt-0.5 tracking-wider transition-colors duration-300">#{(row as ConsultationsRow).patientId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-slate-400 dark:text-slate-500 font-bold transition-colors duration-300">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-slate-800 dark:text-slate-200 font-bold transition-colors duration-300">{(row as ConsultationsRow).dateTime}</span>
                                                        <span className="text-xs text-blue-500 font-black">{(row as ConsultationsRow).time}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-4 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black transition-colors duration-300">
                                                        {(row as ConsultationsRow).type}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-slate-400 dark:text-slate-500 font-bold transition-colors duration-300">
                                                    <div className="relative group/status inline-block">
                                                        <select
                                                            value={(row as ConsultationsRow).rawStatus || 'pending'}
                                                            onChange={(e) => handleConsultationStatusChange((row as ConsultationsRow).rawId, e.target.value)}
                                                            className={`appearance-none inline-flex items-center px-4 py-2 rounded-xl text-xs font-black border tracking-wide gap-2 outline-none cursor-pointer transition-all dark:bg-opacity-20 dark:border-opacity-30 ${getStatusStyles((row as ConsultationsRow).status)}`}
                                                        >
                                                            <option value="pending" className="dark:bg-slate-800 dark:text-slate-200">قيد الانتظار (Pending)</option>
                                                            <option value="confirmed" className="dark:bg-slate-800 dark:text-slate-200">تم التأكيد (Confirmed)</option>
                                                            <option value="completed" className="dark:bg-slate-800 dark:text-slate-200">مكتمل (Completed)</option>
                                                            <option value="cancelled" className="dark:bg-slate-800 dark:text-slate-200">ملغي (Cancelled)</option>
                                                        </select>
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover/status:opacity-100">
                                                            <ChevronDown size={12} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-all">
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleConsultationStatusChange(row.rawId, 'cancelled')}
                                                            className="p-2 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-xl transition-all"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-8 py-6 bg-[#F8FAFB] dark:bg-slate-800/80 flex flex-col md:flex-row items-center justify-between border-t border-gray-50 dark:border-slate-700/50 gap-4 transition-colors duration-300">
                        <p className="text-gray-400 dark:text-slate-400 font-bold text-sm transition-colors duration-300">
                            عرض {startIndex + 1} - {endIndex} من أصل {totalItems} سجلات
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
