import { prisma } from '@/lib/prisma.js'
import type { IBookingPayload } from './booking.interface.js'

const createBookingInDB = async (
  customerId: string,
  payload: IBookingPayload
) => {
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

export const bookingService = {
  create: createBookingInDB
}
