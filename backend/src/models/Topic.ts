import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITopic extends Document {
  slug: string;
  name: string;
  nameAm?: string;
  description: string;
  descriptionAm?: string;
  articleCount: number;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    nameAm: { type: String, trim: true },
    description: { type: String, required: true },
    descriptionAm: { type: String },
    articleCount: { type: Number, default: 0 },
    icon: { type: String, required: true, default: 'BookOpen' }
  },
  {
    timestamps: true
  }
);

// Text index for topics search
TopicSchema.index(
  {
    name: 'text',
    description: 'text',
    nameAm: 'text'
  },
  {
    name: 'TopicTextIndex'
  }
);

export const Topic: Model<ITopic> = mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);
export default Topic;
