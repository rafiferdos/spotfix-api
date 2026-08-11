import { AppError } from '@/utils/appError.js'
import status from 'http-status'
import multer from 'multer'

const storage = multer.memoryStorage()

export const uploadSingleImage = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(
        new AppError(status.BAD_REQUEST, 'Only image files are allowed')
      )
    }
    cb(null, true)
  }
}).single('profileImage')
