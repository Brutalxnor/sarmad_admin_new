import { CreateSuccessStoryForm } from '@/features/success-stories/components/CreateSuccessStoryForm'
import { useNavigate } from 'react-router-dom'

export default function CreateSuccessStoryPage() {
    const navigate = useNavigate()

    return (
        <CreateSuccessStoryForm
            onSuccess={() => navigate('/cms')}
            onCancel={() => navigate('/cms')}
        />
    )
}
