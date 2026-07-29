import { BookingStatus } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import httpStatus from 'http-status'
import type { IBookingPayload } from './booking.interface.js'

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
      httpStatus.CONFLICT,
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
  payload: { status: BookingStatus }
) => {
  const { status: newStatus } = payload

  const existingStatus = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    select: { status: true }
  })

  const currentStatus = existingStatus.status

  // same status check
  if (currentStatus === newStatus)
    throw new AppError(httpStatus.CONFLICT, 'Booking already has this status')
  if (
    currentStatus === BookingStatus.COMPLETED ||
    currentStatus === BookingStatus.CANCELLED ||
    currentStatus === BookingStatus.DECLINED
  )
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Cannot change status of a completed, cancelled, or declined booking'
    )

  // State Machine Validations
  switch (currentStatus) {
    case BookingStatus.REQUESTED:
      if (
        newStatus !== BookingStatus.ACCEPTED &&
        newStatus !== BookingStatus.DECLINED
      ) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Requested bookings can only be ACCEPTED or DECLINED'
        )
      }
      break

    case BookingStatus.ACCEPTED:
      // Technician shouldn't bypass payment
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Waiting for customer payment. Status will automatically update to PAID.'
      )

    case BookingStatus.PAID:
      if (
        newStatus !== BookingStatus.IN_PROGRESS &&
        newStatus !== BookingStatus.COMPLETED
      ) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'Paid bookings can only be marked as IN_PROGRESS or COMPLETED'
        )
      }
      break

    case BookingStatus.IN_PROGRESS:
      if (newStatus !== BookingStatus.COMPLETED) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          'In-progress bookings can only be marked as COMPLETED'
        )
      }
      break

    default:
      throw new AppError(httpStatus.FORBIDDEN, 'Invalid status transition')
  }

  // Update the DB safely
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: newStatus }
  })

  return updatedBooking
}

const viewMyBookingsFromDB = async (customerId: string) => {
  return await prisma.booking.findMany({
    where: {
      customerId
    }
  })
}

const getAllBookings = async () => {
  return await prisma.booking.findMany()
}

const getSingleBookingByIdFromDB = async (bookingId: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId }
  })
  return booking
}

export const bookingService = {
  create: createBookingInDB,
  getAllByTechnician: getAllBookingsByTechnician,
  updateStatus: updateBookingStatus,
  viewMyBookings: viewMyBookingsFromDB,
  getAll: getAllBookings,
  getSingleBooking: getSingleBookingByIdFromDB
}
