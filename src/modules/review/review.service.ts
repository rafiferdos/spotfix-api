import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import status from 'http-status'
import type { IReviewPayload } from './review.interface.js'

const createReviewIntoDB = async (userId: string, payload: IReviewPayload) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { review: true }
  })
  if (!booking)
    throw new AppError(
      status.NOT_FOUND,
      'Booking not found. Please check the booking ID.'
    )

  if (booking.customerId !== userId)
    throw new AppError(
      status.FORBIDDEN,
      'You are not allowed to create a review for this booking'
    )
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: payload.bookingId }
  })

  if (existingReview)
    throw new AppError(
      status.BAD_REQUEST,
      'You have already created a review for this booking'
    )

  const newReview = await prisma.review.create({
    data: {
      rating: payload.rating,
      comment: payload.comment,
      bookingId: payload.bookingId
      // customerId: userId
    }
  })
  return newReview
}

export const reviewService = {
  create: createReviewIntoDB
}
