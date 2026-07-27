import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { reviewController } from './review.controller.js'

const router = Router()

router.post('/', auth(UserRole.CUSTOMER), reviewController.create)

export const reviewRoutes = router
