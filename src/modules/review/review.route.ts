import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { reviewController } from './review.controller.js'

const router = Router()

router.post('/', auth(UserRole.CUSTOMER), reviewController.create)
router.get('/me', auth(UserRole.CUSTOMER), reviewController.getMyReviews)
router.patch('/:id', auth(UserRole.CUSTOMER), reviewController.updateReview)
router.get(
  '/technician/me',
  auth(UserRole.TECHNICIAN),
  reviewController.getTechnicianReviews
)

export const reviewRoutes = router
