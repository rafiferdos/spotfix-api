import { prisma } from '@/lib/prisma.js'
import type { IServicePayload } from './service.interface.js'

const createServiceIntoDB = async (
  payload: IServicePayload,
  technicianId: string
) => {
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
      technician: {}
    }
  })
  return services
}

export const serviceService = {
  createServiceIntoDB,
  getAllServicesFromDB
}
