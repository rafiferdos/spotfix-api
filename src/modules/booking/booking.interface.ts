import type { BookingStatus } from '@/generated/prisma/enums.js'

export interface IBookingPayload {
  technicianId: string
  serviceId: string
  scheduleDate: string
}

export interface IBookingStatus {
  status: BookingStatus
}
