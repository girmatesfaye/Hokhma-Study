import mongoose, { Schema } from 'mongoose';

// Register global toJSON plugin to normalize _id to id across all schemas
mongoose.plugin((schema: Schema) => {
  schema.set('toJSON', {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, any>) => {
      if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
      }
      delete ret.__v;
      return ret;
    }
  });
});

export const connectDB = async (): Promise<typeof mongoose | undefined> => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hokhma_study';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const err = error as Error;
    console.error(`[Database Error] Failed to connect to MongoDB: ${err.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
