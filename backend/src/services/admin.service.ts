import { User } from '../models/User.model';
import { Department } from '../models/Department.model';
import { Category } from '../models/Category.model';
import { AuditLog } from '../models/AuditLog.model';

function fail(message: string, status: number): never {
  throw Object.assign(new Error(message), { status });
}

export const adminService = {
  // ── Users ──────────────────────────────────────────────────────────
  async listUsers(page = 1, limit = 20, search?: string) {
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};
    const [data, total] = await Promise.all([
      User.find(filter).skip((page - 1) * limit).limit(limit).select('-__v').lean(),
      User.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async updateUser(id: string, updates: { role?: string; departmentId?: string }, actorId: string) {
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-__v');
    if (!user) fail('User not found', 404);
    await AuditLog.create({ actorId, action: 'update_user', targetType: 'User', targetId: id, meta: updates });
    return user;
  },

  // ── Departments ────────────────────────────────────────────────────
  async listDepartments() {
    return Department.find().lean();
  },

  async createDepartment(name: string, actorId: string) {
    const dept = await Department.create({ name });
    await AuditLog.create({ actorId, action: 'create_department', targetType: 'Department', targetId: dept._id });
    return dept;
  },

  async updateDepartment(id: string, name: string, actorId: string) {
    const dept = await Department.findByIdAndUpdate(id, { name }, { new: true });
    if (!dept) fail('Department not found', 404);
    await AuditLog.create({ actorId, action: 'update_department', targetType: 'Department', targetId: id });
    return dept;
  },

  // ── Categories (SLA config) ────────────────────────────────────────
  async listCategories() {
    return Category.find().lean();
  },

  async createCategory(name: string, slaHours: number, actorId: string) {
    const cat = await Category.create({ name, slaHours });
    await AuditLog.create({ actorId, action: 'create_category', targetType: 'Category', targetId: cat._id });
    return cat;
  },

  async updateCategory(id: string, updates: { name?: string; slaHours?: number }, actorId: string) {
    const cat = await Category.findByIdAndUpdate(id, updates, { new: true });
    if (!cat) fail('Category not found', 404);
    await AuditLog.create({ actorId, action: 'update_category', targetType: 'Category', targetId: id });
    return cat;
  },

  // ── Audit log ─────────────────────────────────────────────────────
  async listAuditLogs(page = 1, limit = 50) {
    const [data, total] = await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('actorId', 'name email')
        .lean(),
      AuditLog.countDocuments(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};
