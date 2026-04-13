import request from 'supertest';
import { createTestApp } from './setup';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TestApp = any;

describe('Projects API', () => {
    let app: TestApp;
    let cleanup: () => Promise<void>;

    beforeAll(async () => {
        ({ app, cleanup } = await createTestApp());
    });

    afterAll(async () => {
        await cleanup();
    });


    describe('GET /projects', () => {
        it('returns an empty array when no projects exist', async () => {
            const res = await request(app).get('/projects');
            expect(res.status).toBe(200);
            expect(res.body.error).toBeNull();
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data).toHaveLength(0);
        });
    });


    describe('POST /projects', () => {
        it('creates a project and returns it', async () => {
            const res = await request(app)
                .post('/projects')
                .send({ name: 'Alpha', description: 'First project' });

            expect(res.status).toBe(201);
            expect(res.body.error).toBeNull();
            expect(res.body.data).toMatchObject({
                id: expect.any(Number),
                name: 'Alpha',
                description: 'First project',
            });
        });

        it('returns 400 when name is missing', async () => {
            const res = await request(app).post('/projects').send({ description: 'No name' });
            expect(res.status).toBe(400);
            expect(res.body.error).toBeTruthy();
        });

        it('returns 400 when name exceeds 100 chars', async () => {
            const res = await request(app)
                .post('/projects')
                .send({ name: 'x'.repeat(101) });
            expect(res.status).toBe(400);
            expect(res.body.error).toBeTruthy();
        });
    });


    describe('PATCH /projects/:id', () => {
        let projectId: number;

        beforeAll(async () => {
            const res = await request(app)
                .post('/projects')
                .send({ name: 'Beta' });
            projectId = res.body.data.id;
        });

        it('updates a project name', async () => {
            const res = await request(app)
                .patch(`/projects/${projectId}`)
                .send({ name: 'Beta Renamed' });

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe('Beta Renamed');
        });

        it('updates a project description', async () => {
            const res = await request(app)
                .patch(`/projects/${projectId}`)
                .send({ description: 'Updated desc' });

            expect(res.status).toBe(200);
            expect(res.body.data.description).toBe('Updated desc');
        });

        it('returns 404 for a non-existent project', async () => {
            const res = await request(app)
                .patch('/projects/999999')
                .send({ name: 'Ghost' });
            expect(res.status).toBe(404);
        });
    });


    describe('DELETE /projects/:id', () => {
        let projectId: number;

        beforeAll(async () => {
            const res = await request(app)
                .post('/projects')
                .send({ name: 'ToDelete' });
            projectId = res.body.data.id;
        });

        it('deletes a project and returns 200', async () => {
            const res = await request(app).delete(`/projects/${projectId}`);
            expect(res.status).toBe(200);
        });

        it('returns 404 when deleting again', async () => {
            const res = await request(app).delete(`/projects/${projectId}`);
            expect(res.status).toBe(404);
        });

        it('appears in GET /projects only until deleted', async () => {
            const before = await request(app).get('/projects');
            const ids = before.body.data.map((p: { id: number }) => p.id);
            expect(ids).not.toContain(projectId);
        });
    });


    describe('Cascade delete: tasks are removed when project is deleted', () => {
        let projectId: number;
        let taskId: number;

        beforeAll(async () => {
            const proj = await request(app)
                .post('/projects')
                .send({ name: 'CascadeProject' });
            projectId = proj.body.data.id;

            const task = await request(app)
                .post('/tasks')
                .send({ projectId, title: 'Orphan task' });
            taskId = task.body.data.id;
        });

        it('task exists before project deletion', async () => {
            const res = await request(app).get(`/tasks/${taskId}`);
            expect(res.status).toBe(200);
        });

        it('task is gone after project deletion', async () => {
            await request(app).delete(`/projects/${projectId}`);
            const res = await request(app).get(`/tasks/${taskId}`);
            expect(res.status).toBe(404);
        });
    });
});
