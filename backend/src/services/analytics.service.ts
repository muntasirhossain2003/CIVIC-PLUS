import { Issue } from '../models/Issue.model';
import { User } from '../models/User.model';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const since30d = () => new Date(Date.now() - THIRTY_DAYS);

export const analyticsService = {
  async publicStats() {
    const since = since30d();

    const [total, resolved, pending, avgResolutionMs, byCategory, recentTrend] = await Promise.all([
      Issue.countDocuments({ createdAt: { $gte: since } }),

      Issue.countDocuments({ status: 'resolved', createdAt: { $gte: since } }),

      Issue.countDocuments({ status: { $in: ['submitted', 'acknowledged', 'in_progress'] }, createdAt: { $gte: since } }),

      // Average resolution time in ms (submitted → resolved)
      Issue.aggregate([
        { $match: { status: 'resolved', createdAt: { $gte: since } } },
        { $project: { duration: { $subtract: ['$updatedAt', '$createdAt'] } } },
        { $group: { _id: null, avg: { $avg: '$duration' } } },
      ]),

      // Issues count by category
      Issue.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$category', count: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } } } },
        { $sort: { count: -1 } },
      ]),

      // 14-day daily trend: reported vs resolved
      Issue.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            reported: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const avgResolutionHours = avgResolutionMs[0]
      ? Math.round(avgResolutionMs[0].avg / (1000 * 60 * 60))
      : null;

    return { total, resolved, pending, avgResolutionHours, byCategory, recentTrend };
  },

  async adminStats() {
    const since = since30d();

    const [publicData, totalUsers, overdueCount, byStatus, byDepartment, userGrowth, topReporters] = await Promise.all([
      analyticsService.publicStats(),

      User.countDocuments(),

      // Issues past their SLA deadline and not resolved
      Issue.countDocuments({
        status: { $in: ['submitted', 'acknowledged', 'in_progress'] },
        slaDeadline: { $lt: new Date() },
      }),

      // Full status breakdown
      Issue.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Issues per department
      Issue.aggregate([
        { $match: { assignedDepartmentId: { $exists: true } } },
        { $group: { _id: '$assignedDepartmentId', count: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
        { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$dept.name', count: 1, resolved: 1 } },
        { $sort: { count: -1 } },
      ]),

      // New users per day (last 14 days)
      User.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Top 5 reporters (last 30 days)
      Issue.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$reporterId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { name: '$user.name', count: 1 } },
      ]),
    ]);

    // Reshape aggregation arrays into the maps the admin dashboard UI consumes.
    // recentTrend/byCategory (from publicData) already use the { _id, ... } shape TrendChart/CategoryChart expect.
    const issuesByStatus = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
    const issuesByCategory = Object.fromEntries(publicData.byCategory.map((c) => [c._id, c.count]));

    return {
      ...publicData,
      totalUsers,
      totalIssues: publicData.total,
      resolvedIssues: publicData.resolved,
      issuesByStatus,
      issuesByCategory,
      overdueCount,
      byStatus,
      byDepartment,
      userGrowth,
      topReporters,
    };
  },
};
