import cookieParser from 'cookie-parser'
import cors from 'cors'
import type { Application, Request, Response } from 'express'
import express from 'express'
import config from './config/index.js'
import notFound from './middlewares/notFound.js'
import { AuthRoutes } from './modules/auth/auth.route.js'
import { categoryRoutes } from './modules/category/category.route.js'
import { technicianRoutes } from './modules/technician/technician.route.js'
import globalErrorHandler from './utils/globalErrorHandler.js'

const app: Application = express()

app.use(
  cors({
    origin: config.app_url,
    credentials: true
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World!')
})

/* --------------------------------------------------------------- */
/*                          Auth Routes                            */
/* --------------------------------------------------------------- */
app.use('/api/auth', AuthRoutes)

/* --------------------------------------------------------------- */
/*                        Technician Routes                        */
/* --------------------------------------------------------------- */
app.use('/api/technician', technicianRoutes)

/* --------------------------------------------------------------- */
/*                         Category Routes                         */
/* --------------------------------------------------------------- */
app.use('/api/category', categoryRoutes)

/* --------------------------------------------------------------- */
/*                         Error Handling                          */
/* --------------------------------------------------------------- */
app.use(notFound)
app.use(globalErrorHandler)

export default app
