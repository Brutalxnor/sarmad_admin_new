import { useEffect } from 'react'
import { createPortal } from 'react-dom'

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
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
                onClick={onCancel}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                className="relative transform overflow-hidden rounded-[2rem] bg-white p-8 text-center shadow-2xl transition-all w-full max-w-sm animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed">
                        {message}
                    </p>

                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            className="flex-1 px-6 py-3.5 text-sm font-black text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                            onClick={onCancel}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className={`flex-1 px-6 py-3.5 text-sm font-black text-white rounded-2xl transition-all shadow-lg ${isDestructive
                                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                                : 'bg-[#0095D9] hover:bg-[#0084c2] shadow-[#0095D9]/20'
                                }`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
