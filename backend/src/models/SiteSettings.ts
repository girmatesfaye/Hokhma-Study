import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFaithStatement {
  doctrine: string;
  belief: string;
}

export interface IAuthorProfile {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  email: string;
  tagline: string;
  mission: string;
}

export interface ISiteSettings extends Document {
  singletonKey: string;
  profile: IAuthorProfile;
  faithStatements: IFaithStatement[];
  createdAt: Date;
  updatedAt: Date;
}

const FaithStatementSchema = new Schema<IFaithStatement>(
  {
    doctrine: { type: String, required: true },
    belief: { type: String, required: true }
  },
  { _id: false }
);

const AuthorProfileSchema = new Schema<IAuthorProfile>(
  {
    name: { type: String, required: true, default: 'Dr. Girma Tesfaye' },
    role: { type: String, required: true, default: 'Theological Scholar & Apologist' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    email: { type: String, default: '' },
    tagline: { type: String, default: '' },
    mission: { type: String, default: '' }
  },
  { _id: false }
);

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    singletonKey: {
      type: String,
      default: 'site_settings',
      unique: true,
      required: true
    },
    profile: {
      type: AuthorProfileSchema,
      required: true
    },
    faithStatements: {
      type: [FaithStatementSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
export default SiteSettings;
