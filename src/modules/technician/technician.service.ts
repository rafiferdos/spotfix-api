import { prisma } from '@/lib/prisma.js'
import type { ITechnicianProfilePayload } from './technician.interface.js'

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

export const technicianService = {
  upsert: upsertProfileIntoDB
}
