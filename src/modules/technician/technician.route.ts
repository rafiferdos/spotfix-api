import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { technicianController } from './technician.controller.js'

const router = Router()

router.put('/profile', auth(UserRole.TECHNICIAN), technicianController.upsert)

export const technicianRoutes = router
