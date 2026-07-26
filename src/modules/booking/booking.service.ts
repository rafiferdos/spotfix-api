import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import status from 'http-status'
import type { IBookingPayload, IBookingStatus } from './booking.interface.js'

const createBookingInDB = async (
  customerId: string,
  payload: IBookingPayload
) => {
  const existingBooking = await prisma.booking.findFirst({
    where: {
      customerId,
      technicianId: payload.technicianId,
      serviceId: payload.serviceId,
      scheduleDate: new Date(payload.scheduleDate)
    }
  })

  if (existingBooking) {
    throw new AppError(
      status.CONFLICT,
      'Booking already exists for the given details'
    )
  }

  const newBooking = await prisma.booking.create({
    data: {
      customerId,
      technicianId: payload.technicianId,
      serviceId: payload.serviceId,
      scheduleDate: new Date(payload.scheduleDate)
    }
  })
  return newBooking
}

const getAllBookingsByTechnician = async (technicianId: string) => {
  return await prisma.booking.findMany({
    where: {
      technicianId
    }
  })
}

const updateBookingStatus = async (
  bookingId: string,
  status: IBookingStatus
) => {
  await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId }
  })

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: status.status }
  })

  return updatedBooking
}

export const bookingService = {
  create: createBookingInDB,
  getAllByTechnician: getAllBookingsByTechnician,
  updateStatus: updateBookingStatus
}
