import pool from '../../config/db';
import { Comment, CreateCommentDTO } from './comment.types';

export const findByTaskId = async (taskId: number): Promise<Comment[]> => {
    const { rows } = await pool.query<Comment>(
        'SELECT * FROM comments WHERE "taskId" = $1 ORDER BY "createdAt" ASC',
        [taskId]
    );
    return rows;
};

export const create = async (taskId: number, data: CreateCommentDTO): Promise<Comment> => {
    const { rows } = await pool.query<Comment>(
        `INSERT INTO comments ("taskId", content, "authorName")
         VALUES ($1, $2, $3)
         RETURNING *`,
        [taskId, data.content, data.authorName ?? null]
    );
    return rows[0];
};

export const remove = async (id: number): Promise<boolean> => {
    const { rowCount } = await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
};
