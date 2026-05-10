import { Schema, model, Document, Types } from 'mongoose';

export interface IFollow extends Document {
  issueId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
}

const followSchema = new Schema<IFollow>(
  {
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

followSchema.index({ issueId: 1, userId: 1 }, { unique: true });

export const Follow = model<IFollow>('Follow', followSchema);
