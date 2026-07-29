import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { bookingController } from './booking.controller.js'

const router = Router()

// Customer route for creating a booking
router.post('/', auth(UserRole.CUSTOMER), bookingController.create)
router.get('/', auth(UserRole.CUSTOMER), bookingController.viewMyBookings)
router.get('/:id', auth(UserRole.CUSTOMER), bookingController.getSingle)

export const bookingRoutes = router
