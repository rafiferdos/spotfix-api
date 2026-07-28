import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { paymentController } from './payment.controller.js'

const router = Router()

router.post('/create', auth(UserRole.CUSTOMER), paymentController.checkout)
router.post('/confirm', paymentController.webhook)
router.get('/', auth(UserRole.CUSTOMER), paymentController.history)
router.get('/:id', auth(UserRole.CUSTOMER), paymentController.details)

export const paymentRoutes = router
