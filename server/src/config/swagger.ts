const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'TaskBoard API',
        version: '1.0.0',
        description: 'REST API for TaskBoard — a multi-project Kanban task manager.',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local dev server' }],
    tags: [
        { name: 'Projects', description: 'Project management' },
        { name: 'Tasks',    description: 'Task CRUD and filtering' },
        { name: 'Comments', description: 'Task comments' },
    ],
    components: {
        schemas: {
            Project: {
                type: 'object',
                properties: {
                    id:          { type: 'integer', example: 1 },
                    name:        { type: 'string',  example: 'My Project' },
                    description: { type: 'string',  nullable: true },
                    createdAt:   { type: 'string',  format: 'date-time' },
                    updatedAt:   { type: 'string',  format: 'date-time' },
                },
            },
            Task: {
                type: 'object',
                properties: {
                    id:          { type: 'integer', example: 7 },
                    projectId:   { type: 'integer', example: 1 },
                    title:       { type: 'string',  example: 'Write unit tests' },
                    description: { type: 'string',  nullable: true },
                    status:      { type: 'string',  enum: ['todo', 'in-progress', 'done'] },
                    priority:    { type: 'string',  enum: ['low', 'medium', 'high'], nullable: true },
                    assignee:    { type: 'string',  nullable: true },
                    createdAt:   { type: 'string',  format: 'date-time' },
                    updatedAt:   { type: 'string',  format: 'date-time' },
                },
            },
            Comment: {
                type: 'object',
                properties: {
                    id:         { type: 'integer', example: 3 },
                    taskId:     { type: 'integer', example: 7 },
                    content:    { type: 'string',  example: 'Looks good to me!' },
                    authorName: { type: 'string',  nullable: true },
                    createdAt:  { type: 'string',  format: 'date-time' },
                },
            },
            ApiResponse: {
                type: 'object',
                properties: {
                    data:  { },
                    error: { type: 'string', nullable: true },
                },
            },
            Error: {
                type: 'object',
                properties: {
                    data:  { nullable: true, example: null },
                    error: { type: 'string', example: 'Task not found' },
                },
            },
        },
    },
    paths: {
        '/projects': {
            get: {
                tags: ['Projects'],
                summary: 'List all projects',
                responses: {
                    200: { description: 'Array of projects', content: { 'application/json': { schema: { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Project' } }, error: { nullable: true } } } } } },
                },
            },
            post: {
                tags: ['Projects'],
                summary: 'Create a project',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string', maxLength: 100 }, description: { type: 'string', maxLength: 500 } } } } } },
                responses: {
                    201: { description: 'Created project', content: { 'application/json': { schema: { properties: { data: { $ref: '#/components/schemas/Project' }, error: { nullable: true } } } } } },
                    400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/projects/{id}': {
            patch: {
                tags: ['Projects'],
                summary: 'Update a project',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' } } } } } },
                responses: {
                    200: { description: 'Updated project' },
                    404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
            delete: {
                tags: ['Projects'],
                summary: 'Delete a project (cascades tasks)',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Deleted successfully' },
                    404: { description: 'Not found' },
                },
            },
        },
        '/tasks': {
            get: {
                tags: ['Tasks'],
                summary: 'List tasks for a project (paginated)',
                parameters: [
                    { in: 'query', name: 'projectId', required: true,  schema: { type: 'integer' } },
                    { in: 'query', name: 'status',    required: false, schema: { type: 'string', enum: ['todo', 'in-progress', 'done'] } },
                    { in: 'query', name: 'search',    required: false, schema: { type: 'string' } },
                    { in: 'query', name: 'page',      required: false, schema: { type: 'integer', default: 1 } },
                    { in: 'query', name: 'limit',     required: false, schema: { type: 'integer', default: 10 } },
                ],
                responses: {
                    200: { description: 'Paginated task list', content: { 'application/json': { schema: { properties: { data: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Task' } }, total: { type: 'integer' }, page: { type: 'integer' }, limit: { type: 'integer' }, totalPages: { type: 'integer' } } }, error: { nullable: true } } } } } },
                    400: { description: 'Missing projectId' },
                },
            },
            post: {
                tags: ['Tasks'],
                summary: 'Create a task',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['projectId', 'title'], properties: { projectId: { type: 'integer' }, title: { type: 'string', maxLength: 255 }, description: { type: 'string' }, status: { type: 'string', enum: ['todo', 'in-progress', 'done'] }, priority: { type: 'string', enum: ['low', 'medium', 'high'] }, assignee: { type: 'string' } } } } } },
                responses: {
                    201: { description: 'Created task' },
                    400: { description: 'Validation error' },
                },
            },
        },
        '/tasks/counts': {
            get: {
                tags: ['Tasks'],
                summary: 'Count tasks per status for a project',
                parameters: [{ in: 'query', name: 'projectId', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Counts by status', content: { 'application/json': { schema: { properties: { data: { type: 'object', example: { todo: 3, 'in-progress': 2, done: 5 } }, error: { nullable: true } } } } } },
                },
            },
        },
        '/tasks/{id}': {
            get: {
                tags: ['Tasks'],
                summary: 'Get a task by ID',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Task object' },
                    404: { description: 'Not found' },
                },
            },
            put: {
                tags: ['Tasks'],
                summary: 'Update a task',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, status: { type: 'string', enum: ['todo', 'in-progress', 'done'] }, priority: { type: 'string', enum: ['low', 'medium', 'high'] }, assignee: { type: 'string' } } } } } },
                responses: {
                    200: { description: 'Updated task' },
                    404: { description: 'Not found' },
                },
            },
            delete: {
                tags: ['Tasks'],
                summary: 'Delete a task',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Deleted' },
                    404: { description: 'Not found' },
                },
            },
        },
        '/tasks/{taskId}/comments': {
            get: {
                tags: ['Comments'],
                summary: 'List comments for a task',
                parameters: [{ in: 'path', name: 'taskId', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Array of comments' },
                },
            },
            post: {
                tags: ['Comments'],
                summary: 'Add a comment to a task',
                parameters: [{ in: 'path', name: 'taskId', required: true, schema: { type: 'integer' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['content'], properties: { content: { type: 'string', maxLength: 2000 }, authorName: { type: 'string', maxLength: 100 } } } } } },
                responses: {
                    201: { description: 'Created comment' },
                    400: { description: 'Validation error' },
                },
            },
        },
        '/tasks/{taskId}/comments/{commentId}': {
            delete: {
                tags: ['Comments'],
                summary: 'Delete a comment',
                parameters: [
                    { in: 'path', name: 'taskId',    required: true, schema: { type: 'integer' } },
                    { in: 'path', name: 'commentId', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    200: { description: 'Deleted' },
                    404: { description: 'Not found' },
                },
            },
        },
    },
};

export default swaggerSpec;
