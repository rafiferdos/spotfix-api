import { AppError } from '@/utils/appError.js'
import type { NextFunction, Request, Response } from 'express'
import status from 'http-status'
import multer from 'multer'

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(
        new AppError(status.BAD_REQUEST, 'Only image files are allowed')
      )
    }
    cb(null, true)
  }
}).single('profileImage')

export const uploadSingleImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new AppError(status.BAD_REQUEST, 'Image must be smaller than 2MB')
        )
      }
      return next(new AppError(status.BAD_REQUEST, err.message))
    }
    if (err) return next(err)
    next()
  })
}
