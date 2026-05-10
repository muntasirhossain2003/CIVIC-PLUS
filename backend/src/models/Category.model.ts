import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slaHours: number;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slaHours: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

export const Category = model<ICategory>('Category', categorySchema);
