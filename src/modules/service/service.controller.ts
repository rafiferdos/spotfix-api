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
  const { categoryId, location, rating, search } = req.query

  const services = await serviceService.getAllFiltered({
    categoryId: categoryId as string,
    location: location as string,
    rating: rating ? Number(rating) : undefined,
    search: search as string
  })

  sendResponse(res, {
    statusCode: status.OK,
    message: 'Services retrieved successfully',
    data: services
  })
})

const deleteService = catchAsync(async (req: Request, res: Response) => {
  const technicianId = req.user?.id as string
  const { id } = req.params
  const deleted = await serviceService.deleteService(id as string, technicianId)
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Service deleted successfully',
    data: deleted
  })
})

export const serviceController = {
  createService,
  getAllServices,
  deleteService
}
