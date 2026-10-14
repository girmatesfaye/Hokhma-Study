import mongoose, { Schema, Document, Model } from 'mongoose';

export type Difficulty = 'beginner' | 'intermediate' | 'deep-dive';

export interface IContentSection {
  type: 'paragraph' | 'header' | 'scripture' | 'list';
  text: string;
  textAm?: string;
  level?: 2 | 3;
  items?: string[];
  itemsAm?: string[];
  reference?: string;
  referenceAm?: string;
}

export interface IFootnote {
  id: number;
  text: string;
  textAm?: string;
}

export interface IReactions {
  helpful: number;
  insightful: number;
  rigorous: number;
}

export interface IArticle extends Document {
  slug: string;
  title: string;
  titleAm?: string;
  topicSlug: string;
  difficulty: Difficulty;
  readingTime: number;
  publishDate: string;
  excerpt: string;
  excerptAm?: string;
  content: IContentSection[];
  footnotes: IFootnote[];
  tags: string[];
  featured: boolean;
  isPublished: boolean;
  commentsAllowed: boolean;
  partInPath?: {
    pathSlug: string;
    position: number;
  };
  views: number;
  reactions: IReactions;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoTitleAm?: string;
  seoDescriptionAm?: string;
  lang?: 'en' | 'am' | 'bilingual';
  createdAt: Date;
  updatedAt: Date;
}

const ContentSectionSchema = new Schema<IContentSection>(
  {
    type: {
      type: String,
      enum: ['paragraph', 'header', 'scripture', 'list'],
      required: true
    },
    text: { type: String, required: true },
    textAm: { type: String },
    level: { type: Number, enum: [2, 3] },
    items: [{ type: String }],
    itemsAm: [{ type: String }],
    reference: { type: String },
    referenceAm: { type: String }
  },
  { _id: false }
);

const FootnoteSchema = new Schema<IFootnote>(
  {
    id: { type: Number, required: true },
    text: { type: String, required: true },
    textAm: { type: String }
  },
  { _id: false }
);

const ReactionsSchema = new Schema<IReactions>(
  {
    helpful: { type: Number, default: 0 },
    insightful: { type: Number, default: 0 },
    rigorous: { type: Number, default: 0 }
  },
  { _id: false }
);

const ArticleSchema = new Schema<IArticle>(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    titleAm: { type: String, trim: true },
    topicSlug: { type: String, required: true, index: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'deep-dive'],
      default: 'beginner',
      index: true
    },
    readingTime: { type: Number, required: true, default: 5 },
    publishDate: { type: String, required: true },
    excerpt: { type: String, required: true },
    excerptAm: { type: String },
    content: { type: [ContentSectionSchema], default: [] },
    footnotes: { type: [FootnoteSchema], default: [] },
    tags: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    commentsAllowed: { type: Boolean, default: true },
    partInPath: {
      pathSlug: { type: String },
      position: { type: Number }
    },
    views: { type: Number, default: 0 },
    reactions: {
      type: ReactionsSchema,
      default: () => ({ helpful: 0, insightful: 0, rigorous: 0 })
    },
    coverImage: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoTitleAm: { type: String },
    seoDescriptionAm: { type: String },
    lang: {
      type: String,
      enum: ['en', 'am', 'bilingual'],
      default: 'en'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        return ret;
      }
    }
  }
);

// Compound text index for search
ArticleSchema.index(
  {
    title: 'text',
    excerpt: 'text',
    tags: 'text',
    titleAm: 'text'
  },
  {
    weights: {
      title: 10,
      titleAm: 10,
      tags: 5,
      excerpt: 2
    },
    name: 'ArticleTextIndex'
  }
);

export const Article: Model<IArticle> = mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);
export default Article;
