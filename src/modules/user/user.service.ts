import { UserStatus } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'

const getAllUsersFromDB = async () => {
  const users = await prisma.user.findMany({
    omit: {
      password: true
    },
    include: {
      services: true,
      technician: true,
      customer: true,
      technicianProfile: true
    }
  })
  return users
}

const banUserInDB = async (userId: string) => {
  const bannedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.BANNED },
    omit: {
      password: true
    }
  })
  return bannedUser
}

const unbanUserInDB = async (userId: string) => {
  const unbannedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.ACTIVE },
    omit: {
      password: true
    }
  })
  return unbannedUser
}

export const userService = {
  getAll: getAllUsersFromDB,
  ban: banUserInDB,
  unban: unbanUserInDB
}
