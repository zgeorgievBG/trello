import { z } from 'zod';

export const createTaskSchema = z.object({
    body: z.object({
        projectId: z.number().int().positive(),
        title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
        description: z.string().max(1000).optional(),
        status: z.enum(['todo', 'in-progress', 'done']).optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        assignee: z.string().max(50).optional(),
    }),
});

export const updateTaskSchema = z.object({
    body: z.object({
        title: z.string().min(1).max(100).optional(),
        description: z.string().max(1000).optional(),
        status: z.enum(['todo', 'in-progress', 'done']).optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        assignee: z.string().max(50).optional(),
    }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
