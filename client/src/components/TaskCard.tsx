import { memo, useState, useEffect, useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useUpdateTask, useDeleteTask } from '../hooks/useTasks'
import TaskDetailModal from './TaskDetailModal'
import type { Task, TaskStatus, TaskPriority } from '../types/task.types'

const priorityStyles: Record<TaskPriority, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-500',
}

const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
]

interface Props {
    task: Task
}

const TaskCard = memo(function TaskCard({ task }: Props) {
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(task.title)
    const [showDetail, setShowDetail] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()

    const isMutating = updateTask.isPending || deleteTask.isPending

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { task },
    })

    const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

    useEffect(() => {
        if (isEditing) inputRef.current?.focus()
    }, [isEditing])

    const startEdit = (e: React.MouseEvent) => {
        e.stopPropagation()
        setEditTitle(task.title)
        setIsEditing(true)
    }

    const cancelEdit = () => {
        setIsEditing(false)
        setEditTitle(task.title)
    }

    const saveEdit = () => {
        const trimmed = editTitle.trim()
        if (!trimmed || trimmed === task.title) {
            cancelEdit()
            return
        }
        updateTask.mutate(
            { id: task.id, data: { title: trimmed } },
            { onSettled: () => setIsEditing(false) }
        )
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') saveEdit()
        if (e.key === 'Escape') cancelEdit()
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation()
        updateTask.mutate({ id: task.id, data: { status: e.target.value as TaskStatus } })
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isMutating) return
        deleteTask.mutate(task.id)
    }

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                onClick={() => { if (!isEditing) setShowDetail(true) }}
                className={`bg-white border border-slate-200 rounded-lg p-3 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-0' : ''}`}
            >
                <div className="flex items-start gap-2" {...listeners}>
                    <div className="flex-1 min-w-0">
                        {isEditing ? (
                            <input
                                ref={inputRef}
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={saveEdit}
                                onClick={e => e.stopPropagation()}
                                disabled={updateTask.isPending}
                                className="w-full text-sm font-medium text-slate-800 border border-blue-400 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
                            />
                        ) : (
                            <p className="text-sm font-medium text-slate-800 break-words leading-snug">
                                {task.title}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isEditing && (
                            <button
                                onClick={startEdit}
                                disabled={isMutating}
                                className="text-slate-400 hover:text-blue-500 p-1 rounded transition-colors disabled:opacity-40"
                                title="Quick edit title"
                            >
                                ✎
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={isMutating}
                            className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors disabled:opacity-40"
                            title="Delete task"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {task.description && (
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {task.description}
                    </p>
                )}

                {isEditing && (
                    <div className="mt-2 flex gap-2" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={saveEdit}
                            disabled={updateTask.isPending}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded transition-colors disabled:opacity-50"
                        >
                            {updateTask.isPending ? 'Saving…' : 'Save'}
                        </button>
                        <button
                            onClick={cancelEdit}
                            className="text-xs text-slate-600 px-2.5 py-1 rounded hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                <div className="mt-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        {task.priority && (
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityStyles[task.priority]}`}>
                                {task.priority}
                            </span>
                        )}
                        {task.assignee && (
                            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[90px]">
                                {task.assignee}
                            </span>
                        )}
                    </div>
                    <select
                        value={task.status}
                        onChange={handleStatusChange}
                        onClick={e => e.stopPropagation()}
                        disabled={isMutating}
                        className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:opacity-50 shrink-0"
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {showDetail && (
                <TaskDetailModal task={task} onClose={() => setShowDetail(false)} />
            )}
        </>
    )
})

export default TaskCard
