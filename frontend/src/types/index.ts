export type IssueStatus = 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected';
export type IssueCategory = 'pothole' | 'streetlight' | 'garbage' | 'water' | 'drainage' | 'power' | 'other';
export type IssueSeverity = 'low' | 'medium' | 'high';
export type UserRole = 'citizen' | 'staff' | 'admin';

export interface StatusHistoryEntry {
  status: IssueStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  location: { type: 'Point'; coordinates: [number, number] };
  address: string;
  photos: string[];
  reporterId: string;
  assignedDepartmentId?: string;
  assignedStaffId?: string;
  upvoteCount: number;
  followerCount: number;
  duplicateClusterId?: string;
  resolutionNotes?: string;
  resolutionPhotos?: string[];
  rejectionReason?: string;
  statusHistory: StatusHistoryEntry[];
  slaDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  departmentId?: string;
  emailVerified: boolean;
  notificationPrefs: { email: boolean; inApp: boolean };
  createdAt: string;
}

export interface Comment {
  _id: string;
  issueId: string;
  authorId: User;
  text: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  issueId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
