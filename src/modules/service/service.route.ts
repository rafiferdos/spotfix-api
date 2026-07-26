import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { serviceController } from './service.controller.js'

const router = Router()

router.post('/', auth(UserRole.TECHNICIAN), serviceController.createService)
router.get('/', serviceController.getAllServices)

export const serviceRoutes = router
