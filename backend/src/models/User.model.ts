import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: 'citizen' | 'staff' | 'admin';
  departmentId?: Types.ObjectId;
  emailVerified: boolean;
  emailVerifyToken?: string;
  emailVerifyExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshTokenHash?: string;
  notificationPrefs: { email: boolean; inApp: boolean };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['citizen', 'staff', 'admin'], default: 'citizen' },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: String,
    emailVerifyExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshTokenHash: String,
    notificationPrefs: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
