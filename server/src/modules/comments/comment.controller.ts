import type { Request, Response, NextFunction } from 'express';
import * as commentService from './comment.service';

export const getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const taskId = parseInt(req.params.taskId as string);
        const comments = await commentService.getComments(taskId);
        res.status(200).json({ data: comments, error: null });
    } catch (err) {
        next(err);
    }
};

export const createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const taskId = parseInt(req.params.taskId as string);
        const comment = await commentService.createComment(taskId, req.body);
        res.status(201).json({ data: comment, error: null });
    } catch (err) {
        next(err);
    }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = parseInt(req.params.commentId as string);
        await commentService.deleteComment(id);
        res.status(200).json({ data: { message: 'Comment deleted' }, error: null });
    } catch (err) {
        next(err);
    }
};
