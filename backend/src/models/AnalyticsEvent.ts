import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  eventId: string;
  type: 'page_view';
  path: string;
  articleId?: string;
  sessionId: string;
  visitorId?: string;
  referrerHost?: string;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: ['page_view'],
      required: true,
      default: 'page_view'
    },
    path: {
      type: String,
      required: true,
      trim: true
    },
    articleId: {
      type: String,
      trim: true
    },
    sessionId: {
      type: String,
      required: true,
      trim: true
    },
    visitorId: {
      type: String,
      trim: true
    },
    referrerHost: {
      type: String,
      trim: true,
      default: 'direct'
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Reporting query indexes
AnalyticsEventSchema.index({ occurredAt: 1 });
AnalyticsEventSchema.index({ path: 1, occurredAt: 1 });

// 90-day TTL index for automated data pruning
AnalyticsEventSchema.index(
  { occurredAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60, name: 'AnalyticsTtlIndex' }
);

export const AnalyticsEvent: Model<IAnalyticsEvent> =
  mongoose.models.AnalyticsEvent ||
  mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);
export default AnalyticsEvent;
