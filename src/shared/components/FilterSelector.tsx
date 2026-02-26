import { useState, useRef } from 'react'
import { Plus, Check, Search, X, Loader2 } from 'lucide-react'
import { useFilters, useCreateFilter } from '@/features/content/hooks/use-filters'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useOutsideClick } from '@/shared/hooks/use-outside-click'

interface FilterSelectorProps {
    type: 'topic' | 'segment' | 'tag'
    label: string
    selectedIds: string[]
    onChange: (ids: string[]) => void
    multiple?: boolean
    placeholder?: string
}

export function FilterSelector({
    type,
    label,
    selectedIds,
    onChange,
    multiple = false,
    placeholder
}: FilterSelectorProps) {
    const { language, direction } = useLanguage()
    const isRTL = direction === 'rtl'
    const { data: filters = [], isLoading } = useFilters(type)
    const { mutate: createFilter, isPending: isCreating } = useCreateFilter()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [newFilterName, setNewFilterName] = useState('')

    const containerRef = useRef<HTMLDivElement>(null)
    useOutsideClick(containerRef, () => {
        setIsMenuOpen(false)
        setShowAddForm(false)
    }, isMenuOpen)

    const filteredOptions = filters.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.name_en && f.name_en.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const toggleOption = (id: string) => {
        if (multiple) {
            const newSelection = selectedIds.includes(id)
                ? selectedIds.filter(selectedId => selectedId !== id)
                : [...selectedIds, id]
            onChange(newSelection)
        } else {
            onChange([id])
            setIsMenuOpen(false)
        }
    }

    const handleAddFilter = () => {
        if (!newFilterName.trim()) return
        createFilter({
            type,
            name: newFilterName,
            name_en: '' // Could add English field if needed
        }, {
            onSuccess: (newFilter) => {
                toggleOption(newFilter.id)
                setNewFilterName('')
                setShowAddForm(false)
            }
        })
    }

    const selectedFilters = filters.filter(f => selectedIds.includes(f.id))

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            <label className="text-sm font-black text-slate-700 dark:text-slate-300 block text-start uppercase tracking-wider">
                {label}
            </label>

            <div className="relative group">
                <div
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="input-modern w-full min-h-[56px] flex flex-wrap gap-2 items-center cursor-pointer px-4 py-2 group-hover:border-brand-300 dark:group-hover:border-brand-500/50 transition-all bg-white dark:bg-slate-900/50"
                >
                    {selectedFilters.length > 0 ? (
                        selectedFilters.map(filter => (
                            <div
                                key={filter.id}
                                className="bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-brand-100 dark:border-brand-800"
                            >
                                {language === 'ar' ? filter.name : (filter.name_en || filter.name)}
                                {multiple && (
                                    <X
                                        size={14}
                                        className="cursor-pointer hover:text-brand-900 dark:hover:text-brand-200"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleOption(filter.id)
                                        }}
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <span className="text-slate-400 font-bold">
                            {placeholder || (isRTL ? `اختر ${label}...` : `Select ${label}...`)}
                        </span>
                    )}
                </div>

                {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                        <div className="p-3 border-b border-slate-50 dark:border-slate-700">
                            <div className="relative">
                                <Search size={16} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} text-slate-400`} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl ${isRTL ? 'pr-10' : 'pl-10'} py-2 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-500/20`}
                                    placeholder={isRTL ? 'بحث...' : 'Search...'}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {isLoading ? (
                                <div className="p-8 flex flex-col items-center justify-center text-slate-400">
                                    <Loader2 className="animate-spin mb-2" size={24} />
                                    <span className="text-xs font-bold">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                                </div>
                            ) : filteredOptions.length > 0 ? (
                                filteredOptions.map(option => (
                                    <div
                                        key={option.id}
                                        onClick={() => toggleOption(option.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedIds.includes(option.id)
                                            ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                                            }`}
                                    >
                                        <span className="text-sm font-bold">
                                            {language === 'ar' ? option.name : (option.name_en || option.name)}
                                        </span>
                                        {selectedIds.includes(option.id) && <Check size={16} />}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 italic text-xs font-bold">
                                    {isRTL ? 'لا توجد نتائج' : 'No results found'}
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700">
                            {showAddForm ? (
                                <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                                    <input
                                        type="text"
                                        value={newFilterName}
                                        onChange={(e) => setNewFilterName(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 text-sm font-bold"
                                        placeholder={isRTL ? 'اسم الفلتر الجديد...' : 'New filter name...'}
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddFilter}
                                            disabled={isCreating || !newFilterName.trim()}
                                            className="flex-1 bg-slate-900 dark:bg-brand-600 text-white rounded-xl py-2 text-xs font-black shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isCreating ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                                            {isRTL ? 'إضافة وتحديد' : 'Add & Select'}
                                        </button>
                                        <button
                                            onClick={() => setShowAddForm(false)}
                                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                                        >
                                            {isRTL ? 'إلغاء' : 'Cancel'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowAddForm(true)
                                    }}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-brand-300 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all font-bold text-xs"
                                >
                                    <Plus size={16} />
                                    {isRTL ? 'إضافة فلتر جديد' : 'Create New Filter'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
