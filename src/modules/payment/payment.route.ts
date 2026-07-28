import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import express, { Router } from 'express'
import { paymentController } from './payment.controller.js'

const router = Router()

router.post('/checkout', auth(UserRole.CUSTOMER), paymentController.checkout)

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.webhook
)

export const paymentRoutes = router
