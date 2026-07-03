import { Response } from 'express';
import { adminService } from '../services/admin.service';
import { AuthRequest } from '../types/index.d';

function handleError(res: Response, err: unknown) {
  const e = err as Error & { status?: number };
  res.status(e.status ?? 500).json({ message: e.message ?? 'Internal server error' });
}

export const adminController = {
  // ── Users ──────────────────────────────────────────────────────────
  async listUsers(req: AuthRequest, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const role = req.query.role as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;
      const result = await adminService.listUsers(page, limit, search, role, departmentId);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },

  async updateUser(req: AuthRequest, res: Response) {
    try {
      const user = await adminService.updateUser(req.params.id, req.body, req.user!.id);
      res.json(user);
    } catch (err) { handleError(res, err); }
  },

  // ── Departments ────────────────────────────────────────────────────
  async listDepartments(req: AuthRequest, res: Response) {
    try {
      const data = await adminService.listDepartments();
      res.json(data);
    } catch (err) { handleError(res, err); }
  },

  async createDepartment(req: AuthRequest, res: Response) {
    try {
      const dept = await adminService.createDepartment(req.body.name, req.user!.id);
      res.status(201).json(dept);
    } catch (err) { handleError(res, err); }
  },

  async updateDepartment(req: AuthRequest, res: Response) {
    try {
      const dept = await adminService.updateDepartment(req.params.id, req.body.name, req.user!.id);
      res.json(dept);
    } catch (err) { handleError(res, err); }
  },

  // ── Categories ────────────────────────────────────────────────────
  async listCategories(req: AuthRequest, res: Response) {
    try {
      const data = await adminService.listCategories();
      res.json(data);
    } catch (err) { handleError(res, err); }
  },

  async createCategory(req: AuthRequest, res: Response) {
    try {
      const cat = await adminService.createCategory(req.body.name, req.body.slaHours, req.user!.id);
      res.status(201).json(cat);
    } catch (err) { handleError(res, err); }
  },

  async updateCategory(req: AuthRequest, res: Response) {
    try {
      const cat = await adminService.updateCategory(req.params.id, req.body, req.user!.id);
      res.json(cat);
    } catch (err) { handleError(res, err); }
  },

  // ── Export ─────────────────────────────────────────────────────────
  async exportIssues(req: AuthRequest, res: Response) {
    try {
      const status = req.query.status as string | undefined;
      const category = req.query.category as string | undefined;
      const csv = await adminService.exportIssuesCsv({ status, category });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="issues-${Date.now()}.csv"`);
      res.send(csv);
    } catch (err) { handleError(res, err); }
  },

  // ── Audit log ─────────────────────────────────────────────────────
  async listAuditLogs(req: AuthRequest, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const result = await adminService.listAuditLogs(page, limit);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },
};
