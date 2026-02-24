import { Routes, Route } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import Dashboard from '../../pages/Dashboard'

// Feature Pages
import QuestionsPage from '../../pages/QuestionsPage'
import OrdersPage from '../../pages/OrdersPage'
import ContentPage from '../../pages/ContentPage'
import UsersPage from '../../pages/UsersPage'
import WebinarsPage from '../../pages/WebinarsPage'
import ReportsPage from '../../pages/ReportsPage'
import EnrollmentsPage from '../../pages/EnrollmentsPage'
import StaffPage from '../../pages/StaffPage'
import LoginPage from '../../pages/LoginPage'
import FaqsPage from '../../pages/FaqsPage'
import TestimonialsPage from '../../pages/TestimonialsPage'
import ConsultationsPage from '../../pages/ConsultationsPage'
import UserDetailsPage from '../../pages/UserDetailsPage'
import AssessmentsPage from '../../pages/AssessmentsPage'
import AssessmentQuestionsPage from '../../pages/AssessmentQuestionsPage'
import AddQuestionPage from '@/pages/AddQuestionPage'
import CreateAssessmentPage from '@/pages/CreateAssessmentPage'
import CreateSuccessStoryPage from '@/pages/CreateSuccessStoryPage'


import AddStaffPage from '@/pages/AddStaffPage'
import PricingPackagingPage from '../../pages/PricingPackagingPage'



import ProfilePage from '../../pages/ProfilePage'

// Fallback for 404
const NotFound = () => (
    <div className="glass-panel p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-6xl mb-6 opacity-20">🚫</div>
        <h2 className="text-2xl font-bold text-slate-700 mb-2">404 - غير موجود</h2>
        <p className="text-gray-400">الصفحة التي تحاول الوصول إليها غير موجودة.</p>
    </div>
)

export function Router() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AdminLayout />}>
                <Route path="/" element={<Dashboard />} />

                <Route path="/questions" element={<QuestionsPage />} />
                <Route path="/assessments" element={<AssessmentsPage />} />
                <Route path="/assessments/create" element={<CreateAssessmentPage />} />
                <Route path="/assessments/:version/questions" element={<AssessmentQuestionsPage />} />
                <Route path="/assessments/:version/add-question" element={<AddQuestionPage />} />



                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/cms" element={<ContentPage />} />
                <Route path="/cms/success-stories/create" element={<CreateSuccessStoryPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/:id" element={<UserDetailsPage />} />
                <Route path="/webinars" element={<WebinarsPage />} />
                <Route path="/enrollments" element={<EnrollmentsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                {/* Staff Management */}
                <Route path="/staff" element={<StaffPage />} />
                <Route path="/staff/add" element={<AddStaffPage />} />
                <Route path="/faqs" element={<FaqsPage />} />

                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/consultations" element={<ConsultationsPage />} />
                <Route path="/consultations" element={<ConsultationsPage />} />
                <Route path="/pricing" element={<PricingPackagingPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}
