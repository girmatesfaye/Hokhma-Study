import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  articleSlug: string;
  authorName: string;
  text: string;
  timestamp: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    articleSlug: { type: String, required: true, index: true },
    authorName: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    timestamp: {
      type: String,
      default: () => new Date().toISOString()
    },
    isApproved: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: true
  }
);

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
export default Comment;
