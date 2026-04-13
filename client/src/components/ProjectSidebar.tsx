import { useState, useEffect, useRef } from 'react'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects'
import type { Project } from '../types/project.types'

interface Props {
    selected: Project | null
    onSelect: (project: Project | null) => void
}

export default function ProjectSidebar({ selected, onSelect }: Props) {
    const { data: projects = [], isLoading } = useProjects()

    const createProject = useCreateProject()
    const updateProject = useUpdateProject()
    const deleteProject = useDeleteProject()

    const [isCreating, setIsCreating] = useState(false)
    const [newName, setNewName] = useState('')
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editName, setEditName] = useState('')
    const newInputRef = useRef<HTMLInputElement>(null)
    const editInputRef = useRef<HTMLInputElement>(null)

    // Auto-select first project on initial load
    useEffect(() => {
        if (!selected && projects.length > 0) {
            onSelect(projects[0])
        }
    }, [projects, selected, onSelect])

    useEffect(() => {
        if (isCreating) newInputRef.current?.focus()
    }, [isCreating])

    useEffect(() => {
        if (editingId !== null) editInputRef.current?.focus()
    }, [editingId])

    const submitCreate = () => {
        const name = newName.trim()
        if (!name) {
            setIsCreating(false)
            setNewName('')
            return
        }
        createProject.mutate(
            { name },
            {
                onSuccess: project => {
                    onSelect(project)
                    setIsCreating(false)
                    setNewName('')
                },
            }
        )
    }

    const handleCreateKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') submitCreate()
        if (e.key === 'Escape') {
            setIsCreating(false)
            setNewName('')
        }
    }

    const startEdit = (project: Project) => {
        setEditingId(project.id)
        setEditName(project.name)
    }

    const submitEdit = () => {
        const name = editName.trim()
        if (!name || editingId === null) {
            setEditingId(null)
            return
        }
        updateProject.mutate(
            { id: editingId, data: { name } },
            {
                onSuccess: updatedProject => {
                    if (selected?.id === updatedProject.id) onSelect(updatedProject)
                    setEditingId(null)
                },
            }
        )
    }

    const handleEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') submitEdit()
        if (e.key === 'Escape') setEditingId(null)
    }

    const handleDelete = (project: Project) => {
        if (!window.confirm(`Delete "${project.name}" and all its tasks?`)) return
        deleteProject.mutate(project.id, {
            onSuccess: () => {
                if (selected?.id === project.id) onSelect(null)
            },
        })
    }

    return (
        <aside className="w-60 shrink-0 bg-slate-800 flex flex-col h-screen">
            <div className="px-4 py-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <span className="text-white font-bold tracking-tight">TaskBoard</span>
                </div>
            </div>

            <div className="px-4 pt-4 pb-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Projects
                </span>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-1">
                {isLoading && (
                    <p className="text-slate-500 text-sm px-2 py-2">Loading…</p>
                )}
                {!isLoading && projects.length === 0 && !isCreating && (
                    <p className="text-slate-500 text-sm px-2 py-2">No projects yet</p>
                )}
                {projects.map(project => (
                    <div
                        key={project.id}
                        className={`group flex items-center gap-2 rounded-lg px-3 py-2 mb-0.5 cursor-pointer transition-colors ${
                            selected?.id === project.id
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-700'
                        }`}
                        onClick={() => editingId !== project.id && onSelect(project)}
                    >
                        <span className="text-xs opacity-60">●</span>

                        {editingId === project.id ? (
                            <input
                                ref={editInputRef}
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                onBlur={submitEdit}
                                className="flex-1 min-w-0 text-sm bg-slate-600 text-white rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-blue-400"
                                onClick={e => e.stopPropagation()}
                            />
                        ) : (
                            <span className="flex-1 min-w-0 text-sm truncate">{project.name}</span>
                        )}

                        {editingId !== project.id && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                    onClick={e => {
                                        e.stopPropagation()
                                        startEdit(project)
                                    }}
                                    className="text-slate-400 hover:text-white w-5 h-5 flex items-center justify-center rounded transition-colors"
                                    title="Rename"
                                >
                                    ✎
                                </button>
                                <button
                                    onClick={e => {
                                        e.stopPropagation()
                                        handleDelete(project)
                                    }}
                                    className="text-slate-400 hover:text-red-400 w-5 h-5 flex items-center justify-center rounded transition-colors"
                                    title="Delete project"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {isCreating && (
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-slate-700">
                        <span className="text-xs text-slate-400">●</span>
                        <input
                            ref={newInputRef}
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={handleCreateKeyDown}
                            onBlur={submitCreate}
                            placeholder="Project name…"
                            className="flex-1 min-w-0 text-sm bg-transparent text-white outline-none placeholder-slate-500"
                        />
                    </div>
                )}
            </nav>

            <div className="px-3 py-3 border-t border-slate-700">
                <button
                    onClick={() => setIsCreating(true)}
                    disabled={isCreating}
                    className="w-full flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50"
                >
                    <span className="text-base leading-none">+</span>
                    <span>New Project</span>
                </button>
            </div>
        </aside>
    )
}
