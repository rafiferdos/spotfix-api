import { AppError } from '@/utils/appError.js'
import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { bookingService } from './booking.service.js'

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id as string
  const { technicianId, serviceId, scheduleDate } = req.body

  if (!technicianId || !serviceId || !scheduleDate) {
    throw new AppError(
      status.BAD_REQUEST,
      'technicianId, serviceId, and scheduleDate are required'
    )
  }

  if (isNaN(Date.parse(scheduleDate))) {
    throw new AppError(
      status.BAD_REQUEST,
      'Invalid scheduleDate format. Please use a valid ISO date string.'
    )
  }

  const newBooking = await bookingService.create(customerId, {
    technicianId,
    serviceId,
    scheduleDate
  })

  sendResponse(res, {
    statusCode: status.CREATED,
    message: 'Booking successfully placed',
    data: newBooking
  })
})

export const bookingController = {
  create: createBooking
}
