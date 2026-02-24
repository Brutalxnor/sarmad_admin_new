import { Modal } from './Modal'

interface DeleteQuestionModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isPending: boolean
}

export function DeleteQuestionModal({ isOpen, onClose, onConfirm, isPending }: DeleteQuestionModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="حذف السؤال"
        >
            <div className="space-y-4">
                <p className="text-gray-600">هل أنت متأكد من رغبتك في حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.</p>
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isPending}
                        className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                        {isPending ? 'جاري الحذف...' : 'تأكيد الحذف'}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
