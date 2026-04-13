import { Router } from 'express';
import * as projectController from './project.controller';
import { validate } from '../../middleware/validate';
import { createProjectSchema, updateProjectSchema } from './project.schema';

const router = Router();

router.get('/', projectController.getAllProjects);
router.post('/', validate(createProjectSchema), projectController.createProject);
router.patch('/:id', validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

export default router;
