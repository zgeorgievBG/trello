import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/errorHandler';
import taskRouter from './modules/tasks/task.routes';
import projectRouter from './modules/projects/project.routes';
import swaggerSpec from './config/swagger';

const app = express();

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { data: null, error: 'Too many requests, please try again later.' },
});
app.use(limiter);

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/projects', projectRouter);
app.use('/tasks', taskRouter);

app.use(errorHandler);

export default app;
