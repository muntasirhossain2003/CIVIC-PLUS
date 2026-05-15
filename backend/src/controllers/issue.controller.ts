import { Request, Response } from 'express';
import { issueService } from '../services/issue.service';
import { AuthRequest } from '../types/index.d';
import { listIssuesSchema, nearbySchema } from '../schemas/issue.schema';

function handleError(res: Response, err: unknown) {
  const e = err as Error & { status?: number };
  res.status(e.status ?? 500).json({ message: e.message ?? 'Internal server error' });
}

export const issueController = {
  async list(req: Request, res: Response) {
    try {
      const query = listIssuesSchema.safeParse(req.query);
      if (!query.success) { res.status(422).json({ errors: query.error.flatten().fieldErrors }); return; }
      const userId = (req as AuthRequest).user?.id;
      const result = await issueService.list(query.data, userId);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },

  async nearby(req: Request, res: Response) {
    try {
      const query = nearbySchema.safeParse(req.query);
      if (!query.success) { res.status(422).json({ errors: query.error.flatten().fieldErrors }); return; }
      const result = await issueService.nearby(query.data);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },

  async getById(req: Request, res: Response) {
    try {
      const issue = await issueService.getById(req.params.id);
      res.json(issue);
    } catch (err) { handleError(res, err); }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const issue = await issueService.create(req.body, req.user!.id);
      res.status(201).json(issue);
    } catch (err) { handleError(res, err); }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const issue = await issueService.update(req.params.id, req.body, req.user!.id);
      res.json(issue);
    } catch (err) { handleError(res, err); }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await issueService.delete(req.params.id, req.user!.id, req.user!.role);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const issue = await issueService.updateStatus(req.params.id, req.body, req.user!.id);
      res.json(issue);
    } catch (err) { handleError(res, err); }
  },

  async upvote(req: AuthRequest, res: Response) {
    try {
      const result = await issueService.upvote(req.params.id, req.user!.id);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },

  async follow(req: AuthRequest, res: Response) {
    try {
      const result = await issueService.follow(req.params.id, req.user!.id);
      res.json(result);
    } catch (err) { handleError(res, err); }
  },

  async addComment(req: AuthRequest, res: Response) {
    try {
      const comment = await issueService.addComment(req.params.id, req.body, req.user!.id);
      res.status(201).json(comment);
    } catch (err) { handleError(res, err); }
  },

  async getComments(req: Request, res: Response) {
    try {
      const comments = await issueService.getComments(req.params.id);
      res.json(comments);
    } catch (err) { handleError(res, err); }
  },
};
