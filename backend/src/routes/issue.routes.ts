import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate';
import { apiLimiter } from '../middleware/rateLimiter';
import { issueController } from '../controllers/issue.controller';
import { createIssueSchema, updateIssueSchema, updateStatusSchema, addCommentSchema, assignIssueSchema } from '../schemas/issue.schema';

const router = Router();

router.use(apiLimiter);

// Public
router.get('/',        issueController.list);
router.get('/nearby',  issueController.nearby);
router.get('/:id',     issueController.getById);
router.get('/:id/comments', issueController.getComments);

// Citizen (authenticated)
router.post('/',                    authenticate, validate(createIssueSchema),  issueController.create);
router.patch('/:id',                authenticate, validate(updateIssueSchema),  issueController.update);
router.delete('/:id',               authenticate,                               issueController.delete);
router.post('/:id/upvote',          authenticate,                               issueController.upvote);
router.post('/:id/follow',          authenticate,                               issueController.follow);
router.post('/:id/comments',        authenticate, validate(addCommentSchema),   issueController.addComment);

// Staff / Admin only
router.patch('/:id/status', authenticate, requireRole('staff', 'admin'), validate(updateStatusSchema), issueController.updateStatus);
router.patch('/:id/assign', authenticate, requireRole('staff', 'admin'), validate(assignIssueSchema), issueController.assign);

export default router;
