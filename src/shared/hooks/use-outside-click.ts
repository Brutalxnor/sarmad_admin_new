import { useEffect, useCallback, type RefObject } from 'react'

export function useOutsideClick(
    ref: RefObject<HTMLElement | null>,
    handler: () => void,
    enabled: boolean = true
) {
    const handleClick = useCallback(
        (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                handler()
            }
        },
        [ref, handler]
    )

    useEffect(() => {
        if (!enabled) return

        document.addEventListener('mousedown', handleClick)
        return () => {
            document.removeEventListener('mousedown', handleClick)
        }
    }, [enabled, handleClick])
}
