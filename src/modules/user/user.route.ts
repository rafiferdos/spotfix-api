import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { uploadSingleImage } from '@/middlewares/upload.js'
import { Router } from 'express'
import { userController } from './user.controller.js'

const router = Router()

const ALL_ROLES = [UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN]

router.get('/me', auth(...ALL_ROLES), userController.getMe)
router.patch('/me', auth(...ALL_ROLES), userController.updateProfile)
router.patch(
  '/me/photo',
  auth(...ALL_ROLES),
  uploadSingleImage,
  userController.updateProfilePhoto
)
router.patch('/me/password', auth(...ALL_ROLES), userController.changePassword)

export const userRoutes = router
