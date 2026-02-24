import { Modal } from './Modal'
import { CreateQuestionForm } from './CreateQuestionForm'
import type { Question } from '../types/question.types'

interface EditQuestionModalProps {
    isOpen: boolean
    onClose: () => void
    question: Question | null
}

export function EditQuestionModal({ isOpen, onClose, question }: EditQuestionModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="تعديل السؤال"
        >
            <CreateQuestionForm
                key={question?.id || 'new'}
                initialData={question}
                onSuccess={onClose}
            />
        </Modal>
    )
}
