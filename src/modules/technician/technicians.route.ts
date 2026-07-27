import { Router } from 'express'
import { technicianController } from './technician.controller.js'

const router = Router()

router.get('/', technicianController.getAllTechnicians)
router.get('/:id', technicianController.getProfileWithReviews)

export const technicianPublicRoutes = router
