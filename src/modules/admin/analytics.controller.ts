import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { analyticsService } from './analytics.service.js'

const overview = catchAsync(async (_req: Request, res: Response) => {
  const data = await analyticsService.getOverview()
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Analytics overview retrieved',
    data
  })
})

const activity = catchAsync(async (_req: Request, res: Response) => {
  const data = await analyticsService.getActivity()
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Activity feed retrieved',
    data
  })
})

export const analyticsController = { overview, activity }
