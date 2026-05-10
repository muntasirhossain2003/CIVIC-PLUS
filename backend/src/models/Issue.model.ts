import { Schema, model, Document, Types } from 'mongoose';

export type IssueStatus = 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected';
export type IssueCategory = 'pothole' | 'streetlight' | 'garbage' | 'water' | 'drainage' | 'power' | 'other';
export type IssueSeverity = 'low' | 'medium' | 'high';

interface StatusHistoryEntry {
  status: IssueStatus;
  changedBy: Types.ObjectId;
  changedAt: Date;
  note?: string;
}

export interface IIssue extends Document {
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  location: { type: 'Point'; coordinates: [number, number] };
  address: string;
  photos: string[];
  reporterId: Types.ObjectId;
  assignedDepartmentId?: Types.ObjectId;
  assignedStaffId?: Types.ObjectId;
  upvoteCount: number;
  followerCount: number;
  duplicateClusterId?: Types.ObjectId;
  resolutionNotes?: string;
  resolutionPhotos?: string[];
  rejectionReason?: string;
  statusHistory: StatusHistoryEntry[];
  slaDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true, minlength: 5, maxlength: 100 },
    description: { type: String, required: true, minlength: 20, maxlength: 1000 },
    category: { type: String, enum: ['pothole', 'streetlight', 'garbage', 'water', 'drainage', 'power', 'other'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['submitted', 'acknowledged', 'in_progress', 'resolved', 'rejected'], default: 'submitted' },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, required: true },
    photos: [{ type: String }],
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    assignedStaffId: { type: Schema.Types.ObjectId, ref: 'User' },
    upvoteCount: { type: Number, default: 0 },
    followerCount: { type: Number, default: 0 },
    duplicateClusterId: { type: Schema.Types.ObjectId },
    resolutionNotes: String,
    resolutionPhotos: [{ type: String }],
    rejectionReason: String,
    statusHistory: [
      {
        status: String,
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    slaDeadline: Date,
  },
  { timestamps: true },
);

issueSchema.index({ location: '2dsphere' });
issueSchema.index({ status: 1, category: 1 });
issueSchema.index({ reporterId: 1, createdAt: -1 });

export const Issue = model<IIssue>('Issue', issueSchema);
