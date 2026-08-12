import { BookingStatus } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import { notify } from '@/utils/notify.js'
import httpStatus from 'http-status'
import type { IBookingPayload } from './booking.interface.js'

const createBookingInDB = async (
  customerId: string,
  payload: IBookingPayload
) => {
  // Check if there is already an ACTIVE booking for the exact same details
  const existingBooking = await prisma.booking.findFirst({
    where: {
      customerId,
      technicianId: payload.technicianId,
      serviceId: payload.serviceId,
      scheduleDate: new Date(payload.scheduleDate),
      status: {
        in: [
          BookingStatus.REQUESTED,
          BookingStatus.ACCEPTED,
          BookingStatus.PAID,
          BookingStatus.IN_PROGRESS
        ]
      }
    }
  })

  if (existingBooking) {
    throw new AppError(
      httpStatus.CONFLICT,
      'An active booking already exists for these details'
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

  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
    select: { title: true }
  })

  await notify({
    userId: payload.technicianId,
    title: 'New booking request',
    message: `You have a new booking request for "${service?.title ?? 'a service'}".`,
    type: 'BOOKING',
    link: '/technician/bookings'
  })

  return newBooking
}

const cancelBookingInDB = async (customerId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })

  if (!booking) throw new AppError(httpStatus.NOT_FOUND, 'Booking not found')
  if (booking.customerId !== customerId)
    throw new AppError(httpStatus.FORBIDDEN, 'You cannot cancel this booking')

  const cancellable: BookingStatus[] = [
    BookingStatus.REQUESTED,
    BookingStatus.ACCEPTED,
    BookingStatus.PAID
  ]
  if (!cancellable.includes(booking.status))
    throw new AppError(
      httpStatus.FORBIDDEN,
      'This booking can no longer be cancelled'
    )

  const cancelled = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED }
  })

  await notify({
    userId: cancelled.technicianId,
    title: 'Booking cancelled',
    message: 'A customer cancelled their booking.',
    type: 'WARNING',
    link: '/technician/bookings'
  })

  return cancelled
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

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: newStatus }
  })

  const service = await prisma.service.findUnique({
    where: { id: updatedBooking.serviceId },
    select: { title: true }
  })

  if (newStatus === BookingStatus.ACCEPTED) {
    await notify({
      userId: updatedBooking.customerId,
      title: 'Booking accepted',
      message: `Your booking for "${service?.title}" was accepted. Proceed to payment.`,
      type: 'BOOKING',
      link: `/customer/bookings/${updatedBooking.id}/pay`
    })
  } else if (newStatus === BookingStatus.DECLINED) {
    await notify({
      userId: updatedBooking.customerId,
      title: 'Booking declined',
      message: `Your booking for "${service?.title}" was declined.`,
      type: 'WARNING',
      link: '/customer'
    })
  } else if (newStatus === BookingStatus.IN_PROGRESS) {
    await notify({
      userId: updatedBooking.customerId,
      title: 'Job started',
      message: `Work has started on "${service?.title}".`,
      type: 'INFO',
      link: '/customer'
    })
  } else if (newStatus === BookingStatus.COMPLETED) {
    await notify({
      userId: updatedBooking.customerId,
      title: 'Job completed',
      message: `Your job "${service?.title}" is complete. Leave a review!`,
      type: 'SUCCESS',
      link: '/customer'
    })
    await notify({
      userId: updatedBooking.technicianId,
      title: 'Job marked completed',
      message: `You marked "${service?.title}" as completed.`,
      type: 'SUCCESS',
      link: '/technician/bookings'
    })
  }

  return updatedBooking
}

const viewMyBookingsFromDB = async (customerId: string) => {
  return await prisma.booking.findMany({
    where: {
      customerId
    }
  })
}

const getAllBookings = async (pagination: { skip: number; limit: number }) => {
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.booking.count()
  ])
  return { bookings, total }
}

const getSingleBookingByIdFromDB = async (bookingId: string) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId }
  })
  return booking
}

export const bookingService = {
  create: createBookingInDB,
  cancel: cancelBookingInDB,
  getAllByTechnician: getAllBookingsByTechnician,
  updateStatus: updateBookingStatus,
  viewMyBookings: viewMyBookingsFromDB,
  getAll: getAllBookings,
  getSingleBooking: getSingleBookingByIdFromDB
}
