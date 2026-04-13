import api from './axios'
import type { Comment, CreateCommentDTO } from '../types/comment.types'

interface ApiResponse<T> {
    data: T
    error: string | null
}

export const fetchComments = async (taskId: number): Promise<Comment[]> => {
    const response = await api.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`)
    return response.data.data
}

export const createComment = async (taskId: number, data: CreateCommentDTO): Promise<Comment> => {
    const response = await api.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, data)
    return response.data.data
}

export const deleteComment = async (taskId: number, commentId: number): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`)
}
