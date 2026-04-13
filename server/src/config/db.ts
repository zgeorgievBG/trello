import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://trello:trello@localhost:5432/trello',
});

export default pool;
