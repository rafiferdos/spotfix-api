import { Router } from "express";

const router = Router()

router.post('/login', AuthContoller.login)

export const AuthRoutes = router