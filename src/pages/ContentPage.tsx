import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ContentList } from '@/features/content/components/ContentList'
import { CreateContentForm } from '@/features/content/components/CreateContentForm'
import { useContent } from '@/features/content/hooks/use-content'
import { useCourses } from '@/features/courses/hooks/use-courses'
import { useLanguage } from '@/shared/context/LanguageContext'
import { CheckCircle, Clock, Edit3, Plus, BookOpen, HelpCircle, Video, Users, ArrowLeft, FileText, GraduationCap, PlayCircle } from 'lucide-react'

type ViewState = 'list' | 'add-selection' | 'create'

export default function ContentPage() {
    const { direction, t } = useLanguage()
    const navigate = useNavigate()
    const { data: contents } = useContent()
    const { data: courses } = useCourses()
    const [view, setView] = useState<ViewState>('list')
    const [selectedType, setSelectedType] = useState<any>('article')

    const totalCount = (contents?.length || 0) + (courses?.length || 0)
    const publishedCount = (contents?.filter(c => c.status === 'published' || c.status === 'approved').length || 0) + (courses?.length || 0)
    const reviewCount = contents?.filter(c => c.status === 'review').length || 0
    const draftCount = contents?.filter(c => c.status === 'draft').length || 0

    const handleBackToList = () => {
        setView('list')
    }

    if (view === 'create') {
        return (
            <div className="bg-[#F9FBFC] min-h-screen">
                <CreateContentForm
                    initialData={{ type: selectedType }}
                    onSuccess={handleBackToList}
                    onCancel={handleBackToList}
                />
            </div>
        )
    }

    if (view === 'add-selection') {
        const types = [
            { id: 'article', icon: <FileText size={40} className="text-[#35788D]" />, title: t('content.add.type.article'), desc: t('content.add.type.article_desc'), action: t('content.add.action.article'), color: 'bg-sky-50' },
            { id: 'video', icon: <PlayCircle size={40} className="text-[#35788D]" />, title: t('content.add.type.video'), desc: t('content.add.type.video_desc'), action: t('content.add.action.video'), color: 'bg-sky-50' },
            { id: 'course', icon: <GraduationCap size={40} className="text-[#35788D]" />, title: t('content.add.type.course'), desc: t('content.add.type.course_desc'), action: t('content.add.action.course'), color: 'bg-sky-50' },
            { id: 'faq', icon: <HelpCircle size={40} className="text-[#35788D]" />, title: t('content.add.type.faq'), desc: t('content.add.type.faq_desc'), action: t('content.add.action.faq'), color: 'bg-sky-50' },
            { id: 'webinar', icon: <Video size={40} className="text-[#35788D]" />, title: t('content.add.type.webinar'), desc: t('content.add.type.webinar_desc'), action: t('content.add.action.webinar'), color: 'bg-sky-50' },
            { id: 'success_story', icon: <Users size={40} className="text-[#35788D]" />, title: t('content.add.type.success_story'), desc: t('content.add.type.success_story_desc'), action: t('content.add.action.success_story'), color: 'bg-sky-50' },
        ]

        return (
            <div className="animate-fade-in max-w-[1200px] mx-auto px-6 py-10 bg-[#F9FBFC] min-h-screen">
                <div className="flex justify-start">
                    <button
                        onClick={() => setView('list')}
                        className="text-slate-400 hover:text-[#35788D] font-bold text-sm flex items-center gap-2 transition-all"
                    >
                        <ArrowLeft size={16} className={direction === 'rtl' ? 'rotate-180' : ''} />
                        العودة لإدارة المحتوى
                    </button>
                </div>

                <div className="flex flex-col items-center text-center space-y-6">
                    <h1 className="text-5xl font-black text-slate-800">إضافة محتوى جديد</h1>
                    <p className="text-gray-400 font-bold max-w-lg text-lg">اختر نوع المحتوى الذي ترغب في إنشائه وإضافته للمنصة</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 mt-12 pb-20">
                    {types.map((type) => (
                        <div
                            key={type.id}
                            onClick={() => {
                                if (type.id === 'success_story') {
                                    navigate('/cms/success-stories/create')
                                } else {
                                    setSelectedType(type.id)
                                    setView('create')
                                }
                            }}
                            className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-2 transition-all duration-500 cursor-pointer h-full"
                        >
                            <div className="w-24 h-24 rounded-full bg-sky-50 flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110">
                                {type.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-4">{type.title}</h3>
                            <p className="text-gray-400 text-sm font-bold leading-relaxed mb-8 flex-1">{type.desc}</p>
                            <div
                                className="text-[#35788D] font-black text-sm flex items-center gap-2 group-hover:gap-3 transition-all"
                            >
                                {type.action}
                                <ArrowLeft size={16} className={direction === 'rtl' ? 'rotate-180' : ''} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-fade-in max-w-[1600px] mx-auto px-6 py-10 bg-[#F9FBFC] min-h-screen">
            {/* Page Header */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${direction === 'rtl' ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="text-start">
                    <h1 className="text-4xl font-black text-[#1E293B] tracking-tight mb-2">إدارة المحتوى التعليمي</h1>
                    <p className="text-slate-400 font-bold">مكتبة المحتوى والمراجعة والموافقة</p>
                </div>
                <div>
                    <button
                        onClick={() => setView('add-selection')}
                        className="bg-[#0095D9] text-white px-8 py-4 rounded-full font-black text-lg shadow-lg shadow-[#0095D9]/30 hover:shadow-[#0095D9]/40 hover:-translate-y-1 transition-all flex items-center gap-3"
                    >
                        <Plus size={24} />
                        إضافة محتوى جديد
                    </button>
                </div>
            </div>

            {/* Content Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'إجمالي المحتوى', value: totalCount.toString(), icon: <BookOpen className="text-[#0095D9]" />, color: 'bg-white', iconBg: 'bg-sky-50' },
                    { title: 'منشور', value: publishedCount.toString(), icon: <CheckCircle className="text-teal-500" />, color: 'bg-white', iconBg: 'bg-teal-50' },
                    { title: 'قيد المراجعة', value: reviewCount.toString(), icon: <Clock className="text-orange-500" />, color: 'bg-white', iconBg: 'bg-orange-50' },
                    { title: 'مسودات', value: draftCount.toString(), icon: <Edit3 className="text-blue-500" />, color: 'bg-white', iconBg: 'bg-blue-50' },
                ].map((stat, i) => (
                    <div key={i} className={`${stat.color} p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center group hover:shadow-md transition-shadow relative`}>
                        <div className={`absolute top-6 right-6 w-12 h-12 rounded-2xl ${stat.iconBg} flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-4xl font-black text-slate-800 mb-2 mt-8">{stat.value}</h3>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Explore More Section */}
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-50 flex flex-col gap-8">
                <h2 className={`text-xl font-black text-slate-800 ${direction === 'rtl' ? 'text-start' : 'text-end'}`}>تصفح محتوى تعليمي إضافي</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'الأسئلة الشائعة', desc: 'تستطيع أن ترى الأسئلة كاملة', link: 'تصفح كل الأسئلة', icon: <HelpCircle className="text-sky-500" />, color: 'bg-[#F4F9FB]', route: '/faqs' },
                        { title: 'الندوات المسجلة', desc: 'تستطيع أن ترى الندوات السابقة', link: 'تصفح كل الندوات المسجلة', icon: <Video className="text-blue-400" />, color: 'bg-[#F4F9FB]', route: '/webinars' },
                        { title: 'قصص النجاح', desc: 'تستطيع أن ترى قصص النجاح', link: 'تصفح كل قصص النجاح', icon: <Users className="text-sky-400" />, color: 'bg-[#F4F9FB]', route: '/testimonials' },
                    ].map((card, i) => (
                        <div key={i} onClick={() => card.route && navigate(card.route)} className={`${card.color} p-8 rounded-xl flex items-center justify-between group hover:shadow-md transition-all ${card.route ? 'cursor-pointer' : ''}`}>
                            <div className="order-2 w-14 h-14 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                {card.icon}
                            </div>
                            <div className="order-1 text-end flex-1 pe-4">
                                <h3 className="font-black text-slate-800 mb-1">{card.title}</h3>
                                <p className="text-[10px] text-gray-400 font-bold mb-3">{card.desc}</p>
                                <button className="text-[#35788D] text-xs font-black flex items-center justify-end gap-2 hover:gap-3 transition-all">
                                    {card.link}
                                    <ArrowLeft size={16} className={direction === 'rtl' ? 'rotate-180' : ''} />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            {/* Filtered Content List */}
            <div className="mt-8">
                <ContentList hideHeader />
            </div>
        </div>
    )
}
