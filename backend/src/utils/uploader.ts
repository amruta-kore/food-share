import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Resolve uploads directory reliably
const uploadsRoot = path.resolve(__dirname, '..', '..', 'uploads');
const docUploadDir = path.join(uploadsRoot, 'documents');
const foodUploadDir = path.join(uploadsRoot, 'food');

if (!fs.existsSync(docUploadDir)) {
  fs.mkdirSync(docUploadDir, { recursive: true });
}
if (!fs.existsSync(foodUploadDir)) {
  fs.mkdirSync(foodUploadDir, { recursive: true });
}

// Also ensure cwd-based uploads folder exists for consistency
const cwdUploads = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(cwdUploads)) {
  try { fs.mkdirSync(cwdUploads, { recursive: true }); } catch (_) {}
}

// 1. Legal Document Uploader (Admin Verification)
const docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, docUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const docFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (allowedMimes.includes(file.mimetype.toLowerCase()) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and image files (PNG, JPG, WEBP) are allowed.'));
  }
};

export const documentUpload = multer({
  storage: docStorage,
  fileFilter: docFileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
});

// 2. Food Image Uploader (Donation Postings)
const foodStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, foodUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `food-${uniqueSuffix}${ext}`);
  },
});

const foodFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPG, PNG, WEBP, etc.) are allowed for food photos.'));
  }
};

export const foodImageUpload = multer({
  storage: foodStorage,
  fileFilter: foodFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit for high-res mobile photos
});
