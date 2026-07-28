import { AppError } from '@/utils/appError.js'
import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { paymentService } from './payment.service.js'

const checkout = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string
  const { bookingId } = req.body

  if (!bookingId) {
    throw new AppError(status.BAD_REQUEST, 'Booking ID is required')
  }

  const result = await paymentService.createCheckoutSession(userId, bookingId)

  sendResponse(res, {
    statusCode: status.OK,
    message: 'Payment session created successfully',
    data: result
  })
})

const webhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  const event = req.body as Buffer

  await paymentService.handleWebhook(event, sig)

  sendResponse(res, {
    statusCode: status.OK,
    message: 'Webhook processed successfully'
  })
})

export const paymentController = {
  checkout,
  webhook
}
