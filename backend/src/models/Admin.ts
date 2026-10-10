import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure passwordHash is never leaked in JSON serialization
AdminSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc: unknown, ret: Record<string, any>) => {
    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
    }
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

export const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
export default Admin;
