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

export const userService = {
  getAll: getAllUsersFromDB
}
