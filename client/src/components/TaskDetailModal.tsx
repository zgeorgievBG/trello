import { useState, useEffect, useRef } from 'react'
import { useUpdateTask, useDeleteTask } from '../hooks/useTasks'
import { useComments, useCreateComment, useDeleteComment } from '../hooks/useComments'
import type { Task, TaskStatus, TaskPriority } from '../types/task.types'

function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso + 'Z').getTime()
    const s = Math.floor(diff / 1000)
    if (s < 60) return 'just now'
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 7) return `${d}d ago`
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatFull(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

function authorInitial(name: string | null): string {
    return name ? name[0].toUpperCase() : '?'
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; dot: string; badge: string }> = {
    'todo':        { label: 'To Do',       dot: 'bg-blue-400',  badge: 'bg-blue-50 text-blue-700 ring-blue-200' },
    'in-progress': { label: 'In Progress', dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 ring-amber-200' },
    'done':        { label: 'Done',        dot: 'bg-green-400', badge: 'bg-green-50 text-green-700 ring-green-200' },
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: string }> = {
    high:   { label: 'High',   color: 'text-red-600',   icon: '↑' },
    medium: { label: 'Medium', color: 'text-amber-600', icon: '→' },
    low:    { label: 'Low',    color: 'text-slate-500', icon: '↓' },
}

interface PropertyRowProps {
    label: string
    children: React.ReactNode
}

function PropertyRow({ label, children }: PropertyRowProps) {
    return (
        <div className="flex items-center min-h-9 gap-3 group">
            <span className="w-28 shrink-0 text-sm text-slate-400 font-medium">{label}</span>
            <div className="flex-1">{children}</div>
        </div>
    )
}

interface Props {
    task: Task
    onClose: () => void
}

export default function TaskDetailModal({ task, onClose }: Props) {
    // Editable fields — local state
    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description ?? '')
    const [assignee, setAssignee] = useState(task.assignee ?? '')

    // Comment input
    const [commentText, setCommentText] = useState('')
    const [commentAuthor, setCommentAuthor] = useState(() =>
        localStorage.getItem('taskboard.commenterName') ?? ''
    )

    const titleRef = useRef<HTMLTextAreaElement>(null)
    const commentTextRef = useRef<HTMLTextAreaElement>(null)

    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()
    const comments = useComments(task.id)
    const createComment = useCreateComment(task.id)
    const deleteComment = useDeleteComment(task.id)

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    useEffect(() => {
        const el = titleRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = el.scrollHeight + 'px'
    }, [title])

    const save = (patch: Parameters<typeof updateTask.mutate>[0]['data']) => {
        if (Object.keys(patch).length === 0) return
        updateTask.mutate({ id: task.id, data: patch })
    }

    const handleTitleBlur = () => {
        const t = title.trim()
        if (t && t !== task.title) save({ title: t })
        else setTitle(task.title)
    }

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') { e.preventDefault(); titleRef.current?.blur() }
    }

    const handleDescriptionBlur = () => {
        const d = description.trim() || undefined
        if (d !== (task.description ?? undefined)) save({ description: d })
    }

    const handleAssigneeBlur = () => {
        const a = assignee.trim() || undefined
        if (a !== (task.assignee ?? undefined)) save({ assignee: a })
    }

    const handleAssigneeKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') (e.target as HTMLElement).blur()
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        save({ status: e.target.value as TaskStatus })
    }

    const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const v = e.target.value
        save({ priority: v ? (v as TaskPriority) : undefined })
    }

    const handleDelete = () => {
        if (!window.confirm('Delete this task? This cannot be undone.')) return
        deleteTask.mutate(task.id, { onSuccess: onClose })
    }

    const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setCommentAuthor(val)
        localStorage.setItem('taskboard.commenterName', val)
    }

    const submitComment = () => {
        const content = commentText.trim()
        if (!content) return
        createComment.mutate(
            { content, authorName: commentAuthor.trim() || undefined },
            { onSuccess: () => setCommentText('') }
        )
    }

    const handleCommentKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitComment()
    }

    const status   = STATUS_CONFIG[task.status]
    const priority = task.priority ? PRIORITY_CONFIG[task.priority] : null

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            #{task.id}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ${status.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                        </span>
                        {updateTask.isPending && (
                            <span className="text-xs text-slate-400">Saving…</span>
                        )}
                        {updateTask.isSuccess && !updateTask.isPending && (
                            <span className="text-xs text-green-500">✓ Saved</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleDelete}
                            disabled={deleteTask.isPending}
                            className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {deleteTask.isPending ? 'Deleting…' : 'Delete'}
                        </button>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-lg"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="px-8 py-6 flex flex-col gap-6">

                        <textarea
                            ref={titleRef}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            rows={1}
                            maxLength={255}
                            placeholder="Task title"
                            className="w-full text-2xl font-bold text-slate-900 resize-none overflow-hidden border-0 outline-none bg-transparent leading-tight placeholder-slate-300 -mt-1"
                        />

                        <div className="flex flex-col divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                            <div className="px-4 py-1">
                                <PropertyRow label="Status">
                                    <select
                                        value={task.status}
                                        onChange={handleStatusChange}
                                        disabled={updateTask.isPending}
                                        className="text-sm text-slate-700 bg-transparent border-0 outline-none cursor-pointer focus:ring-0 disabled:opacity-60 -ml-1 py-1"
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </PropertyRow>
                            </div>

                            <div className="px-4 py-1">
                                <PropertyRow label="Priority">
                                    <div className="flex items-center gap-2">
                                        {priority && (
                                            <span className={`text-sm font-semibold ${priority.color}`}>
                                                {priority.icon}
                                            </span>
                                        )}
                                        <select
                                            value={task.priority ?? ''}
                                            onChange={handlePriorityChange}
                                            disabled={updateTask.isPending}
                                            className="text-sm text-slate-700 bg-transparent border-0 outline-none cursor-pointer focus:ring-0 disabled:opacity-60 -ml-1 py-1"
                                        >
                                            <option value="">No priority</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                </PropertyRow>
                            </div>

                            <div className="px-4 py-1">
                                <PropertyRow label="Assignee">
                                    <input
                                        value={assignee}
                                        onChange={e => setAssignee(e.target.value)}
                                        onBlur={handleAssigneeBlur}
                                        onKeyDown={handleAssigneeKeyDown}
                                        placeholder="Unassigned"
                                        maxLength={100}
                                        className="w-full text-sm text-slate-700 bg-transparent border-0 outline-none focus:ring-0 placeholder-slate-400 py-1"
                                    />
                                </PropertyRow>
                            </div>

                            <div className="px-4 py-1">
                                <PropertyRow label="Created">
                                    <span className="text-sm text-slate-500" title={formatFull(task.createdAt)}>
                                        {relativeTime(task.createdAt)}
                                    </span>
                                </PropertyRow>
                            </div>

                            <div className="px-4 py-1">
                                <PropertyRow label="Updated">
                                    <span className="text-sm text-slate-500" title={formatFull(task.updatedAt)}>
                                        {relativeTime(task.updatedAt)}
                                    </span>
                                </PropertyRow>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Description
                            </p>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                onBlur={handleDescriptionBlur}
                                rows={4}
                                maxLength={1000}
                                placeholder="Add a description…"
                                className="w-full text-sm text-slate-700 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-slate-300 leading-relaxed resize-none"
                            />
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                Comments
                                {comments.data && comments.data.length > 0 && (
                                    <span className="ml-2 text-slate-300 font-normal normal-case">
                                        ({comments.data.length})
                                    </span>
                                )}
                            </p>

                            <div className="flex flex-col gap-3 mb-4">
                                {comments.isLoading && (
                                    <p className="text-sm text-slate-400">Loading comments…</p>
                                )}
                                {comments.data?.length === 0 && (
                                    <p className="text-sm text-slate-400">No comments yet. Be the first!</p>
                                )}
                                {comments.data?.map(comment => (
                                    <div key={comment.id} className="flex gap-3 group">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 text-white text-xs font-bold select-none mt-0.5">
                                            {authorInitial(comment.authorName)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {comment.authorName ?? 'Anonymous'}
                                                </span>
                                                <span
                                                    className="text-xs text-slate-400 cursor-default"
                                                    title={formatFull(comment.createdAt)}
                                                >
                                                    {relativeTime(comment.createdAt)}
                                                </span>
                                                <button
                                                    onClick={() => deleteComment.mutate(comment.id)}
                                                    className="ml-auto text-xs text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete comment"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                            <p className="text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-2.5 leading-relaxed whitespace-pre-wrap">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add comment */}
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shrink-0 text-white text-xs font-bold select-none mt-0.5">
                                    {commentAuthor ? commentAuthor[0].toUpperCase() : '?'}
                                </div>
                                <div className="flex-1 flex flex-col gap-2">
                                    <input
                                        value={commentAuthor}
                                        onChange={handleAuthorChange}
                                        placeholder="Your name (optional)"
                                        className="text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-slate-400 w-40"
                                    />
                                    <textarea
                                        ref={commentTextRef}
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        onKeyDown={handleCommentKeyDown}
                                        placeholder="Write a comment… (Ctrl+Enter to submit)"
                                        rows={3}
                                        className="w-full text-sm text-slate-700 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-slate-400 resize-none leading-relaxed"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={submitComment}
                                            disabled={!commentText.trim() || createComment.isPending}
                                            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {createComment.isPending ? 'Adding…' : 'Add Comment'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
