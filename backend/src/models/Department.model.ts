import { Schema, model, Document, Types } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  staffIds: Types.ObjectId[];
  createdAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    staffIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export const Department = model<IDepartment>('Department', departmentSchema);
