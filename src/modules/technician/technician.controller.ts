import { AppError } from '@/utils/appError.js'
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
  const { slots } = req.body

  if (!slots || !Array.isArray(slots)) {
    throw new AppError(
      status.BAD_REQUEST,
      'Please provide an array of time slots for availability'
    )
  }

  const updatedProfile = await technicianService.updateAvailability(
    technicianId,
    { availabilitySlots: slots }
  )

  sendResponse(res, {
    statusCode: status.OK,
    message: 'Technician availability updated successfully',
    data: updatedProfile
  })
})

const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const { skill, location, rating } = req.query
const technicians = await technicianService.allTechnicians({
    skill: skill as string,
    location: location as string,
    rating: rating ? Number(rating) : undefined
  })
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Technicians retrieved successfully',
    data: technicians
  })
})

const getTechnicianProfileWithReviews = catchAsync(
  async (req: Request, res: Response) => {
    const technicianId = req.params.id

    const profile = await technicianService.getProfileWithReviews(
      technicianId as string
    )

    sendResponse(res, {
      statusCode: status.OK,
      message: 'Technician profile retrieved successfully',
      data: profile
    })
  }
)

export const technicianController = {
  upsert: upsertProfile,
  updateAvailability,
  getAllTechnicians,
  getProfileWithReviews: getTechnicianProfileWithReviews
}
