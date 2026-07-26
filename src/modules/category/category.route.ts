import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { categoryController } from './category.controller.js'

const router = Router()

router.post('/', auth(UserRole.ADMIN), categoryController.create)
router.get('/', categoryController.getAll)

export const categoryRoutes = router
