import { User } from '../models/User.model';
import { Department } from '../models/Department.model';
import { Category } from '../models/Category.model';
import { AuditLog } from '../models/AuditLog.model';
import { Issue } from '../models/Issue.model';

function fail(message: string, status: number): never {
  throw Object.assign(new Error(message), { status });
}

const CSV_COLUMNS = [
  'id', 'title', 'category', 'severity', 'status', 'address',
  'lat', 'lng', 'reporterName', 'reporterEmail', 'upvoteCount',
  'createdAt', 'resolvedAt', 'slaDeadline',
] as const;

function csvEscape(value: unknown): string {
  const s = value === undefined || value === null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const adminService = {
  // ── Users ──────────────────────────────────────────────────────────
  async listUsers(page = 1, limit = 20, search?: string, role?: string, departmentId?: string) {
    const filter: Record<string, unknown> = {};
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) filter.role = role;
    if (departmentId) filter.departmentId = departmentId;

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

  // ── Export ─────────────────────────────────────────────────────────
  async exportIssuesCsv(filter: { status?: string; category?: string }) {
    const query: Record<string, unknown> = {};
    if (filter.status) query.status = filter.status;
    if (filter.category) query.category = filter.category;

    const issues = await Issue.find(query)
      .populate('reporterId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const rows = issues.map((i) => {
      const reporter = i.reporterId as unknown as { name?: string; email?: string } | null;
      const resolvedAt = i.statusHistory?.find((h) => h.status === 'resolved')?.changedAt;
      return [
        String(i._id),
        i.title,
        i.category,
        i.severity,
        i.status,
        i.address,
        i.location?.coordinates?.[1] ?? '',
        i.location?.coordinates?.[0] ?? '',
        reporter?.name ?? '',
        reporter?.email ?? '',
        i.upvoteCount,
        i.createdAt.toISOString(),
        resolvedAt ? new Date(resolvedAt).toISOString() : '',
        i.slaDeadline ? new Date(i.slaDeadline).toISOString() : '',
      ];
    });

    const header = CSV_COLUMNS.join(',');
    const body = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
    return `${header}\n${body}\n`;
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
