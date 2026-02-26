import { useState, useEffect } from 'react'
import { useCreateStaff, useUpdateStaff } from '../hooks/useStaff'
import { useLanguage } from '@/shared/context/LanguageContext'
import type { StaffRole, StaffUser } from '../api/staffService'
import { ConfirmationModal } from '@/shared/components/ConfirmationModal'

interface CreateStaffModalProps {
    isOpen: boolean
    onClose: () => void
    initialData?: StaffUser | null
}

export function CreateStaffModal({ isOpen, onClose, initialData }: CreateStaffModalProps) {
    const { t, direction } = useLanguage()
    const createStaffMutation = useCreateStaff()
    const updateStaffMutation = useUpdateStaff()

    const isEditMode = !!initialData
    const isPending = createStaffMutation.isPending || updateStaffMutation.isPending

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'Coach' as StaffRole,
        must_change_password: false
    })
    const [isConfirmingRole, setIsConfirmingRole] = useState(false)

    useEffect(() => {
        if (initialData) {
            setFormData({
                email: initialData.email,
                password: '', // Don't pre-fill password for security/update reasons
                name: initialData.name || '',
                role: initialData.role,
                must_change_password: initialData.must_change_password
            })
        } else {
            setFormData({
                email: '',
                password: '',
                name: '',
                role: 'Coach' as StaffRole,
                must_change_password: false
            })
        }
    }, [initialData, isOpen])

    if (!isOpen) return null

    const proceedWithSubmit = async () => {
        try {
            if (isEditMode && initialData) {
                await updateStaffMutation.mutateAsync({
                    id: initialData.id,
                    data: {
                        name: formData.name,
                        role: formData.role,
                        must_change_password: formData.must_change_password
                    }
                })
            } else {
                await createStaffMutation.mutateAsync(formData)
            }
            onClose()
            setIsConfirmingRole(false)
        } catch (error) {
            console.error('Failed to save staff:', error)
            alert('Failed to save staff member. Please try again.')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // If editing and role changed, ask for confirmation
        if (isEditMode && initialData && formData.role !== initialData.role && !isConfirmingRole) {
            setIsConfirmingRole(true)
            return
        }

        await proceedWithSubmit()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-up">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">
                        {isEditMode ? t('staff.edit') : t('staff.create')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('staff.form.name')}
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('staff.form.email')}
                        </label>
                        <input
                            type="email"
                            required
                            disabled={isEditMode}
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                        />
                    </div>

                    {!isEditMode && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {t('staff.form.password')}
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={formData.password}
                                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t('staff.form.role')}
                        </label>
                        <select
                            value={formData.role}
                            onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as StaffRole }))}
                            className={`w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all appearance-none bg-white ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                        >
                            <option value="Coach">{t('staff.role.Coach')}</option>
                            <option value="AdminOperations">{t('staff.role.AdminOperations')}</option>
                            <option value="AdminClinical">{t('staff.role.AdminClinical')}</option>
                            <option value="SuperAdmin">{t('role.superadmin')}</option>
                        </select>
                    </div>

                    {isEditMode && (
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {direction === 'rtl' ? 'حالة الحساب' : 'Account Status'}
                            </label>
                            <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, must_change_password: false }))}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-black text-xs transition-all ${!formData.must_change_password
                                        ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100'
                                        : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${!formData.must_change_password ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                    {direction === 'rtl' ? 'نشط' : 'Active'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, must_change_password: true }))}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-black text-xs transition-all ${formData.must_change_password
                                        ? 'bg-white text-orange-600 shadow-sm border border-orange-100'
                                        : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${formData.must_change_password ? 'bg-orange-500' : 'bg-slate-300'}`} />
                                    {direction === 'rtl' ? 'غير نشط' : 'Inactive'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            {t('questions.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending
                                ? t('questions.form.submitting')
                                : (isEditMode ? t('common.save') : t('staff.create'))}
                        </button>
                    </div>
                </form>

                <ConfirmationModal
                    isOpen={isConfirmingRole}
                    title={direction === 'rtl' ? 'تأكيد تغيير الدور' : 'Confirm Role Change'}
                    message={direction === 'rtl'
                        ? `هل أنت متأكد من تغيير دور الموظف إلى "${t(`staff.role.${formData.role}`)}"؟`
                        : `Are you sure you want to change this staff member's role to "${t(`staff.role.${formData.role}`)}"?`}
                    confirmText={direction === 'rtl' ? 'تأكيد' : 'Confirm'}
                    cancelText={direction === 'rtl' ? 'إلغاء' : 'Cancel'}
                    onConfirm={proceedWithSubmit}
                    onCancel={() => setIsConfirmingRole(false)}
                />
            </div>
        </div>
    )
}
