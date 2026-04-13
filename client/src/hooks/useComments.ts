import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as commentsApi from '../api/comments'
import type { CreateCommentDTO } from '../types/comment.types'

export const useComments = (taskId: number) => {
    return useQuery({
        queryKey: ['comments', taskId],
        queryFn: () => commentsApi.fetchComments(taskId),
    })
}

export const useCreateComment = (taskId: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateCommentDTO) => commentsApi.createComment(taskId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', taskId] }),
    })
}

export const useDeleteComment = (taskId: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (commentId: number) => commentsApi.deleteComment(taskId, commentId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', taskId] }),
    })
}
