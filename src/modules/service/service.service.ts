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

const getAllServicesFilteredFromDB = async (filters: {
  categoryId?: string
  location?: string
  rating?: number
  search?: string
}) => {
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

  return await prisma.service.findMany({
    where: whereConditions,
    include: {
      category: { select: { name: true } },
      technician: { select: { name: true, address: true } }
    }
  })
}

export const serviceService = {
  createServiceIntoDB,
  getAllFiltered: getAllServicesFilteredFromDB
}
