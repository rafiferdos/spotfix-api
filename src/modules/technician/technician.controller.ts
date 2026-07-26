import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { technicianService } from './technician.service.js'

const upsertProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string
  const payload = req.body

  const profile = await technicianService.upsert(userId, payload)

  sendResponse(res, {
    statusCode: status.OK,
    message: 'Technician profile upserted successfully',
    data: profile
  })
})

export const technicianController = {
  upsert: upsertProfile
}
