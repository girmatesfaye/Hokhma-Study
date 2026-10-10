import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILearningPathStep {
  id?: string;
  level: number;
  title: string;
  titleAm?: string;
  purpose: string;
  purposeAm?: string;
  type: 'article' | 'resource' | 'milestone';
  articleSlug?: string;
  resourceId?: string;
  externalTitle?: string;
  externalUrl?: string;
}

export interface ILearningPath extends Document {
  slug: string;
  title: string;
  titleAm?: string;
  description: string;
  descriptionAm?: string;
  goal: string;
  goalAm?: string;
  articleCount: number;
  difficultyRange: string;
  difficultyRangeAm?: string;
  totalReadingTime: number;
  articleSlugs: string[];
  steps: ILearningPathStep[];
  createdAt: Date;
  updatedAt: Date;
}

const LearningPathStepSchema = new Schema<ILearningPathStep>(
  {
    id: { type: String },
    level: { type: Number, required: true },
    title: { type: String, required: true },
    titleAm: { type: String },
    purpose: { type: String, required: true },
    purposeAm: { type: String },
    type: {
      type: String,
      enum: ['article', 'resource', 'milestone'],
      required: true
    },
    articleSlug: { type: String },
    resourceId: { type: String },
    externalTitle: { type: String },
    externalUrl: { type: String }
  },
  { _id: false }
);

const LearningPathSchema = new Schema<ILearningPath>(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    titleAm: { type: String, trim: true },
    description: { type: String, required: true },
    descriptionAm: { type: String },
    goal: { type: String, required: true },
    goalAm: { type: String },
    articleCount: { type: Number, default: 0 },
    difficultyRange: { type: String, default: 'Beginner to Deep Dive' },
    difficultyRangeAm: { type: String },
    totalReadingTime: { type: Number, default: 0 },
    articleSlugs: [{ type: String }],
    steps: { type: [LearningPathStepSchema], default: [] }
  },
  {
    timestamps: true
  }
);

export const LearningPath: Model<ILearningPath> =
  mongoose.models.LearningPath || mongoose.model<ILearningPath>('LearningPath', LearningPathSchema);
export default LearningPath;
