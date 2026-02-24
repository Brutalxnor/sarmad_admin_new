import { Modal } from '@/features/questions/components/Modal'
import { CourseCurriculum } from './CourseCurriculum'
import { useCourse } from '../hooks/use-courses'

interface CourseDetailsModalProps {
    courseId: string | null
    isOpen: boolean
    onClose: () => void
}

export function CourseDetailsModal({ courseId, isOpen, onClose }: CourseDetailsModalProps) {
    const { data: course } = useCourse(courseId || '')

    if (!courseId) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={course?.title || 'تفاصيل الدورة'}
        >
            <div className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                <CourseCurriculum courseId={courseId} />
            </div>
        </Modal>
    )
}
