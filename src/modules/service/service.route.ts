import { Router } from 'express'
import { serviceController } from './service.controller.js'

const router = Router()

router.post('/', serviceController.createService)
router.get('/', serviceController.getAllServices)

export const serviceRoutes = router
