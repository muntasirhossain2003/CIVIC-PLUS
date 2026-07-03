import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { adminController } from '../controllers/admin.controller';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate, requireRole('admin'));

const updateUserSchema = z.object({
  role: z.enum(['citizen', 'staff', 'admin']).optional(),
  departmentId: z.string().optional(),
});

const deptSchema = z.object({ name: z.string().min(1).max(100) });

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slaHours: z.number().int().positive(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slaHours: z.number().int().positive().optional(),
});

// Users
router.get('/users', adminController.listUsers);
router.patch('/users/:id', validate(updateUserSchema), adminController.updateUser);

// Departments
router.get('/departments', adminController.listDepartments);
router.post('/departments', validate(deptSchema), adminController.createDepartment);
router.patch('/departments/:id', validate(deptSchema), adminController.updateDepartment);

// Categories
router.get('/categories', adminController.listCategories);
router.post('/categories', validate(createCategorySchema), adminController.createCategory);
router.patch('/categories/:id', validate(updateCategorySchema), adminController.updateCategory);

// Export
router.get('/issues/export', adminController.exportIssues);

// Audit log
router.get('/audit-logs', adminController.listAuditLogs);

export default router;
