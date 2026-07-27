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

export const reviewController = {
  create: createReview
}
