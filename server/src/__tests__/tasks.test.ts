import request from 'supertest';
import { createTestApp } from './setup';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TestApp = any;

describe('Tasks API', () => {
    let app: TestApp;
    let cleanup: () => Promise<void>;
    let projectId: number;

    beforeAll(async () => {
        ({ app, cleanup } = await createTestApp());

        // Seed a project that all task tests use
        const res = await request(app)
            .post('/projects')
            .send({ name: 'Test Project' });
        projectId = res.body.data.id;
    });

    afterAll(async () => {
        await cleanup();
    });


    describe('GET /tasks', () => {
        it('returns 400 when projectId is missing', async () => {
            const res = await request(app).get('/tasks');
            expect(res.status).toBe(400);
        });

        it('returns empty paginated result for a new project', async () => {
            const res = await request(app).get(`/tasks?projectId=${projectId}`);
            expect(res.status).toBe(200);
            expect(res.body.error).toBeNull();
            expect(res.body.data.data).toHaveLength(0);
            expect(res.body.data.total).toBe(0);
            expect(res.body.data.page).toBe(1);
        });
    });


    describe('POST /tasks', () => {
        it('creates a task with required fields only', async () => {
            const res = await request(app)
                .post('/tasks')
                .send({ projectId, title: 'My first task' });

            expect(res.status).toBe(201);
            expect(res.body.data).toMatchObject({
                id: expect.any(Number),
                projectId,
                title: 'My first task',
                status: 'todo',
            });
        });

        it('creates a task with all optional fields', async () => {
            const res = await request(app)
                .post('/tasks')
                .send({
                    projectId,
                    title: 'Full task',
                    description: 'Some details',
                    status: 'in-progress',
                    priority: 'high',
                    assignee: 'Alice',
                });

            expect(res.status).toBe(201);
            expect(res.body.data).toMatchObject({
                title: 'Full task',
                status: 'in-progress',
                priority: 'high',
                assignee: 'Alice',
            });
        });

        it('returns 400 when title is missing', async () => {
            const res = await request(app)
                .post('/tasks')
                .send({ projectId });
            expect(res.status).toBe(400);
        });

        it('returns 400 for invalid status value', async () => {
            const res = await request(app)
                .post('/tasks')
                .send({ projectId, title: 'Bad status', status: 'unknown' });
            expect(res.status).toBe(400);
        });
    });


    describe('GET /tasks/:id', () => {
        let taskId: number;

        beforeAll(async () => {
            const res = await request(app)
                .post('/tasks')
                .send({ projectId, title: 'Fetch me' });
            taskId = res.body.data.id;
        });

        it('returns the task by id', async () => {
            const res = await request(app).get(`/tasks/${taskId}`);
            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(taskId);
            expect(res.body.data.title).toBe('Fetch me');
        });

        it('returns 404 for a non-existent task', async () => {
            const res = await request(app).get('/tasks/999999');
            expect(res.status).toBe(404);
        });
    });


    describe('PUT /tasks/:id', () => {
        let taskId: number;

        beforeAll(async () => {
            const res = await request(app)
                .post('/tasks')
                .send({ projectId, title: 'Update me' });
            taskId = res.body.data.id;
        });

        it('updates the task title', async () => {
            const res = await request(app)
                .put(`/tasks/${taskId}`)
                .send({ title: 'Updated title' });

            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('Updated title');
        });

        it('updates status to done', async () => {
            const res = await request(app)
                .put(`/tasks/${taskId}`)
                .send({ status: 'done' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('done');
        });

        it('returns 404 for a non-existent task', async () => {
            const res = await request(app)
                .put('/tasks/999999')
                .send({ title: 'Ghost' });
            expect(res.status).toBe(404);
        });

        it('returns 400 for invalid priority', async () => {
            const res = await request(app)
                .put(`/tasks/${taskId}`)
                .send({ priority: 'critical' });
            expect(res.status).toBe(400);
        });
    });


    describe('DELETE /tasks/:id', () => {
        let taskId: number;

        beforeAll(async () => {
            const res = await request(app)
                .post('/tasks')
                .send({ projectId, title: 'Delete me' });
            taskId = res.body.data.id;
        });

        it('deletes the task', async () => {
            const res = await request(app).delete(`/tasks/${taskId}`);
            expect(res.status).toBe(200);
        });

        it('returns 404 after deletion', async () => {
            const res = await request(app).get(`/tasks/${taskId}`);
            expect(res.status).toBe(404);
        });

        it('returns 404 when deleting again', async () => {
            const res = await request(app).delete(`/tasks/${taskId}`);
            expect(res.status).toBe(404);
        });
    });


    describe('GET /tasks/counts', () => {
        let countProjectId: number;

        beforeAll(async () => {
            const proj = await request(app)
                .post('/projects')
                .send({ name: 'Count Project' });
            countProjectId = proj.body.data.id;

            await request(app).post('/tasks').send({ projectId: countProjectId, title: 'T1', status: 'todo' });
            await request(app).post('/tasks').send({ projectId: countProjectId, title: 'T2', status: 'todo' });
            await request(app).post('/tasks').send({ projectId: countProjectId, title: 'T3', status: 'in-progress' });
            await request(app).post('/tasks').send({ projectId: countProjectId, title: 'T4', status: 'done' });
        });

        it('returns correct counts per status', async () => {
            const res = await request(app).get(`/tasks/counts?projectId=${countProjectId}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toMatchObject({ todo: 2, 'in-progress': 1, done: 1 });
        });
    });


    describe('Filtering and pagination', () => {
        let filterProjectId: number;

        beforeAll(async () => {
            const proj = await request(app)
                .post('/projects')
                .send({ name: 'Filter Project' });
            filterProjectId = proj.body.data.id;

            for (let i = 1; i <= 5; i++) {
                await request(app).post('/tasks').send({
                    projectId: filterProjectId,
                    title: `Todo task ${i}`,
                    status: 'todo',
                });
            }
            await request(app).post('/tasks').send({
                projectId: filterProjectId,
                title: 'Done task',
                status: 'done',
            });
        });

        it('filters by status', async () => {
            const res = await request(app).get(`/tasks?projectId=${filterProjectId}&status=done`);
            expect(res.status).toBe(200);
            expect(res.body.data.data).toHaveLength(1);
            expect(res.body.data.data[0].status).toBe('done');
        });

        it('filters by search term', async () => {
            const res = await request(app).get(`/tasks?projectId=${filterProjectId}&search=Todo+task+3`);
            expect(res.status).toBe(200);
            expect(res.body.data.data).toHaveLength(1);
            expect(res.body.data.data[0].title).toBe('Todo task 3');
        });

        it('paginates correctly (page 1, limit 3)', async () => {
            const res = await request(app).get(`/tasks?projectId=${filterProjectId}&limit=3&page=1`);
            expect(res.status).toBe(200);
            expect(res.body.data.data).toHaveLength(3);
            expect(res.body.data.total).toBe(6);
            expect(res.body.data.totalPages).toBe(2);
        });

        it('paginates correctly (page 2, limit 3)', async () => {
            const res = await request(app).get(`/tasks?projectId=${filterProjectId}&limit=3&page=2`);
            expect(res.status).toBe(200);
            expect(res.body.data.data).toHaveLength(3);
        });
    });


    describe('Comments', () => {
        let taskId: number;

        beforeAll(async () => {
            const res = await request(app)
                .post('/tasks')
                .send({ projectId, title: 'Commented task' });
            taskId = res.body.data.id;
        });

        it('returns empty comments list', async () => {
            const res = await request(app).get(`/tasks/${taskId}/comments`);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(0);
        });

        it('adds a comment', async () => {
            const res = await request(app)
                .post(`/tasks/${taskId}/comments`)
                .send({ content: 'Looks good!', authorName: 'Alice' });

            expect(res.status).toBe(201);
            expect(res.body.data).toMatchObject({
                id: expect.any(Number),
                taskId,
                content: 'Looks good!',
                authorName: 'Alice',
            });
        });

        it('lists the added comment', async () => {
            const res = await request(app).get(`/tasks/${taskId}/comments`);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });

        it('deletes a comment', async () => {
            const create = await request(app)
                .post(`/tasks/${taskId}/comments`)
                .send({ content: 'To be deleted' });
            const commentId = create.body.data.id;

            const del = await request(app).delete(`/tasks/${taskId}/comments/${commentId}`);
            expect(del.status).toBe(200);

            const list = await request(app).get(`/tasks/${taskId}/comments`);
            expect(list.body.data).toHaveLength(1); // only original comment remains
        });

        it('returns 400 when comment content is missing', async () => {
            const res = await request(app)
                .post(`/tasks/${taskId}/comments`)
                .send({ authorName: 'Bob' });
            expect(res.status).toBe(400);
        });
    });
});
