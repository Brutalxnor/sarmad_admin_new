import { useState, useMemo } from 'react'
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
    CheckCircle2,
    Box,
    AlertCircle,
    ChevronDown
} from 'lucide-react'

const STATS = [
    {
        count: 128,
        label: 'الاستشارات اليوم',
        icon: <Video size={20} />,
        bg: 'bg-blue-50',
        textColor: 'text-blue-500',
        gradient: 'from-blue-500/10 to-transparent'
    },
    {
        count: 123,
        label: 'البرامج النشطة',
        icon: <TrendingUp size={20} />,
        bg: 'bg-emerald-50',
        textColor: 'text-emerald-500',
        gradient: 'from-emerald-500/10 to-transparent'
    },
    {
        count: 12,
        label: 'إجمالي الخدمات',
        icon: <Package size={20} />,
        bg: 'bg-[#E0F7F9]',
        textColor: 'text-[#00BCD4]',
        gradient: 'from-[#00BCD4]/10 to-transparent'
    },
    {
        count: 123,
        label: 'المستخدمين النشطين',
        icon: <Users size={20} />,
        bg: 'bg-orange-50',
        textColor: 'text-orange-500',
        gradient: 'from-orange-500/10 to-transparent'
    }
]

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
    const mappedOrders = useMemo(() => {
        if (!realOrders) return []

        return realOrders.map((order: any) => {
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
    }, [realOrders])

    const mappedConsultations = useMemo(() => {
        if (!consultations) return []

        return consultations.map((item: any) => {
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
    }, [consultations])

    function rowId(id: string) {
        if (!id) return ''
        if (id.length > 8 && !id.includes('-')) return `HST-${id.substring(0, 4)}`
        return id
    }

    const filteredData = useMemo(() => {
        if (activeTab === 'all') {
            let data = mappedOrders;
            if (orderStatusFilter !== 'all') {
                data = data.filter((o: any) => o.status === orderStatusFilter)
            }
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                data = data.filter((o: any) =>
                    o.id.toLowerCase().includes(q) ||
                    o.user.toLowerCase().includes(q)
                )
            }
            return data;
        } else if (activeTab === 'consultations') {
            let data = mappedConsultations;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                data = data.filter((item: any) =>
                    item.patient.toLowerCase().includes(q) ||
                    item.doctor.toLowerCase().includes(q)
                )
            }
            return data;
        }
        return [];
    }, [activeTab, mappedOrders, mappedConsultations, orderStatusFilter, searchQuery])

    const {
        currentData: paginatedData,
        currentPage,
        totalPages,
        goToPage,
        startIndex,
        endIndex,
        totalItems
    } = usePagination<any>({
        data: filteredData,
        itemsPerPage: 5
    })

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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 size={14} className="ml-2" />
            case 'pending':
                return <Clock size={14} className="ml-2" />
            case 'in_progress':
                return <TrendingUp size={14} className="ml-2" />
            case 'canceled':
            case 'cancelled':
                return <XCircle size={14} className="ml-2" />
            default:
                return null
        }
    }

    const isLoading = activeTab === 'all' ? ordersLoading : consultationsLoading

    return (
        <div className="space-y-8 animate-slide-up pb-10">
            {/* Header */}
            <div className="flex justify-between items-end mb-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">إدارة الخدمات</h1>
                    <p className="text-slate-400 font-bold text-base">الطلبات، الاستشارات، البرامج، و SLA</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-default">
                        <div className={`absolute -right-4 -top-4 w-32 h-32 bg-linear-to-br ${stat.gradient} opacity-20 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-40`} />
                        <div className={`w-14 h-14 rounded-[1.25rem] ${stat.bg} ${stat.textColor} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                            {stat.icon}
                        </div>
                        <div className="text-center relative z-10">
                            <h3 className="text-5xl font-black text-slate-800 mb-2 tabular-nums">{stat.count}</h3>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Strip */}
            <div className="bg-white rounded-[2rem] p-2 shadow-sm border border-gray-50 overflow-x-auto no-scrollbar">
                <div className="flex items-center min-w-max">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any)
                                goToPage(1)
                            }}
                            className={`relative px-8 py-4 text-sm font-black transition-all duration-300 ${activeTab === tab.id
                                ? 'text-[#35788D]'
                                : 'text-gray-400 hover:text-gray-600'
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
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-50 flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-1 group w-full">
                    <input
                        type="text"
                        placeholder="ابحث عن مريض، دكتور، رقم الموعد"
                        className="w-full bg-[#F3F7F9] border-none rounded-2xl py-4 px-12 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-[#35788D]/10 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#35788D] transition-colors" size={20} />
                </div>

                {activeTab === 'all' && (
                    <div className="flex bg-[#F3F7F9] p-1.5 rounded-2xl gap-2 w-full md:w-auto">
                        {ORDER_STATUS_FILTERS.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => {
                                    setOrderStatusFilter(filter.id)
                                    goToPage(1)
                                }}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-black transition-all ${orderStatusFilter === filter.id
                                    ? 'bg-[#1D353E] text-white shadow-lg'
                                    : 'text-slate-500 hover:bg-white'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-[#F8FAFB] border-b border-gray-50">
                                {activeTab === 'all' ? (
                                    <>
                                        <th className="px-8 py-6 text-sm font-black text-slate-500">رقم الطلب</th>
                                        <th className="px-8 py-6 text-sm font-black text-slate-500"> النوع</th>
                                        <th className="px-8 py-6 text-sm font-black text-slate-500">المستخدم</th>
                                        <th className="px-8 py-6 text-sm font-black text-slate-500">الحالة</th>
                                        <th className="px-8 py-6 text-sm font-black text-slate-500">المسؤول</th>
                                        <th className="px-8 py-6 text-sm font-black text-slate-500">SLA</th>
                                        <th className="px-8 py-6 text-sm font-black text-slate-500 text-center">إجراءات</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-8 py-6 text-sm font-black text-slate-500">اسم المريض</th>
                                        <th className="px-8 py-6 text-sm font-black text-slate-500">الطبيب المختص</th>
                                        <th className="px-8 py-6 text-sm font-black text-slate-500">التاريخ والوقت</th>
                                        <th className="px-8 py-6 text-sm font-black text-slate-500">النوع</th>
                                        <th className="px-8 py-6 text-sm font-black text-slate-500">الحالة</th>
                                        <th className="px-8 py-6 text-sm font-black text-slate-500 text-center">إجراءات</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={activeTab === 'all' ? 7 : 6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-[#35788D]/20 border-t-[#35788D] rounded-full animate-spin" />
                                            <p className="text-slate-400 font-bold">جاري تحميل البيانات...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'all' ? 7 : 6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertCircle size={40} className="text-slate-200" />
                                            <p className="text-slate-400 font-bold text-lg">لا توجد بيانات متاحة حالياً</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.map((row: any) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                                    {activeTab === 'all' ? (
                                        <>
                                            <td className="px-8 py-6 font-black text-slate-700">{row.id}</td>
                                            <td className="px-8 py-6">
                                                <span className="px-4 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-black">
                                                    {row.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 font-bold text-slate-600">{row.user}</td>
                                            <td className="px-8 py-6">
                                                <div className="relative group/status inline-block">
                                                    <select
                                                        value={row.operationalStatus || 'Requested'}
                                                        onChange={(e) => handleOrderStatusChange(row.rawId, e.target.value)}
                                                        className={`appearance-none inline-flex items-center px-4 py-2 rounded-xl text-xs font-black border tracking-wide gap-2 outline-none cursor-pointer transition-all ${getStatusStyles(row.status)}`}
                                                    >
                                                        <option value="Requested">قيد الانتظار (Requested)</option>
                                                        <option value="Confirmed">تم التأكيد (Confirmed)</option>
                                                        <option value="Shipped">تم الشحن (Shipped)</option>
                                                        <option value="Delivered">تم التوصيل (Delivered)</option>
                                                        <option value="In Use">قيد الاستخدام (In Use)</option>
                                                        <option value="Returned">تم الارجاع (Returned)</option>
                                                        <option value="Analysis">قيد التحليل (Analysis)</option>
                                                        <option value="Report Ready">التقرير جاهز (Report Ready)</option>
                                                        <option value="Closed">مغلق (Closed)</option>
                                                    </select>
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover/status:opacity-100">
                                                        <ChevronDown size={12} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-slate-400 font-bold">{row.assignee}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-emerald-500 font-black text-sm">
                                                    <Clock size={16} />
                                                    {row.sla}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center">
                                                    <button className="p-2.5 text-[#35788D] hover:bg-blue-50 rounded-xl transition-all shadow-sm hover:shadow-md">
                                                        <Eye size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <img src={row.patientImg} alt={row.patient} className="w-12 h-12 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100" />
                                                    <div>
                                                        <p className="font-black text-slate-800">{row.patient}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 tracking-wider">#{row.patientId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-slate-600 font-bold">{row.doctor}</td>
                                            <td className="px-8 py-6 text-slate-400 font-bold">
                                                {row.dateTime}
                                                <p className="text-[10px] text-gray-400 mt-1">{row.time}</p>
                                            </td>
                                            <td className="px-8 py-6 text-slate-500 font-bold">{row.type}</td>
                                            <td className="px-8 py-6">
                                                <div className="relative group/status inline-block">
                                                    <select
                                                        value={row.rawStatus || 'pending'}
                                                        onChange={(e) => handleConsultationStatusChange(row.rawId, e.target.value)}
                                                        className={`appearance-none inline-flex items-center px-4 py-2 rounded-xl text-xs font-black border tracking-wide gap-2 outline-none cursor-pointer transition-all ${getStatusStyles(row.status)}`}
                                                    >
                                                        <option value="pending">قيد الانتظار (Pending)</option>
                                                        <option value="confirmed">تم التأكيد (Confirmed)</option>
                                                        <option value="completed">مكتمل (Completed)</option>
                                                        <option value="cancelled">ملغي (Cancelled)</option>
                                                    </select>
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover/status:opacity-100">
                                                        <ChevronDown size={12} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleConsultationStatusChange(row.rawId, 'cancelled')}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
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

                <div className="px-8 py-6 bg-[#F8FAFB] flex flex-col md:flex-row items-center justify-between border-t border-gray-50 gap-4">
                    <p className="text-gray-400 font-bold text-sm">
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
    )
}
