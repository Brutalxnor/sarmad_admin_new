import { QuestionTable } from '@/features/questions/components/QuestionTable'
import { CreateQuestionForm } from '@/features/questions/components/CreateQuestionForm'
import { Modal } from '@/features/questions/components/Modal'
import { useState, useMemo } from 'react'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useQuestions, useDeleteQuestion, useSetActualVersion } from '@/features/questions/hooks/use-questions'

export default function QuestionsPage() {
    const [isCreateMode, setIsCreateMode] = useState(false)
    const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
    const [addedVersions, setAddedVersions] = useState<number[]>([])

    const { t } = useLanguage()
    const { data: questionsData, isLoading } = useQuestions()
    const deleteQuestion = useDeleteQuestion()
    const setActualVersion = useSetActualVersion()

    const questions = useMemo(() => questionsData?.data || [], [questionsData])

    const versions = useMemo(() => {
        const uniqueVersions = new Set<number>()
        questions.forEach(q => {
            if (q.assess_version !== undefined && q.assess_version !== null) {
                uniqueVersions.add(Number(q.assess_version))
            }
        })
        // Add locally added versions that might not have questions yet
        addedVersions.forEach(v => uniqueVersions.add(v))

        return Array.from(uniqueVersions).sort((a, b) => b - a)
    }, [questions, addedVersions])

    const handleDeleteVersion = async (version: number) => {
        if (!window.confirm(`هل أنت متأكد من حذف النسخة ${version} وجميع أسئلتها؟`)) return

        const questionsToDelete = questions.filter(q => Number(q.assess_version) === version)
        for (const q of questionsToDelete) {
            await deleteQuestion.mutateAsync(q.id)
        }
        setAddedVersions(prev => prev.filter(v => v !== version))
    }

    const handleAddVersionDirectly = () => {
        const nextVersion = versions.length > 0 ? Math.max(...versions) + 1 : 1
        setAddedVersions(prev => [...prev, nextVersion])
        setSelectedVersion(nextVersion)
        setIsCreateMode(false)
    }

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold">جاري التحميل...</div>

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                        {selectedVersion ? `إدارة الأسئلة - النسخة ${selectedVersion}` : t('questions.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {selectedVersion ? `عرض وتعديل أسئلة النسخة ${selectedVersion}` : t('questions.subtitle')}
                    </p>
                </div>

                <div className="flex gap-3">
                    {selectedVersion ? (
                        <>
                            <button
                                onClick={() => setActualVersion.mutate(selectedVersion)}
                                disabled={questions.some(q => Number(q.assess_version) === selectedVersion && q.actual_assess)}
                                className={`px-4 py-2 rounded-xl font-bold transition-all ${questions.some(q => Number(q.assess_version) === selectedVersion && q.actual_assess)
                                    ? 'bg-brand-50 text-brand-700 border border-brand-200 cursor-default'
                                    : 'bg-brand-600 text-white hover:shadow-lg hover:shadow-brand-500/30'
                                    }`}
                            >
                                {questions.some(q => Number(q.assess_version) === selectedVersion && q.actual_assess)
                                    ? 'النسخة الأساسية الحالية'
                                    : 'إعتماد كنسخة أساسية'}
                            </button>
                            <button
                                onClick={() => setSelectedVersion(null)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 font-bold transition-colors"
                            >
                                عودة للنسخ
                            </button>
                            <button
                                onClick={() => setIsCreateMode(true)}
                                className="btn-primary flex items-center gap-2"
                            >
                                {t('questions.add_new')}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleAddVersionDirectly}
                            className="btn-primary flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            إضافة نسخة جديدة
                        </button>
                    )}
                </div>
            </div>

            {!selectedVersion ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {versions.map(version => {
                        const versionQuestions = questions.filter(q => Number(q.assess_version) === version)
                        return (
                            <div key={version} className="glass-panel p-6 hover:shadow-xl transition-all group relative min-h-[160px] flex flex-col justify-between">
                                <div
                                    onClick={() => setSelectedVersion(version)}
                                    className="cursor-pointer space-y-4"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 capitalize bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                                                نسخة {version}
                                            </span>
                                            {versionQuestions.some(q => q.actual_assess) && (
                                                <span className="text-[10px] font-black bg-brand-600 dark:bg-brand-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                                                    النسخة الأساسية
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">النسخة الاختبارية {version}</h3>
                                        <div className="mt-1">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">
                                                {versionQuestions.length} أسئلة متاحة
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setActualVersion.mutate(version)
                                        }}
                                        className={`text-[10px] font-bold px-3 py-2 rounded-lg transition-all shadow-sm border ${versionQuestions.some(q => q.actual_assess)
                                            ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/20 cursor-default'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-600 hover:text-white border-slate-100 dark:border-slate-700'
                                            }`}
                                    >
                                        {versionQuestions.some(q => q.actual_assess) ? 'النسخة الحالية' : 'تفعيل كأساس'}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteVersion(version)
                                        }}
                                        className="p-2 text-slate-300 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-slate-800 rounded-lg transition-all shadow-sm border border-slate-100 dark:border-slate-700"
                                        title="حذف النسخة"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )
                    })}

                    {versions.length === 0 && (
                        <div className="col-span-full py-20 text-center glass-panel">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">لا توجد نسخ متاحة</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">ابدأ بإضافة نسخة جديدة لإدارة الأسئلة</p>
                            <button
                                onClick={handleAddVersionDirectly}
                                className="mt-6 text-brand-600 font-black flex items-center gap-2 mx-auto hover:text-brand-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                إضافة نسخة أولى
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="glass-panel overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/30 dark:bg-slate-800/30">
                        <div className="flex gap-4">
                            <button className="text-sm font-bold text-brand-600 border-b-2 border-brand-600 pb-6 -mb-6">{t('questions.tab.all')}</button>
                            <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 pb-6 -mb-6 transition-colors">{t('questions.tab.archived')}</button>
                        </div>
                    </div>

                    <div className="p-0">
                        <QuestionTable versionFilter={selectedVersion} />
                    </div>
                </div>
            )}

            {/* Create Question Modal */}
            <Modal
                isOpen={isCreateMode}
                onClose={() => setIsCreateMode(false)}
                title={t('questions.form.title')}
            >
                <div className="mb-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('questions.form.desc')} (نسخة {selectedVersion})
                    </p>
                </div>
                <CreateQuestionForm
                    key={`${selectedVersion}-${isCreateMode}`}
                    onSuccess={() => setIsCreateMode(false)}
                    defaultVersion={selectedVersion ?? undefined}
                    isActualVersion={questions.some(q => Number(q.assess_version) === selectedVersion && q.actual_assess)}
                />
            </Modal>
        </div>
    )
}
