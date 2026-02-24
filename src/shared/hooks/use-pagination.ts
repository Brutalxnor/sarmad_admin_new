import { useState, useMemo } from 'react'

interface UsePaginationProps<T> {
    data: T[]
    itemsPerPage?: number
}

export function usePagination<T>({ data, itemsPerPage = 10 }: UsePaginationProps<T>) {
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil((data?.length || 0) / itemsPerPage)

    const currentData = useMemo(() => {
        if (!data) return []
        const start = (currentPage - 1) * itemsPerPage
        const end = start + itemsPerPage
        return data.slice(start, end)
    }, [data, currentPage, itemsPerPage])

    const goToPage = (page: number) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages))
        setCurrentPage(pageNumber)
    }

    const nextPage = () => {
        goToPage(currentPage + 1)
    }

    const prevPage = () => {
        goToPage(currentPage - 1)
    }

    // Reset to page 1 if data changes significantly (optional, but good practice if filtering changes)
    // You might want to handle this in the parent if you want to keep page on sort

    return {
        currentData,
        currentPage,
        totalPages,
        itemsPerPage,
        totalItems: data?.length || 0,
        goToPage,
        nextPage,
        prevPage,
        startIndex: (currentPage - 1) * itemsPerPage,
        endIndex: Math.min(currentPage * itemsPerPage, data?.length || 0)
    }
}
