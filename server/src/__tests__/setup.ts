import { Pool } from 'pg';

const TEST_DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    process.env.DATABASE_URL ||
    'postgresql://trello:trello@localhost:5432/trello_test';

/**
 * Creates a fresh schema in the test database, returns app and an async
 * cleanup that drops all tables so each suite starts with a clean slate.
 */
export async function createTestApp() {
    process.env.DATABASE_URL = TEST_DATABASE_URL;
    process.env.NODE_ENV = 'test';

    // Drop and recreate tables so each suite gets an empty database
    const adminPool = new Pool({ connectionString: TEST_DATABASE_URL });
    await adminPool.query('DROP TABLE IF EXISTS comments, tasks, projects CASCADE');
    await adminPool.end();

    // Purge cached modules so the pool picks up the (possibly changed) DATABASE_URL
    jest.resetModules();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createTables } = require('../config/schema');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const app = require('../app').default;

    await createTables();

    const cleanup = async () => {
        const pool = new Pool({ connectionString: TEST_DATABASE_URL });
        await pool.query('DROP TABLE IF EXISTS comments, tasks, projects CASCADE');
        await pool.end();
    };

    return { app, cleanup };
}
