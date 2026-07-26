import { Router } from 'express'
import { AuthControllers } from './auth.controller.js'

const router = Router()

router.post('/login', AuthControllers.login)
router.post('/refresh-token', AuthControllers.refreshToken)
router.post('/register', AuthControllers.register)
router.get('/me', AuthControllers.getMe)

export const AuthRoutes = router
