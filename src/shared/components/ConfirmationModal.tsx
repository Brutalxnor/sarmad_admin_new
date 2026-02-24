import { Fragment } from 'react'

interface ConfirmationModalProps {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
    isDestructive?: boolean
}

export function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isDestructive = false
}: ConfirmationModalProps) {
    if (!isOpen) return null

    return (
        <Fragment>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[110] overflow-y-auto pointer-events-none">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <div className="relative transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all w-full max-w-sm pointer-events-auto">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 leading-6">
                                {title}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {message}
                            </p>

                            <div className="mt-6 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                    onClick={onCancel}
                                >
                                    {cancelText}
                                </button>
                                <button
                                    type="button"
                                    className={`px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors shadow-lg ${isDestructive
                                            ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                            : 'bg-brand-600 hover:bg-brand-700 shadow-brand-200'
                                        }`}
                                    onClick={onConfirm}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
