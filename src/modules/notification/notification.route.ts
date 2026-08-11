import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { notificationController } from './notification.controller.js'

const router = Router()
const ALL_ROLES = [UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN]

router.get('/', auth(...ALL_ROLES), notificationController.getMyNotifications)
router.get(
  '/unread-count',
  auth(...ALL_ROLES),
  notificationController.getUnreadCount
)
router.patch('/:id/read', auth(...ALL_ROLES), notificationController.markAsRead)
router.patch(
  '/read-all',
  auth(...ALL_ROLES),
  notificationController.markAllAsRead
)

export const notificationRoutes = router
