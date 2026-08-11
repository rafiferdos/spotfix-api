import config from '@/config/index.js'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret
})

export const uploadImageBuffer = (
  buffer: Buffer,
  folder = 'spotfix/avatars'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 512, height: 512, crop: 'fill', gravity: 'face' }
        ]
      },
      (error, result) => {
        if (error || !result) return reject(error)
        resolve(result.secure_url)
      }
    )
    stream.end(buffer)
  })
}
