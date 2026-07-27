import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { reviewService } from './review.service.js'

const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string
  const payload = req.body

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
