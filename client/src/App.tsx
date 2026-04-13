import { useState } from 'react'
import ProjectSidebar from './components/ProjectSidebar'
import TaskBoard from './components/TaskBoard'
import type { Project } from './types/project.types'

function App() {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100">
            <ProjectSidebar selected={selectedProject} onSelect={setSelectedProject} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {selectedProject ? (
                    <TaskBoard
                        projectId={selectedProject.id}
                        projectName={selectedProject.name}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
                        <span className="text-5xl">📋</span>
                        <p className="text-lg font-medium text-slate-700">No project selected</p>
                        <p className="text-sm">Create or select a project from the sidebar to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
