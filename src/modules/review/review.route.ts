import { Router } from 'express'
import { reviewController } from './review.controller.js'

const router = Router()

router.post('/', reviewController.create)

export const reviewRoutes = router
