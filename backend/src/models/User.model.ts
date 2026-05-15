import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  cognitoSub: string;         // Cognito user UUID — primary link to Cognito
  name: string;
  email: string;
  phone?: string;
  role: 'citizen' | 'staff' | 'admin';
  departmentId?: Types.ObjectId;
  notificationPrefs: { email: boolean; inApp: boolean };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    cognitoSub: { type: String, required: true, unique: true },
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:      { type: String },
    role:       { type: String, enum: ['citizen', 'staff', 'admin'], default: 'citizen' },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    notificationPrefs: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
