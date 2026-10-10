import mongoose, { Schema, Document, Model } from 'mongoose';

export type SubmissionStatus = 'pending' | 'reviewed';

export interface IQuestionSubmission extends Document {
  text: string;
  submittedAt: string;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSubmissionSchema = new Schema<IQuestionSubmission>(
  {
    text: { type: String, required: true, trim: true },
    submittedAt: {
      type: String,
      default: () => new Date().toISOString()
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed'],
      default: 'pending',
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const QuestionSubmission: Model<IQuestionSubmission> =
  mongoose.models.QuestionSubmission ||
  mongoose.model<IQuestionSubmission>('QuestionSubmission', QuestionSubmissionSchema);
export default QuestionSubmission;
