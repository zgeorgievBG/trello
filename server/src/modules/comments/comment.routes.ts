import { Router } from 'express';
import * as commentController from './comment.controller';
import { validate } from '../../middleware/validate';
import { createCommentSchema } from './comment.schema';

// mergeParams gives access to :taskId from the parent router
const router = Router({ mergeParams: true });

router.get('/', commentController.getComments);
router.post('/', validate(createCommentSchema), commentController.createComment);
router.delete('/:commentId', commentController.deleteComment);

export default router;
