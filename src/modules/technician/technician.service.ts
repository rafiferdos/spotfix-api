import { prisma } from '@/lib/prisma.js'
import type { ITechnicianProfilePayload } from './technician.interface.js'

const upsertProfile = async (
  userId: string,
  payload: ITechnicianProfilePayload
) => {
  const profile = await prisma.technicianProfile.upsert({
    where: {
      userId
    },
    create: {
      userId,
      ...payload
    },
    update: {
      ...payload
    }
  })
  return profile
}

export const technicianService = {
  upsert: upsertProfile
}
