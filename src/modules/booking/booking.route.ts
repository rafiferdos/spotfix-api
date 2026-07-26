import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { bookingController } from './booking.controller.js'

const router = Router()

// Customer route for creating a booking
router.post('/', auth(UserRole.CUSTOMER), bookingController.create)

// Technician route for retrieving bookings
router.get(
  '/technician',
  auth(UserRole.TECHNICIAN),
  bookingController.getAllByTechnician
)

export const bookingRoutes = router
