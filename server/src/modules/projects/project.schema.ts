import { z } from 'zod';

export const createProjectSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').max(30, 'Name is too long'),
        description: z.string().max(100, 'Description is too long').optional(),
    }),
});

export const updateProjectSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(30).optional(),
        description: z.string().max(100).optional(),
    }),
});
