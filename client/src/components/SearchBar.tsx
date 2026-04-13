import { useState, useCallback, useEffect, useRef } from 'react'

interface Props {
    onChange: (value: string) => void
}

export default function SearchBar({ onChange }: Props) {
    const [inputValue, setInputValue] = useState('')
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value
            setInputValue(val)
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => onChange(val), 300)
        },
        [onChange]
    )

    const handleClear = useCallback(() => {
        setInputValue('')
        if (timerRef.current) clearTimeout(timerRef.current)
        onChange('')
    }, [onChange])

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [])

    return (
        <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none pointer-events-none">
                🔍
            </span>
            <input
                value={inputValue}
                onChange={handleChange}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-slate-50"
            />
            {inputValue && (
                <button
                    onClick={handleClear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-6 h-6 flex items-center justify-center rounded transition-colors"
                    aria-label="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    )
}
