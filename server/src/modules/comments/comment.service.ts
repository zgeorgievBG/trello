import * as commentRepository from './comment.repository';
import { Comment, CreateCommentDTO } from './comment.types';

export const getComments = async (taskId: number): Promise<Comment[]> => {
    return commentRepository.findByTaskId(taskId);
};

export const createComment = async (taskId: number, data: CreateCommentDTO): Promise<Comment> => {
    return commentRepository.create(taskId, data);
};

export const deleteComment = async (id: number): Promise<void> => {
    const deleted = await commentRepository.remove(id);
    if (!deleted) throw new Error('Comment not found');
};
