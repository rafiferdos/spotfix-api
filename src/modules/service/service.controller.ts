import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { serviceService } from './service.service.js'

const createService = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body
  const technicianId = req.user?.id as string

  const newService = await serviceService.createServiceIntoDB(
    payload,
    technicianId
  )

  sendResponse(res, {
    statusCode: status.CREATED,
    message: 'Service created successfully',
    data: newService
  })
})

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const services = await serviceService.getAllServicesFromDB()

  sendResponse(res, {
    statusCode: status.OK,
    message: 'Services retrieved successfully',
    data: services
  })
})

export const serviceController = {
  createService,
  getAllServices
}
