import { UserRole } from '@/generated/prisma/enums.js'
import { auth } from '@/middlewares/auth.js'
import { Router } from 'express'
import { categoryController } from '../category/category.controller.js'
import { userController } from '../user/user.controller.js'

const router = Router()

/* --------------------------------------------------------------- */
/*                        Category Routes                          */
/* --------------------------------------------------------------- */
router.post('/categories', auth(UserRole.ADMIN), categoryController.create)
router.get('/categories', auth(UserRole.ADMIN), categoryController.getAll)

/* --------------------------------------------------------------- */
/*                        User Routes                             */
/* --------------------------------------------------------------- */
router.get('/users', auth(UserRole.ADMIN), userController.getAll)

export const adminRoutes = router
