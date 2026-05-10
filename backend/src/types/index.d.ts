import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'citizen' | 'staff' | 'admin';
    departmentId?: string;
  };
}
