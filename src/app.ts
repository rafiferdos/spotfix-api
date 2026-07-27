import cookieParser from 'cookie-parser'
import cors from 'cors'
import type { Application, Request, Response } from 'express'
import express from 'express'
import config from './config/index.js'
import notFound from './middlewares/notFound.js'
import { adminRoutes } from './modules/admin/admin.route.js'
import { AuthRoutes } from './modules/auth/auth.route.js'
import { bookingRoutes } from './modules/booking/booking.route.js'
import { categoryRoutes } from './modules/category/category.route.js'
import { reviewRoutes } from './modules/review/review.route.js'
import { serviceRoutes } from './modules/service/service.route.js'
import { technicianRoutes } from './modules/technician/technician.route.js'
import { technicianPublicRoutes } from './modules/technician/technicians.route.js'
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
/*                        Admin Routes                             */
/* --------------------------------------------------------------- */
app.use('/api/admin', adminRoutes)

/* --------------------------------------------------------------- */
/*                        Technician Routes                        */
/* --------------------------------------------------------------- */
app.use('/api/technician', technicianRoutes)
app.use('/api/technicians', technicianPublicRoutes)

/* --------------------------------------------------------------- */
/*                         Category Routes                         */
/* --------------------------------------------------------------- */
app.use('/api/categories', categoryRoutes)

/* --------------------------------------------------------------- */
/*                          Service Routes                          */
/* --------------------------------------------------------------- */
app.use('/api/services', serviceRoutes)

/* --------------------------------------------------------------- */
/*                          Booking Routes                          */
/* --------------------------------------------------------------- */
app.use('/api/bookings', bookingRoutes)

/* --------------------------------------------------------------- */
/*                          Review Routes                          */
/* --------------------------------------------------------------- */
app.use('/api/reviews', reviewRoutes)

/* --------------------------------------------------------------- */
/*                         Error Handling                          */
/* --------------------------------------------------------------- */
app.use(notFound)
app.use(globalErrorHandler)

export default app
