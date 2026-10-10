import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    submittedAt: {
      type: String,
      default: () => new Date().toISOString()
    },
    isRead: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: true
  }
);

export const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
export default ContactMessage;
