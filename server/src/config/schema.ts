import pool from './db';

export const createTables = async (): Promise<void> => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS projects (
            id          SERIAL PRIMARY KEY,
            name        TEXT NOT NULL,
            description TEXT,
            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    const { rows } = await pool.query<{ exists: boolean }>(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'tasks'
        ) AS exists
    `);

    if (!rows[0].exists) {
        await pool.query(`
            CREATE TABLE tasks (
                id          SERIAL PRIMARY KEY,
                "projectId" INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                title       TEXT NOT NULL,
                description TEXT,
                status      TEXT NOT NULL DEFAULT 'todo'
                            CHECK(status IN ('todo', 'in-progress', 'done')),
                priority    TEXT CHECK(priority IN ('low', 'medium', 'high')),
                assignee    TEXT,
                "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);
    } else {
        const { rows: cols } = await pool.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'projectId'
        `);

        if (cols.length === 0) {
            const { rows: proj } = await pool.query(
                `INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING id`,
                ['Default Project', 'Auto-created for existing tasks']
            );
            const defaultProjectId = proj[0].id;
            await pool.query(`ALTER TABLE tasks ADD COLUMN "projectId" INTEGER`);
            await pool.query(`UPDATE tasks SET "projectId" = $1`, [defaultProjectId]);
            console.log(`Migrated existing tasks to "Default Project" (id=${defaultProjectId})`);
        }
    }

    await pool.query(`
        CREATE TABLE IF NOT EXISTS comments (
            id           SERIAL PRIMARY KEY,
            "taskId"     INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            content      TEXT NOT NULL,
            "authorName" TEXT,
            "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    console.log('Database tables created');
};
