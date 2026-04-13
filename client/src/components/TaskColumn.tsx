import { useMemo, useRef, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'
import * as tasksApi from '../api/tasks'
import type { TaskStatus } from '../types/task.types'

interface Props {
    projectId: number
    status: TaskStatus
    label: string
    accentClass: string
    badgeClass: string
    search: string
    onAddTask: () => void
}

const LIMIT = 8

export default function TaskColumn({ projectId, status, label, accentClass, badgeClass, search, onAddTask }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const sentinelRef = useRef<HTMLDivElement>(null)

    const { setNodeRef: setDropRef, isOver } = useDroppable({ id: status })

    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ['tasks', { projectId, status, search, limit: LIMIT }],
        queryFn: ({ pageParam }) => tasksApi.fetchTasks({ projectId, status, search, page: pageParam, limit: LIMIT }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const next = allPages.length + 1
            return next <= lastPage.totalPages ? next : undefined
        },
    })

    const tasks = useMemo(() => data?.pages.flatMap(p => p.data) ?? [], [data])
    const total = useMemo(() => data?.pages[0]?.total ?? 0, [data])

    useEffect(() => {
        const sentinel = sentinelRef.current
        const scroll = scrollRef.current
        if (!sentinel || !scroll) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            { root: scroll, threshold: 0.1 }
        )
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">

            <div className={`h-1.5 w-full ${accentClass}`} />

            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-700 text-sm">{label}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
                        {total}
                    </span>
                </div>
                <button
                    onClick={onAddTask}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xl leading-none"
                    title={`Add task to ${label}`}
                >
                    +
                </button>
            </div>

            <div
                ref={node => { setDropRef(node); (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node }}
                className={`flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-48 transition-colors ${isOver ? 'bg-blue-50' : ''}`}
            >
                {isLoading && (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                        Loading…
                    </div>
                )}
                {isError && (
                    <div className="flex-1 flex items-center justify-center text-red-400 text-sm text-center px-4">
                        Failed to load tasks
                    </div>
                )}
                {!isLoading && !isError && tasks.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm gap-1">
                        <span className="text-2xl">📭</span>
                        <span>No tasks here</span>
                    </div>
                )}
                {!isLoading && !isError && tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}

                <div ref={sentinelRef} />

                {isFetchingNextPage && (
                    <div className="text-center text-slate-400 text-xs py-1">Loading more…</div>
                )}
            </div>
        </div>
    )
}
