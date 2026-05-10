import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType = 'status_change' | 'comment' | 'acknowledged' | 'resolved' | 'rejected';

export interface INotification extends Document {
  userId: Types.ObjectId;
  issueId: Types.ObjectId;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    type: { type: String, enum: ['status_change', 'comment', 'acknowledged', 'resolved', 'rejected'], required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
