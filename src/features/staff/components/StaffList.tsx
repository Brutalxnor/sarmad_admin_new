import { useState } from 'react'
import { useStaffList, useDeleteStaff, useUpdateStaff } from '../hooks/useStaff'
import { useLanguage } from '@/shared/context/LanguageContext'
import type { StaffUser } from '../api/staffService'
import { CreateStaffModal } from './CreateStaffModal'
import { usePagination } from '@/shared/hooks/use-pagination'
import { Pagination } from '@/shared/components/Pagination'
import {
    Edit2,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    Trash2
} from 'lucide-react'

interface StaffListProps {
    searchTerm?: string
    roleFilter?: string
    statusFilter?: string
}

export function StaffList({ searchTerm = '', roleFilter = 'all', statusFilter = 'all' }: StaffListProps) {
    const { data: staffListResponse, isLoading } = useStaffList()
    const deleteStaffMutation = useDeleteStaff()
    const updateStaffMutation = useUpdateStaff()
    const { t, direction, language } = useLanguage()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null)
    const isRTL = direction === 'rtl'

    // Filtering logic
    const filteredStaff = (staffListResponse?.data || []).filter(staff => {
        // Search filter
        const matchesSearch = searchTerm === '' ||
            staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchTerm.toLowerCase())

        // Role filter
        const matchesRole = roleFilter === 'all' || staff.role === roleFilter

        // Status filter
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && !staff.must_change_password) ||
            (statusFilter === 'inactive' && staff.must_change_password)

        return matchesSearch && matchesRole && matchesStatus
    })

    // Pagination
    const { currentData: paginatedStaff, currentPage, totalPages, goToPage } = usePagination<StaffUser>({
        data: filteredStaff,
        itemsPerPage: 10
    })

    const handleDelete = async (id: string) => {
        if (window.confirm(t('staff.delete_confirm'))) {
            await deleteStaffMutation.mutateAsync(id)
        }
    }

    const handleEdit = (staff: StaffUser) => {
        setEditingStaff(staff)
        setIsCreateModalOpen(true)
    }

    const handleRoleChange = async (staffId: string, newRole: string) => {
        try {
            await updateStaffMutation.mutateAsync({
                id: staffId,
                data: { role: newRole as any }
            })
        } catch (error) {
            console.error('Failed to update role:', error)
        }
    }

    const closeCreateModal = () => {
        setIsCreateModalOpen(false)
        setEditingStaff(null)
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-20 bg-white border border-gray-50 rounded-3xl animate-pulse shadow-sm" />
                ))}
            </div>
        )
    }


    const getPermissionLabel = (role: string) => {
        if (role === 'AdminOperations') return language === 'ar' ? 'تحكم عمليات' : 'Operations Control'
        if (role === 'AdminClinical') return language === 'ar' ? 'تحكم محتوى' : 'Content Control'
        return language === 'ar' ? 'وصول عام' : 'General Access'
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                        <thead className="bg-[#F9FBFC] text-slate-400 font-black text-xs uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-6">{language === 'ar' ? 'الاسم والبريد' : 'Name & Email'}</th>
                                <th className="px-6 py-6">{language === 'ar' ? 'الدور' : 'Role'}</th>
                                <th className="px-6 py-6">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                                <th className="px-6 py-6">{language === 'ar' ? 'آخر تسجيل دخول' : 'Last Login'}</th>
                                <th className="px-6 py-6">{language === 'ar' ? 'الصلاحيات' : 'Permissions'}</th>
                                <th className="px-8 py-6 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-300 font-bold text-lg">
                                        {t('staff.list.empty')}
                                    </td>
                                </tr>
                            ) : (
                                paginatedStaff.map((staff: StaffUser) => (
                                    <tr key={staff.id} className="hover:bg-[#F4F9FB]/30 transition-all group">
                                        {/* Name & Email */}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img
                                                        src={staff.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name || 'User')}&background=0d9488&color=fff`}
                                                        alt={staff.name}
                                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 ring-offset-1"
                                                    />
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-800 text-sm mb-0.5">{staff.name || 'مستخدم سرمد'}</span>
                                                    <span className="text-xs text-slate-400 font-bold tracking-tight opacity-70">{staff.email}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role Select */}
                                        <td className="px-6 py-6">
                                            <div className="relative group/select">
                                                <select
                                                    value={staff.role}
                                                    onChange={(e) => handleRoleChange(staff.id, e.target.value)}
                                                    disabled={updateStaffMutation.isPending && updateStaffMutation.variables?.id === staff.id}
                                                    className={`appearance-none bg-[#F4F9FB] border-none rounded-xl py-2.5 px-4 pr-10 text-xs font-black text-slate-700 focus:ring-2 focus:ring-[#0095D9]/20 outline-none transition-all cursor-pointer hover:bg-slate-100 ${isRTL ? 'text-right' : 'text-left'}`}
                                                >
                                                    <option value="Coach">{t('staff.role.Coach')}</option>
                                                    <option value="AdminOperations">{t('staff.role.AdminOperations')}</option>
                                                    <option value="AdminClinical">{t('staff.role.AdminClinical')}</option>
                                                    <option value="SuperAdmin">{t('role.superadmin')}</option>
                                                </select>
                                                <div className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 pointer-events-none text-slate-400`}>
                                                    <ChevronDown size={14} />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-6">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black ${!staff.must_change_password
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                {!staff.must_change_password ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                {!staff.must_change_password ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                                            </div>
                                        </td>

                                        {/* Last Login */}
                                        <td className="px-6 py-6">
                                            <span className="text-xs font-black text-slate-400 italic">
                                                {language === 'ar' ? 'منذ 5 دقائق' : '5 mins ago'}
                                            </span>
                                        </td>

                                        {/* Permissions */}
                                        <td className="px-6 py-6">
                                            <span className="text-xs font-black text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                {getPermissionLabel(staff.role)}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-4">
                                                <button
                                                    onClick={() => handleEdit(staff)}
                                                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                    title={t('content.edit')}
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(staff.id)}
                                                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                    title={t('common.delete')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={`flex flex-col md:flex-row justify-between items-center gap-6 pt-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                <p className="text-sm font-black text-slate-400 order-2 md:order-1">
                    {language === 'ar'
                        ? `عرض ${paginatedStaff.length} من أصل ${filteredStaff.length} موظف (الإجمالي: ${staffListResponse?.data?.length || 0})`
                        : `Showing ${paginatedStaff.length} of ${filteredStaff.length} employees (Total: ${staffListResponse?.data?.length || 0})`}
                </p>
                <div className="order-1 md:order-2">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                    />
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateStaffModal
                    isOpen={isCreateModalOpen}
                    onClose={closeCreateModal}
                    initialData={editingStaff}
                />
            )}
        </div>
    )
}

