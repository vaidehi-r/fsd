import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Allowed MIME types for image uploads
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Create a multer upload instance for a specific Cloudinary folder.
 */
const createUploader = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `motolease/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed.'), false);
      }
    },
  });
};

// Car image uploader (up to 8 images)
export const uploadCarImages = createUploader('cars').array('images', 8);

// Avatar uploader (single image)
export const uploadAvatar = createUploader('avatars').single('avatar');

// Owner document uploader (license + govt ID)
export const uploadOwnerDocs = createUploader('owner-docs').fields([
  { name: 'licenseImage', maxCount: 1 },
  { name: 'govtIdImage', maxCount: 1 },
]);

/**
 * Multer error handler middleware — call after upload middleware.
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files uploaded.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};
