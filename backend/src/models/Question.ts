import mongoose, { Schema, Document, Model } from 'mongoose';
import { Difficulty } from './Article.js';

export interface IQuestion extends Document {
  text: string;
  textAm?: string;
  topicSlug: string;
  difficulty: Difficulty;
  tags: string[];
  articleSlug: string;
  articleTitle: string;
  articleTitleAm?: string;
  commonScore: number;
  addedDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true, trim: true },
    textAm: { type: String, trim: true },
    topicSlug: { type: String, required: true, index: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'deep-dive'],
      default: 'beginner',
      index: true
    },
    tags: [{ type: String, trim: true }],
    articleSlug: { type: String, required: true, index: true },
    articleTitle: { type: String, required: true },
    articleTitleAm: { type: String },
    commonScore: { type: Number, default: 50, min: 0, max: 100 },
    addedDate: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

// Compound text index for questions search
QuestionSchema.index(
  {
    text: 'text',
    textAm: 'text'
  },
  {
    name: 'QuestionTextIndex'
  }
);

export const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
export default Question;
