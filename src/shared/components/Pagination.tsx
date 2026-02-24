import { useLanguage } from '@/shared/context/LanguageContext'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const { direction } = useLanguage()

    const handlePageChange = (page: number) => {
        onPageChange(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (totalPages <= 1) return null

    // Generate page numbers to show
    // Simple version: show all or a range. For now, let's show all if < 7, else ellipsis logic could be added
    // For simplicity in this iteration, I'll show a sliding window or just simple list. 
    // Let's stick to a simple list for now, or maybe max 5 pages around current.

    const getPageNumbers = () => {
        const pages = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            // Always show first, last, and current +/- 1
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i)
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 3) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push('...')
                pages.push(currentPage - 1)
                pages.push(currentPage)
                pages.push(currentPage + 1)
                pages.push('...')
                pages.push(totalPages)
            }
        }
        return pages
    }

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${direction === 'rtl' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, idx) => (
                    typeof page === 'number' ? (
                        <button
                            key={idx}
                            onClick={() => handlePageChange(page as number)}
                            className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${currentPage === page
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-200'
                                : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                }`}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={idx} className="px-1 text-slate-400">...</span>
                    )
                ))}
            </div>

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${direction === 'rtl' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    )
}
