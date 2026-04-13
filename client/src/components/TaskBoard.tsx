import { useState, useCallback, useMemo } from 'react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import TaskColumn from './TaskColumn'
import CreateTaskModal from './CreateTaskModal'
import SearchBar from './SearchBar'
import { useTaskCounts, useUpdateTask } from '../hooks/useTasks'
import type { Task, TaskStatus } from '../types/task.types'

interface Column {
    status: TaskStatus
    label: string
    accentClass: string
    badgeClass: string
    countClass: string
}

const COLUMNS: Column[] = [
    {
        status: 'todo',
        label: 'To Do',
        accentClass: 'bg-blue-500',
        badgeClass: 'bg-blue-100 text-blue-700',
        countClass: 'bg-blue-100 text-blue-700',
    },
    {
        status: 'in-progress',
        label: 'In Progress',
        accentClass: 'bg-amber-500',
        badgeClass: 'bg-amber-100 text-amber-700',
        countClass: 'bg-amber-100 text-amber-700',
    },
    {
        status: 'done',
        label: 'Done',
        accentClass: 'bg-green-500',
        badgeClass: 'bg-green-100 text-green-700',
        countClass: 'bg-green-100 text-green-700',
    },
]

interface Props {
    projectId: number
    projectName: string
}

export default function TaskBoard({ projectId, projectName }: Props) {
    const [search, setSearch] = useState('')
    const [createStatus, setCreateStatus] = useState<TaskStatus>('todo')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [draggingTask, setDraggingTask] = useState<Task | null>(null)

    const { counts } = useTaskCounts(projectId)
    const updateTask = useUpdateTask()

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    )

    const openCreate = useCallback((status: TaskStatus) => {
        setCreateStatus(status)
        setIsModalOpen(true)
    }, [])

    const closeModal = useCallback(() => setIsModalOpen(false), [])

    const totalTasks = useMemo(
        () => (counts ? Object.values(counts).reduce((sum, n) => sum + n, 0) : null),
        [counts]
    )

    const handleDragStart = (event: DragStartEvent) => {
        setDraggingTask(event.active.data.current?.task ?? null)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setDraggingTask(null)
        if (!over) return
        const newStatus = over.id as TaskStatus
        const task = active.data.current?.task as Task
        if (!task || task.status === newStatus) return
        updateTask.mutate({ id: task.id, data: { status: newStatus } })
    }

    return (
        <div className="flex flex-col h-full">
            <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-bold text-slate-800 truncate max-w-xs">
                        {projectName}
                    </h1>
                    <div className="flex-1 max-w-sm">
                        <SearchBar onChange={setSearch} />
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        {counts && (
                            <div className="hidden sm:flex items-center gap-2">
                                {COLUMNS.map(col => (
                                    <span
                                        key={col.status}
                                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${col.countClass}`}
                                    >
                                        {col.label}: {counts[col.status] ?? 0}
                                    </span>
                                ))}
                                {totalTasks !== null && (
                                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-600">
                                        Total: {totalTasks}
                                    </span>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() => openCreate('todo')}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shrink-0"
                        >
                            <span className="text-base leading-none">+</span>
                            <span>New Task</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-auto px-6 py-6 bg-slate-100">
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 h-full">
                        {COLUMNS.map(col => (
                            <TaskColumn
                                key={col.status}
                                projectId={projectId}
                                status={col.status}
                                label={col.label}
                                accentClass={col.accentClass}
                                badgeClass={col.badgeClass}
                                search={search}
                                onAddTask={() => openCreate(col.status)}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {draggingTask && (
                            <div className="bg-white border border-slate-300 rounded-lg p-3 shadow-xl rotate-1 cursor-grabbing">
                                <p className="text-sm font-medium text-slate-800">{draggingTask.title}</p>
                                {draggingTask.priority && (
                                    <span className="mt-1.5 inline-block text-xs px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-500">
                                        {draggingTask.priority}
                                    </span>
                                )}
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </main>

            {isModalOpen && (
                <CreateTaskModal
                    projectId={projectId}
                    defaultStatus={createStatus}
                    onClose={closeModal}
                />
            )}
        </div>
    )
}
