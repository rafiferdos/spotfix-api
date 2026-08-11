import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { bookingController } from '../booking/booking.controller.js'
import { categoryController } from '../category/category.controller.js'
import { reviewController } from '../review/review.controller.js'
import { userController } from '../user/user.controller.js'
import { analyticsController } from './analytics.controller.js'

const router = Router()

router.post('/categories', auth(UserRole.ADMIN), categoryController.create)
router.get('/categories', auth(UserRole.ADMIN), categoryController.getAll)
router.delete(
  '/categories/:id',
  auth(UserRole.ADMIN),
  categoryController.delete
)

router.get('/users', auth(UserRole.ADMIN), userController.getAll)
router.patch('/users/:id/ban', auth(UserRole.ADMIN), userController.ban)
router.patch('/users/:id/unban', auth(UserRole.ADMIN), userController.unban)

router.get('/bookings', auth(UserRole.ADMIN), bookingController.getAll)

router.get(
  '/reviews',
  auth(UserRole.ADMIN),
  reviewController.adminGetAllReviews
)
router.delete(
  '/reviews/:id',
  auth(UserRole.ADMIN),
  reviewController.adminDeleteReview
)

router.get(
  '/analytics/overview',
  auth(UserRole.ADMIN),
  analyticsController.overview
)
router.get(
  '/analytics/activity',
  auth(UserRole.ADMIN),
  analyticsController.activity
)

export const adminRoutes = router
