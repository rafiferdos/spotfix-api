import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { categoryController } from '../category/category.controller.js'

const router = Router()

router.post('/categories', auth(UserRole.ADMIN), categoryController.create)
router.get('/categories', auth(UserRole.ADMIN), categoryController.getAll)

export const adminRoutes = router
