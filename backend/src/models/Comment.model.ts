import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  issueId: Types.ObjectId;
  authorId: Types.ObjectId;
  text: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true },
);

commentSchema.index({ issueId: 1, createdAt: 1 });

export const Comment = model<IComment>('Comment', commentSchema);
