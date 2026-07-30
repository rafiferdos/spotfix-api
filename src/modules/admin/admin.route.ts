import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { bookingController } from '../booking/booking.controller.js'
import { categoryController } from '../category/category.controller.js'
import { userController } from '../user/user.controller.js'

const router = Router()

/* --------------------------------------------------------------- */
/*                        Category Routes                          */
/* --------------------------------------------------------------- */
router.post('/categories', auth(UserRole.ADMIN), categoryController.create)
router.get('/categories', auth(UserRole.ADMIN), categoryController.getAll)
router.delete(
  '/categories/:id',
  auth(UserRole.ADMIN),
  categoryController.delete
)

/* --------------------------------------------------------------- */
/*                        User Routes                             */
/* --------------------------------------------------------------- */
router.get('/users', auth(UserRole.ADMIN), userController.getAll)
router.patch('/users/:id/ban', auth(UserRole.ADMIN), userController.ban)
router.patch('/users/:id/unban', auth(UserRole.ADMIN), userController.unban)

/* --------------------------------------------------------------- */
/*                        Booking Routes                           */
/* --------------------------------------------------------------- */
router.get('/bookings', auth(UserRole.ADMIN), bookingController.getAll)

export const adminRoutes = router
