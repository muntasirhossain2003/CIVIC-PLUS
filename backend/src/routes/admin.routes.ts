import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, requireRole('admin'));

// Users
router.get('/users', (req, res) => { res.status(501).json({ message: 'Not implemented yet' }); });
router.patch('/users/:id', (req, res) => { res.status(501).json({ message: 'Not implemented yet' }); });

// Departments
router.get('/departments', (req, res) => { res.status(501).json({ message: 'Not implemented yet' }); });
router.post('/departments', (req, res) => { res.status(501).json({ message: 'Not implemented yet' }); });
router.patch('/departments/:id', (req, res) => { res.status(501).json({ message: 'Not implemented yet' }); });

// Categories
router.get('/categories', (req, res) => { res.status(501).json({ message: 'Not implemented yet' }); });
router.post('/categories', (req, res) => { res.status(501).json({ message: 'Not implemented yet' }); });
router.patch('/categories/:id', (req, res) => { res.status(501).json({ message: 'Not implemented yet' }); });

// Audit log
router.get('/audit-logs', (req, res) => { res.status(501).json({ message: 'Not implemented yet' }); });

export default router;
