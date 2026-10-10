import mongoose, { Schema, Document, Model } from 'mongoose';

export type ResourceCategory = 'Books' | 'Websites' | 'Podcasts' | 'Videos';

export interface IResource extends Document {
  category: ResourceCategory;
  categoryAm?: string;
  title: string;
  titleAm?: string;
  author: string;
  authorAm?: string;
  description: string;
  descriptionAm?: string;
  link: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    category: {
      type: String,
      enum: ['Books', 'Websites', 'Podcasts', 'Videos'],
      required: true,
      index: true
    },
    categoryAm: { type: String },
    title: { type: String, required: true, trim: true },
    titleAm: { type: String, trim: true },
    author: { type: String, required: true, trim: true },
    authorAm: { type: String, trim: true },
    description: { type: String, required: true },
    descriptionAm: { type: String },
    link: { type: String, required: true, trim: true }
  },
  {
    timestamps: true
  }
);

export const Resource: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
export default Resource;
