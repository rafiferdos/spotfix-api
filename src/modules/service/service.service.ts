import type { Prisma } from '@/generated/prisma/client.js'
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

const getAllServicesFilteredFromDB = async (
  filters: {
    categoryId?: string
    location?: string
    rating?: number
    search?: string
  },
  pagination: { skip: number; limit: number }
) => {
  const whereConditions: Prisma.ServiceWhereInput = {}

  if (filters.search) {
    whereConditions.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } }
    ]
  }

  if (filters.categoryId) {
    whereConditions.categoryId = filters.categoryId
  }

  if (filters.location) {
    // Nested query to filter by the technician's address
    whereConditions.technician = {
      address: { contains: filters.location, mode: 'insensitive' }
    }
  }

  if (filters.rating) {
    // Filter services that have at least one booking with a review >= specified rating
    whereConditions.bookings = {
      some: {
        review: {
          rating: { gte: filters.rating }
        }
      }
    }
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where: whereConditions,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        technician: {
          select: { name: true, address: true, profileImage: true }
        }
      }
    }),
    prisma.service.count({ where: whereConditions })
  ])

  return { services, total }
}

const deleteServiceFromDB = async (serviceId: string, technicianId: string) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { bookings: true }
  })
  if (!service) throw new AppError(status.NOT_FOUND, 'Service not found')
  if (service.technicianId !== technicianId)
    throw new AppError(status.FORBIDDEN, 'You cannot delete this service')

  if (service.bookings.length > 0)
    throw new AppError(
      status.CONFLICT,
      'This service has existing bookings and cannot be deleted'
    )

  await prisma.service.delete({ where: { id: serviceId } })
  return service
}

export const serviceService = {
  createServiceIntoDB,
  getAllFiltered: getAllServicesFilteredFromDB,
  deleteService: deleteServiceFromDB
}
