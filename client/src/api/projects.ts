import api from './axios'
import type { Project, CreateProjectDTO, UpdateProjectDTO } from '../types/project.types'

interface ApiResponse<T> {
    data: T
    error: string | null
}

export const fetchProjects = async (): Promise<Project[]> => {
    const response = await api.get<ApiResponse<Project[]>>('/projects')
    return response.data.data
}

export const createProject = async (data: CreateProjectDTO): Promise<Project> => {
    const response = await api.post<ApiResponse<Project>>('/projects', data)
    return response.data.data
}

export const updateProject = async (id: number, data: UpdateProjectDTO): Promise<Project> => {
    const response = await api.patch<ApiResponse<Project>>(`/projects/${id}`, data)
    return response.data.data
}

export const deleteProject = async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`)
}
