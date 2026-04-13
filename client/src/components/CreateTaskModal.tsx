import { useEffect, useRef } from 'react'
import { useCreateTask } from '../hooks/useTasks'
import type { TaskStatus, TaskPriority } from '../types/task.types'

interface Props {
    projectId: number
    defaultStatus: TaskStatus
    onClose: () => void
}

export default function CreateTaskModal({ projectId, defaultStatus, onClose }: Props) {
    const titleRef = useRef<HTMLInputElement>(null)
    const createTask = useCreateTask()

    useEffect(() => {
        titleRef.current?.focus()
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        const title = (data.get('title') as string).trim()
        if (!title) return

        createTask.mutate(
            {
                projectId,
                title,
                description: (data.get('description') as string).trim() || undefined,
                status: data.get('status') as TaskStatus,
                priority: (data.get('priority') as string as TaskPriority) || undefined,
                assignee: (data.get('assignee') as string).trim() || undefined,
            },
            { onSuccess: () => onClose() }
        )
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">New Task</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            ref={titleRef}
                            name="title"
                            placeholder="What needs to be done?"
                            required
                            maxLength={255}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            placeholder="Optional description…"
                            rows={3}
                            maxLength={1000}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                defaultValue={defaultStatus}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                            >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Priority
                            </label>
                            <select
                                name="priority"
                                defaultValue=""
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                            >
                                <option value="">None</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Assignee
                        </label>
                        <input
                            name="assignee"
                            placeholder="Optional name…"
                            maxLength={100}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        />
                    </div>

                    {createTask.isError && (
                        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                            Failed to create task. Please try again.
                        </p>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="submit"
                            disabled={createTask.isPending}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            {createTask.isPending ? 'Creating…' : 'Create Task'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
