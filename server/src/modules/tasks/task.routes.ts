import { Router } from 'express';
import * as taskController from './task.controller';
import { validate } from '../../middleware/validate';
import { createTaskSchema, updateTaskSchema } from './task.schema';
import commentRouter from '../comments/comment.routes';

const router = Router();

router.get('/', taskController.getAllTasks);
router.get('/counts', taskController.getTaskCounts);
router.get('/:id', taskController.getTaskById);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

router.use('/:taskId/comments', commentRouter);

export default router;
