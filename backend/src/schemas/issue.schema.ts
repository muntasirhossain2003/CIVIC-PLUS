import { z } from 'zod';

const CATEGORIES = ['pothole', 'streetlight', 'garbage', 'water', 'drainage', 'power', 'other'] as const;
const SEVERITIES = ['low', 'medium', 'high'] as const;
const STATUSES   = ['submitted', 'acknowledged', 'in_progress', 'resolved', 'rejected'] as const;

export const createIssueSchema = z.object({
  title:       z.string().trim().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(1000),
  category:    z.enum(CATEGORIES),
  severity:    z.enum(SEVERITIES).default('medium'),
  address:     z.string().trim().min(1, 'Address is required'),
  location: z.object({
    type:        z.literal('Point'),
    coordinates: z.tuple([
      z.number().min(-180).max(180),  // longitude
      z.number().min(-90).max(90),    // latitude
    ]),
  }),
  photos: z.array(z.string()).max(3, 'Maximum 3 photos').default([]),
});

export const updateIssueSchema = z.object({
  title:       z.string().trim().min(5).max(100).optional(),
  description: z.string().trim().min(20).max(1000).optional(),
  photos:      z.array(z.string()).max(3).optional(),
});

export const updateStatusSchema = z.object({
  status:          z.enum(STATUSES),
  note:            z.string().trim().max(500).optional(),
  resolutionNotes: z.string().trim().min(20).max(1000).optional(),
  rejectionReason: z.string().trim().min(5).max(500).optional(),
});

export const listIssuesSchema = z.object({
  status:   z.enum(STATUSES).optional(),
  category: z.enum(CATEGORIES).optional(),
  severity: z.enum(SEVERITIES).optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
  search:   z.string().trim().optional(),
  sort:     z.enum(['newest', 'oldest', 'most_upvoted', 'nearest']).default('newest'),
  mine:     z.coerce.boolean().default(false),
});

export const nearbySchema = z.object({
  lng:      z.coerce.number().min(-180).max(180),
  lat:      z.coerce.number().min(-90).max(90),
  radius:   z.coerce.number().min(1).max(5000).default(50),  // metres
  category: z.enum(CATEGORIES).optional(),
});

export const addCommentSchema = z.object({
  text: z.string().trim().min(1).max(500),
});

export const presignedUrlSchema = z.object({
  filename:    z.string().min(1),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

export type CreateIssueInput  = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput  = z.infer<typeof updateIssueSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ListIssuesInput   = z.infer<typeof listIssuesSchema>;
export type NearbyInput       = z.infer<typeof nearbySchema>;
export type AddCommentInput   = z.infer<typeof addCommentSchema>;
export type PresignedUrlInput = z.infer<typeof presignedUrlSchema>;
