import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: Types.ObjectId;
  action: string;
  targetType: string;
  targetId?: Types.ObjectId;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
