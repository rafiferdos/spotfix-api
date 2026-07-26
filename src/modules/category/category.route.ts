import { Router } from 'express'
import { categoryController } from './category.controller.js'

const router = Router()

router.get('/', categoryController.getAll)

export const categoryRoutes = router
