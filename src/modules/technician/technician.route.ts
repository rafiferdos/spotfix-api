import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { bookingController } from '../booking/booking.controller.js'
import { technicianController } from './technician.controller.js'

const router = Router()

router.put('/profile', auth(UserRole.TECHNICIAN), technicianController.upsert)
router.put(
  '/availability',
  auth(UserRole.TECHNICIAN),
  technicianController.updateAvailability
)
router.get(
  '/bookings',
  auth(UserRole.TECHNICIAN),
  bookingController.getAllByTechnician
)
router.patch(
  '/bookings/:id',
  auth(UserRole.TECHNICIAN),
  bookingController.updateStatus
)

export const technicianRoutes = router
