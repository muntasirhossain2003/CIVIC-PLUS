import { Issue, IssueStatus } from '../models/Issue.model';
import { Comment } from '../models/Comment.model';
import { Upvote } from '../models/Upvote.model';
import { Follow } from '../models/Follow.model';
import { Category } from '../models/Category.model';
import {
  CreateIssueInput, UpdateIssueInput, UpdateStatusInput,
  ListIssuesInput, NearbyInput, AddCommentInput, AssignIssueInput,
} from '../schemas/issue.schema';
import { emitIssueNew, emitStatusChanged, emitNotification } from '../socket/events';

function fail(message: string, status: number): never {
  throw Object.assign(new Error(message), { status });
}

export const issueService = {
  async create(input: CreateIssueInput, reporterId: string) {
    // Look up SLA deadline from category config
    const cat = await Category.findOne({ name: input.category });
    const slaHours = cat?.slaHours ?? 72;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const issue = await Issue.create({
      ...input,
      reporterId,
      slaDeadline,
      statusHistory: [{ status: 'submitted', changedBy: reporterId, changedAt: new Date() }],
    });

    emitIssueNew(issue.toObject());
    return issue;
  },

  async list(input: ListIssuesInput, requesterId?: string) {
    const filter: Record<string, unknown> = {};

    if (input.status)   filter.status   = input.status;
    if (input.category) filter.category = input.category;
    if (input.severity) filter.severity = input.severity;
    if (input.mine && requesterId) filter.reporterId = requesterId;
    if (input.search) {
      filter.$or = [
        { title:       { $regex: input.search, $options: 'i' } },
        { description: { $regex: input.search, $options: 'i' } },
      ];
    }

    const sortMap: Record<string, [string, 1 | -1][]> = {
      newest:       [['createdAt', -1]],
      oldest:       [['createdAt',  1]],
      most_upvoted: [['upvoteCount', -1]],
      nearest:      [['createdAt', -1]],
    };

    const skip  = (input.page - 1) * input.limit;
    const [data, total] = await Promise.all([
      Issue.find(filter)
        .sort(sortMap[input.sort])
        .skip(skip)
        .limit(input.limit)
        .populate('reporterId', 'name')
        .lean(),
      Issue.countDocuments(filter),
    ]);

    return { data, total, page: input.page, limit: input.limit, totalPages: Math.ceil(total / input.limit) };
  },

  async nearby(input: NearbyInput) {
    const filter: Record<string, unknown> = {
      location: {
        $near: {
          $geometry:   { type: 'Point', coordinates: [input.lng, input.lat] },
          $maxDistance: input.radius,
        },
      },
      status: { $in: ['submitted', 'acknowledged', 'in_progress'] },
      // Only flag duplicates reported in the last 30 days
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    };

    if (input.category) filter.category = input.category;

    return Issue.find(filter).limit(5).lean();
  },

  async getById(id: string) {
    const issue = await Issue.findById(id)
      .populate('reporterId', 'name email')
      .populate('assignedStaffId', 'name')
      .populate('assignedDepartmentId', 'name')
      .lean();

    if (!issue) fail('Issue not found', 404);
    return issue;
  },

  async update(id: string, input: UpdateIssueInput, requesterId: string) {
    const issue = await Issue.findById(id);
    if (!issue) fail('Issue not found', 404);
    if (issue.reporterId.toString() !== requesterId) fail('Forbidden', 403);
    if (issue.status !== 'submitted') fail('Cannot edit an issue that is no longer in submitted status', 400);

    const ONE_HOUR = 60 * 60 * 1000;
    if (Date.now() - issue.createdAt.getTime() > ONE_HOUR) fail('Edit window has expired (1 hour)', 400);

    Object.assign(issue, input);
    await issue.save();
    return issue;
  },

  async delete(id: string, requesterId: string, requesterRole: string) {
    const issue = await Issue.findById(id);
    if (!issue) fail('Issue not found', 404);

    const isOwner = issue.reporterId.toString() === requesterId;
    const isAdmin = requesterRole === 'admin';

    if (!isAdmin && !isOwner) fail('Forbidden', 403);

    if (!isAdmin) {
      if (issue.status !== 'submitted') fail('Cannot delete an issue that is no longer submitted', 400);
      const ONE_HOUR = 60 * 60 * 1000;
      if (Date.now() - issue.createdAt.getTime() > ONE_HOUR) fail('Delete window has expired (1 hour)', 400);
    }

    await issue.deleteOne();
    return { message: 'Issue deleted' };
  },

  async updateStatus(id: string, input: UpdateStatusInput, actorId: string) {
    const issue = await Issue.findById(id);
    if (!issue) fail('Issue not found', 404);

    if (input.status === 'resolved' && !input.resolutionNotes) {
      fail('Resolution notes are required when resolving an issue', 400);
    }
    if (input.status === 'rejected' && !input.rejectionReason) {
      fail('Rejection reason is required when rejecting an issue', 400);
    }

    issue.status = input.status as IssueStatus;
    issue.statusHistory.push({ status: input.status as IssueStatus, changedBy: actorId as any, changedAt: new Date(), note: input.note });

    if (input.resolutionNotes) issue.resolutionNotes = input.resolutionNotes;
    if (input.rejectionReason) issue.rejectionReason = input.rejectionReason;

    await issue.save();

    // Broadcast to all clients and notify every follower
    emitStatusChanged(id, input.status);
    const followers = await Follow.find({ issueId: id }).lean();
    for (const f of followers) {
      emitNotification(f.userId.toString(), {
        type: 'status_changed',
        issueId: id,
        issueTitle: issue.title,
        newStatus: input.status,
      });
    }

    return issue;
  },

  async assign(id: string, input: AssignIssueInput, actorId: string) {
    const issue = await Issue.findById(id);
    if (!issue) fail('Issue not found', 404);

    if (input.departmentId) issue.assignedDepartmentId = input.departmentId as any;
    if (input.staffId !== undefined) issue.assignedStaffId = (input.staffId ?? undefined) as any;

    // Assigning triages a fresh report into the queue
    if (issue.status === 'submitted') {
      issue.status = 'acknowledged';
      issue.statusHistory.push({ status: 'acknowledged', changedBy: actorId as any, changedAt: new Date(), note: 'Assigned' });
      emitStatusChanged(id, 'acknowledged');
    }

    await issue.save();

    if (input.staffId) {
      emitNotification(input.staffId, {
        type: 'issue_assigned',
        issueId: id,
        issueTitle: issue.title,
      });
    }

    return issue.populate(['assignedDepartmentId', 'assignedStaffId']);
  },

  async upvote(issueId: string, userId: string) {
    const existing = await Upvote.findOne({ issueId, userId });
    if (existing) {
      await existing.deleteOne();
      await Issue.findByIdAndUpdate(issueId, { $inc: { upvoteCount: -1 } });
      return { upvoted: false };
    }
    await Upvote.create({ issueId, userId });
    await Issue.findByIdAndUpdate(issueId, { $inc: { upvoteCount: 1 } });
    return { upvoted: true };
  },

  async follow(issueId: string, userId: string) {
    const existing = await Follow.findOne({ issueId, userId });
    if (existing) {
      await existing.deleteOne();
      await Issue.findByIdAndUpdate(issueId, { $inc: { followerCount: -1 } });
      return { following: false };
    }
    await Follow.create({ issueId, userId });
    await Issue.findByIdAndUpdate(issueId, { $inc: { followerCount: 1 } });
    return { following: true };
  },

  async addComment(issueId: string, input: AddCommentInput, authorId: string) {
    const issue = await Issue.findById(issueId);
    if (!issue) fail('Issue not found', 404);

    const comment = await Comment.create({ issueId, authorId, text: input.text });
    return comment.populate('authorId', 'name');
  },

  async getComments(issueId: string) {
    return Comment.find({ issueId })
      .populate('authorId', 'name')
      .sort({ createdAt: 1 })
      .lean();
  },
};
