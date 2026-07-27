import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import status from 'http-status'
import type { IServicePayload } from './service.interface.js'

const createServiceIntoDB = async (
  payload: IServicePayload,
  technicianId: string
) => {
  const existingService = await prisma.service.findFirst({
    where: {
      title: payload.title,
      technicianId: technicianId
    }
  })

  if (existingService)
    throw new AppError(
      status.BAD_REQUEST,
      'Service with this title already exists for this technician'
    )

  const newService = await prisma.service.create({
    data: {
      ...payload,
      technicianId
    }
  })
  return newService
}

const getAllServicesFromDB = async () => {
  const services = await prisma.service.findMany({
    include: {
      category: true,
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          address: true
        }
      }
    }
  })
  return services
}

export const serviceService = {
  createServiceIntoDB,
  getAllServicesFromDB
}
