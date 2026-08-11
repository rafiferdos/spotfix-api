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

import { uploadImageBuffer } from '@/lib/claudinary.js'
import { AppError } from '@/utils/appError.js'
import status from 'http-status'
import type { IUpdateProfilePayload } from './user.interface.js'
// ...keep existing imports/functions above

const getMeFromDB = async (userId: string) => {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: { password: true },
    include: { technicianProfile: true }
  })
}

const updateProfileInDB = async (
  userId: string,
  payload: IUpdateProfilePayload
) => {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: payload,
    omit: { password: true }
  })
  return updated
}

const updateProfilePhotoInDB = async (userId: string, fileBuffer: Buffer) => {
  const secureUrl = await uploadImageBuffer(fileBuffer)
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { profileImage: secureUrl },
    omit: { password: true }
  })
  return updated
}

const changePasswordInDB = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const bcrypt = await import('bcryptjs')
  const config = (await import('@/config/index.js')).default
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  const isMatch = await bcrypt.compare(oldPassword, user.password)
  if (!isMatch)
    throw new AppError(status.UNAUTHORIZED, 'Old password is incorrect')
  const hashed = await bcrypt.hash(newPassword, Number(config.bcryptSaltRounds))
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed }
  })
  return { success: true }
}

export const userService = {
  getAll: getAllUsersFromDB,
  ban: banUserInDB,
  unban: unbanUserInDB,
  getMe: getMeFromDB,
  updateProfile: updateProfileInDB,
  updateProfilePhoto: updateProfilePhotoInDB,
  changePassword: changePasswordInDB
}
