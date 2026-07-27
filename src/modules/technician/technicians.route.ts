import { Router } from 'express'
import { technicianController } from './technician.controller.js'

const router = Router()

router.get('/', technicianController.getAllTechnicians)

export const technicianPublicRoutes = router
