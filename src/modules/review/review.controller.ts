import { AppError } from '@/utils/appError.js'
import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { reviewService } from './review.service.js'

const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string
  const payload = req.body

  if (!payload.bookingId || payload.rating === undefined)
    throw new AppError(
      status.BAD_REQUEST,
      'Booking ID and rating are required to create a review'
    )
  if (
    typeof payload.rating !== 'number' ||
    payload.rating < 1 ||
    payload.rating > 5
  )
    throw new AppError(
      status.BAD_REQUEST,
      'Rating must be a number between 1 and 5'
    )

  const newReview = await reviewService.create(userId, payload)
  sendResponse(res, {
    statusCode: status.CREATED,
    message: 'Review created successfully',
    data: newReview
  })
})

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await reviewService.getMyReviews(req.user?.id as string)
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Reviews retrieved successfully',
    data: reviews
  })
})

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const { rating, comment } = req.body
  const updated = await reviewService.updateReview(
    req.user?.id as string,
    id as string,
    { rating, comment }
  )
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Review updated successfully',
    data: updated
  })
})

const getTechnicianReviews = catchAsync(async (req: Request, res: Response) => {
  const data = await reviewService.getTechnicianReviews(req.user?.id as string)
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Reviews retrieved successfully',
    data
  })
})

const adminGetAllReviews = catchAsync(async (_req: Request, res: Response) => {
  const reviews = await reviewService.adminGetAllReviews()
  sendResponse(res, {
    statusCode: status.OK,
    message: 'All reviews retrieved successfully',
    data: reviews
  })
})

const adminDeleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const deleted = await reviewService.adminDeleteReview(id as string)
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Review deleted successfully',
    data: deleted
  })
})

export const reviewController = {
  create: createReview,
  getMyReviews,
  updateReview,
  getTechnicianReviews,
  adminGetAllReviews,
  adminDeleteReview
}
