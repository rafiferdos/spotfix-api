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

const getAllTechniciansFromDB = async () => {
  const technicians = await prisma.technicianProfile.findMany()
  return technicians
}

const getTechnicianProfileWithReviews = async (technicianId: string) => {
  const profile = await prisma.technicianProfile.findUniqueOrThrow({
    where: { userId: technicianId },
    include: {
      user: {
        include: {
          technician: {
            // where: {
            //   // Optional: Only include bookings that actually have a review
            //   review: { isNot: null }
            // },
            include: {
              review: true,
              service: true
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
