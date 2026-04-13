import pool from '../../config/db';
import { Project, CreateProjectDTO, UpdateProjectDTO } from './project.types';

export const findAll = async (): Promise<Project[]> => {
    const { rows } = await pool.query<Project>('SELECT * FROM projects ORDER BY "createdAt" ASC');
    return rows;
};

export const findById = async (id: number): Promise<Project | undefined> => {
    const { rows } = await pool.query<Project>('SELECT * FROM projects WHERE id = $1', [id]);
    return rows[0];
};

export const create = async (data: CreateProjectDTO): Promise<Project> => {
    const { rows } = await pool.query<Project>(
        `INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *`,
        [data.name, data.description ?? null]
    );
    return rows[0];
};

export const update = async (id: number, data: UpdateProjectDTO): Promise<Project | undefined> => {
    const existing = await findById(id);
    if (!existing) return undefined;

    const { rows } = await pool.query<Project>(
        `UPDATE projects
         SET name = $1,
         description = $2,
         "updatedAt" = NOW()
         WHERE id = $3
         RETURNING *`,
        [
            data.name ?? existing.name,
            data.description !== undefined ? data.description : existing.description,
            id,
        ]
    );
    return rows[0];
};

export const remove = async (id: number): Promise<boolean> => {
    const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
};
