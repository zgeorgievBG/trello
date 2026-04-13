import 'dotenv/config';
import pool from './db';
import { createTables } from './schema';

const seedTasks = [
    {
        title: 'Setup project repository',
        description: 'Initialize git repo, create folder structure and install dependencies',
        status: 'done',
        priority: 'high',
        assignee: 'John Doe',
    },
    {
        title: 'Design database schema',
        description: 'Define tables, relationships and constraints for the application',
        status: 'done',
        priority: 'high',
        assignee: 'Jane Smith',
    },
    {
        title: 'Build REST API endpoints',
        description: 'Implement CRUD operations for tasks with proper validation',
        status: 'in-progress',
        priority: 'high',
        assignee: 'John Doe',
    },
    {
        title: 'Add authentication',
        description: 'Implement JWT based authentication for the API',
        status: 'in-progress',
        priority: 'medium',
        assignee: 'Jane Smith',
    },
    {
        title: 'Build React frontend',
        description: 'Create the UI components and connect them to the API',
        status: 'todo',
        priority: 'high',
        assignee: 'John Doe',
    },
    {
        title: 'Write unit tests',
        description: 'Add test coverage for service and repository layers',
        status: 'todo',
        priority: 'medium',
        assignee: 'Jane Smith',
    },
    {
        title: 'Setup Docker',
        description: 'Dockerize frontend and backend with docker-compose',
        status: 'todo',
        priority: 'low',
        assignee: 'John Doe',
    },
    {
        title: 'Write README',
        description: 'Document architecture, setup instructions and trade-offs',
        status: 'todo',
        priority: 'low',
        assignee: 'Jane Smith',
    },
];

const seed = async () => {
    await createTables();

    const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*) as count FROM tasks');
    if (parseInt(rows[0].count, 10) > 0) {
        console.log('Database already seeded, skipping...');
        await pool.end();
        process.exit(0);
    }

    const { rows: proj } = await pool.query(
        `INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING id`,
        ['Demo Project', 'Seeded demo project']
    );
    const projectId = proj[0].id;

    for (const task of seedTasks) {
        await pool.query(
            `INSERT INTO tasks ("projectId", title, description, status, priority, assignee)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [projectId, task.title, task.description, task.status, task.priority, task.assignee]
        );
    }

    console.log(`Seeded ${seedTasks.length} tasks successfully`);
    await pool.end();
    process.exit(0);
};

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
