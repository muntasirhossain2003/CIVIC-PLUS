import { Schema, model, Document, Types } from 'mongoose';

export interface IUpvote extends Document {
  issueId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
}

const upvoteSchema = new Schema<IUpvote>(
  {
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

upvoteSchema.index({ issueId: 1, userId: 1 }, { unique: true });

export const Upvote = model<IUpvote>('Upvote', upvoteSchema);
