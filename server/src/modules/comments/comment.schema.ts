import { z } from 'zod';

export const createCommentSchema = z.object({
    body: z.object({
        content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
        authorName: z.string().max(100).optional(),
    }),
});
