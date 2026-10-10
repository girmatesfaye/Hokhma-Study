import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Handle image upload with Cloudinary streaming and local filesystem fallback
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No image file provided in upload request.' });
      return;
    }

    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

    // Use Cloudinary cloud storage if API credentials are provided
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true
      });

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'hokhma_study/covers',
          resource_type: 'image'
        },
        (error, result) => {
          if (error || !result) {
            console.error('[Cloudinary Error]:', error);
            res.status(500).json({ message: 'Cloudinary upload failed.', error: error?.message });
            return;
          }
          res.status(200).json({ url: result.secure_url });
        }
      );

      uploadStream.end(req.file.buffer);
      return;
    }

    // Local filesystem fallback when Cloudinary is not configured in local environment
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileExt = path.extname(req.file.originalname) || '.jpg';
    const cleanBaseName = path
      .basename(req.file.originalname, fileExt)
      .replace(/[^a-zA-Z0-9-_]/g, '-');
    const fileName = `${Date.now()}-${cleanBaseName}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.promises.writeFile(filePath, req.file.buffer);

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${fileName}`;

    res.status(200).json({ url: fileUrl });
  } catch (error) {
    const err = error as Error;
    console.error('[Upload Error]:', err.message);
    res.status(500).json({ message: 'Failed to process file upload.', error: err.message });
  }
};
