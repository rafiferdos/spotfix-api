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

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const technicianId = req.user?.id as string
  const payload = req.body

  const updatedProfile = await technicianService.updateAvailability(
    technicianId,
    payload
  )

  sendResponse(res, {
    statusCode: status.OK,
    message: 'Technician availability updated successfully',
    data: updatedProfile
  })
})

export const technicianController = {
  upsert: upsertProfile,
  updateAvailability
}
