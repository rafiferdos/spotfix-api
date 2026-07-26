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

const getAllBookingsByTechnician = catchAsync(
  async (req: Request, res: Response) => {
    const technicianId = req.user?.id as string

    const bookings = await bookingService.getAllByTechnician(technicianId)

    sendResponse(res, {
      statusCode: status.OK,
      message: 'Bookings retrieved successfully',
      data: bookings
    })
  }
)

const udpateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const { status: newStatus } = req.body

  if (!newStatus) {
    throw new AppError(status.BAD_REQUEST, 'New status is required')
  }

  const updatedBooking = await bookingService.updateStatus(id as string, {
    status: newStatus
  })

  sendResponse(res, {
    statusCode: status.OK,
    message: 'Booking status updated successfully',
    data: updatedBooking
  })
})

export const bookingController = {
  create: createBooking,
  getAllByTechnician: getAllBookingsByTechnician,
  updateStatus: udpateBookingStatus
}
