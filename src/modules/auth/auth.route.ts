import { Router } from "express";
import { AuthControllers } from "./auth.controller.js";

const router = Router()

router.post('/login', AuthControllers.login)

export const AuthRoutes = router