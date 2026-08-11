import { BookingStatus } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import status from 'http-status'
import type {
  IReviewPayload,
  IUpdateReviewPayload
} from './review.interface.js'

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
  if (booking.status !== BookingStatus.COMPLETED)
    throw new AppError(
      status.BAD_REQUEST,
      'You can only create a review for completed bookings'
    )

  const existingReview = await prisma.review.findUnique({
    where: { bookingId: payload.bookingId }
  })
  if (existingReview)
    throw new AppError(
      status.BAD_REQUEST,
      'You have already created a review for this booking'
    )

  return prisma.review.create({
    data: {
      rating: payload.rating,
      comment: payload.comment,
      bookingId: payload.bookingId
    }
  })
}

const getMyReviewsFromDB = async (customerId: string) => {
  return prisma.review.findMany({
    where: { booking: { customerId } },
    include: {
      booking: {
        select: {
          service: { select: { title: true } },
          technician: { select: { name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

const updateReviewInDB = async (
  userId: string,
  reviewId: string,
  payload: IUpdateReviewPayload
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { booking: true }
  })
  if (!review) throw new AppError(status.NOT_FOUND, 'Review not found')
  if (review.booking.customerId !== userId)
    throw new AppError(status.FORBIDDEN, 'You cannot edit this review')
  if (
    payload.rating !== undefined &&
    (payload.rating < 1 || payload.rating > 5)
  )
    throw new AppError(status.BAD_REQUEST, 'Rating must be between 1 and 5')

  return prisma.review.update({ where: { id: reviewId }, data: payload })
}

const getTechnicianReviewsFromDB = async (technicianId: string) => {
  const reviews = await prisma.review.findMany({
    where: { booking: { technicianId } },
    include: {
      booking: {
        select: {
          service: { select: { title: true } },
          customer: { select: { name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0
  return { reviews, avgRating, total: reviews.length }
}

const adminGetAllReviewsFromDB = async () => {
  return prisma.review.findMany({
    include: {
      booking: {
        select: {
          service: { select: { title: true } },
          customer: { select: { name: true, email: true } },
          technician: { select: { name: true, email: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

const adminDeleteReviewFromDB = async (reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) throw new AppError(status.NOT_FOUND, 'Review not found')
  await prisma.review.delete({ where: { id: reviewId } })
  return review
}

export const reviewService = {
  create: createReviewIntoDB,
  getMyReviews: getMyReviewsFromDB,
  updateReview: updateReviewInDB,
  getTechnicianReviews: getTechnicianReviewsFromDB,
  adminGetAllReviews: adminGetAllReviewsFromDB,
  adminDeleteReview: adminDeleteReviewFromDB
}
