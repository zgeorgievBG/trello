import api from './axios'
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '../types/task.types'

export interface TaskQuery {
    projectId: number
    status?: string
    search?: string
    page?: number
    limit?: number
}

export interface PaginatedResponse {
    data: Task[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface ApiResponse<T> {
    data: T
    error: string | null
}

export const fetchTasks = async (query: TaskQuery): Promise<PaginatedResponse> => {
    const params = new URLSearchParams()
    params.append('projectId', query.projectId.toString())
    if (query.status) params.append('status', query.status)
    if (query.search) params.append('search', query.search)
    if (query.page) params.append('page', query.page.toString())
    if (query.limit) params.append('limit', query.limit.toString())

    const response = await api.get<ApiResponse<PaginatedResponse>>(`/tasks?${params.toString()}`)
    return response.data.data
}

export const fetchTaskById = async (id: number): Promise<Task> => {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`)
    return response.data.data
}

export const createTask = async (data: CreateTaskDTO): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>('/tasks', data)
    return response.data.data
}

export const updateTask = async (id: number, data: UpdateTaskDTO): Promise<Task> => {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data)
    return response.data.data
}

export const deleteTask = async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`)
}

export const fetchTaskCount = async (projectId: number): Promise<Record<string, number>> => {
    const response = await api.get<ApiResponse<Record<string, number>>>(
        `/tasks/counts?projectId=${projectId}`
    )
    return response.data.data
}
