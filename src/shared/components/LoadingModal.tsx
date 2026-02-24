import { Fragment } from 'react'

interface LoadingModalProps {
    isOpen: boolean
    title?: string
    message?: string
}

export function LoadingModal({ isOpen, title = 'جاري التحميل...', message = 'يرجى الانتظار...' }: LoadingModalProps) {
    if (!isOpen) return null

    return (
        <Fragment>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity" />

            {/* Modal */}
            <div className="fixed inset-0 z-[110] overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <div className="relative transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-2xl transition-all w-full max-w-sm">
                        <div className="flex flex-col items-center justify-center gap-4">
                            {/* Spinner */}
                            <div className="w-12 h-12 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />

                            {/* Content */}
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-bold text-slate-800">
                                    {title}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
