import multer from 'multer';
import { Request } from 'express';

// Configure in-memory storage buffer for direct Cloudinary streaming or local saving
const storage = multer.memoryStorage();

// File filter restricting uploads to valid image MIME types
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF images are permitted.'));
  }
};

// Multer upload middleware configured with 5MB file size limit
export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB maximum
  },
  fileFilter
});

export default uploadMiddleware;
