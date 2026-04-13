import pool from '../../config/db';
import { Task, CreateTaskDTO, UpdateTaskDTO } from './task.types';

export interface TaskQuery {
    projectId: number;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedTasks {
    data: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const findAll = async (query: TaskQuery): Promise<PaginatedTasks> => {
    const { projectId, status, search, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['"projectId" = $1'];
    const params: unknown[] = [projectId];

    if (status) {
        params.push(status);
        conditions.push(`status = $${params.length}`);
    }
    if (search) {
        params.push(`%${search}%`);
        conditions.push(`title ILIKE $${params.length}`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await pool.query<{ total: string }>(
        `SELECT COUNT(*) AS total FROM tasks ${where}`,
        params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    params.push(limit, offset);
    const tasksResult = await pool.query<Task>(
        `SELECT * FROM tasks ${where} ORDER BY "createdAt" DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
    );

    return { data: tasksResult.rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const findById = async (id: number): Promise<Task | undefined> => {
    const { rows } = await pool.query<Task>('SELECT * FROM tasks WHERE id = $1', [id]);
    return rows[0];
};

export const create = async (data: CreateTaskDTO): Promise<Task> => {
    const { rows } = await pool.query<Task>(
        `INSERT INTO tasks ("projectId", title, description, status, priority, assignee)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
            data.projectId,
            data.title,
            data.description ?? null,
            data.status ?? 'todo',
            data.priority ?? null,
            data.assignee ?? null,
        ]
    );
    return rows[0];
};

export const update = async (id: number, data: UpdateTaskDTO): Promise<Task | undefined> => {
    const existing = await findById(id);
    if (!existing) {
        return undefined;
    }

    const { rows } = await pool.query<Task>(
        `UPDATE tasks
         SET title       = $1,
             description = $2,
             status      = $3,
             priority    = $4,
             assignee    = $5,
             "updatedAt" = NOW()
         WHERE id = $6
         RETURNING *`,
        [
            data.title ?? existing.title,
            data.description ?? existing.description,
            data.status ?? existing.status,
            data.priority ?? existing.priority,
            data.assignee ?? existing.assignee,
            id,
        ]
    );
    return rows[0];
};

export const remove = async (id: number): Promise<boolean> => {
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
};

export const getCounts = async (projectId: number): Promise<Record<string, number>> => {
    const { rows } = await pool.query<{ status: string; count: string }>(
        `SELECT status, COUNT(*) AS count FROM tasks WHERE "projectId" = $1 GROUP BY status`,
        [projectId]
    );

    return rows.reduce(
        (acc, row) => {
            acc[row.status] = parseInt(row.count, 10);
            return acc;
        },
        {} as Record<string, number>
    );
};
