import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err.stack);

    if (err instanceof ZodError) {
        res.status(400).json({ data: null, error: err.issues.map((e) => e.message).join(' ') });
        return;
    }

    if (err.message === 'Task not found' || err.message === 'Project not found' || err.message === 'Comment not found') {
        res.status(404).json({ data: null, error: err.message });
        return;
    }
    res.status(500).json({ data: null, error: err.message || 'Internal server error' });
}