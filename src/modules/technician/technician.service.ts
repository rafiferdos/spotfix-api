import type { Prisma } from '@/generated/prisma/client.js'
import { prisma } from '@/lib/prisma.js'
import type {
  IAvailabilityPayload,
  ITechnicianProfilePayload
} from './technician.interface.js'

const upsertProfileIntoDB = async (
  userId: string,
  payload: Partial<ITechnicianProfilePayload>
) => {
  const existingProfile = await prisma.technicianProfile.findUnique({
    where: { userId }
  })

  if (existingProfile) {
    const updatedProfile = await prisma.technicianProfile.update({
      where: { userId },
      data: payload
    })
    return updatedProfile
  }

  const newProfile = await prisma.technicianProfile.create({
    data: {
      userId,
      ...(payload as ITechnicianProfilePayload)
    }
  })
  return newProfile
}

const updateAvailabilityInDB = async (
  technicianId: string,
  slots: IAvailabilityPayload
) => {
  const updatedProfile = await prisma.technicianProfile.update({
    where: { userId: technicianId },
    data: slots
  })
  return updatedProfile
}

const getAllTechniciansFromDB = async (filters: {
  skill?: string
  location?: string
  rating?: number
}) => {
  const whereConditions: Prisma.TechnicianProfileWhereInput = {}

  if (filters.skill) {
    // Check if the skill array contains the specific string
    whereConditions.skills = { has: filters.skill }
  }

  // We build a nested user condition if location or rating exists
  const userConditions: Prisma.UserWhereInput = {}

  if (filters.location) {
    userConditions.address = { contains: filters.location, mode: 'insensitive' }
  }

  if (filters.rating) {
    // Match technicians whose bookings have reviews >= specified rating
    userConditions.technician = {
      some: {
        review: {
          rating: { gte: filters.rating }
        }
      }
    }
  }

  // Attach userConditions to the main where object if it has any keys
  if (Object.keys(userConditions).length > 0) {
    whereConditions.user = userConditions
  }

  return await prisma.technicianProfile.findMany({
    where: whereConditions,
    select: {
      id: true,
      skills: true,
      experience: true,
      pricing: true,
      user: {
        select: {
          name: true,
          address: true,
          email: true
        }
      }
    }
  })
}
const getTechnicianProfileWithReviews = async (technicianId: string) => {
  const profile = await prisma.technicianProfile.findUniqueOrThrow({
    where: { userId: technicianId },
    select: {
      id: true,
      skills: true,
      availabilitySlots: true,
      experience: true,
      pricing: true,
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          technician: {
            select: {
              id: true,
              status: true,
              scheduleDate: true,
              review: {
                select: {
                  id: true,
                  rating: true,
                  comment: true,
                  createdAt: true
                }
              },
              service: {
                select: {
                  id: true,
                  title: true,
                  description: true
                }
              }
            }
          }
        }
      }
    }
  })

  return profile
}

export const technicianService = {
  upsert: upsertProfileIntoDB,
  updateAvailability: updateAvailabilityInDB,
  allTechnicians: getAllTechniciansFromDB,
  getProfileWithReviews: getTechnicianProfileWithReviews
}
