import { AppError } from '@/utils/appError.js'
import catchAsync from '@/utils/catchAsync.js'
import { buildMeta, getPaginationParams } from '@/utils/paginate.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { userService } from './user.service.js'

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query as any)
  const { users, total } = await userService.getAll({ skip, limit })

  sendResponse(res, {
    statusCode: status.OK,
    message: 'Users retrieved successfully',
    data: users,
    meta: buildMeta(page, limit, total)
  })
})

const banUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params

  const bannedUser = await userService.ban(id as string)

  sendResponse(res, {
    statusCode: status.OK,
    message: 'User banned successfully',
    data: bannedUser
  })
})

const unbanUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await userService.unban(id as string)
  sendResponse(res, {
    statusCode: status.OK,
    message: 'User unbanned successfully',
    data: user
  })
})

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getMe(req.user?.id as string)
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Profile retrieved',
    data: user
  })
})

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string
  const { name, phone, address } = req.body
  const updated = await userService.updateProfile(userId, {
    name,
    phone,
    address
  })
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Profile updated successfully',
    data: updated
  })
})

const updateProfilePhoto = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string
  if (!req.file)
    throw new AppError(status.BAD_REQUEST, 'No image file provided')
  const updated = await userService.updateProfilePhoto(userId, req.file.buffer)
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Profile photo updated successfully',
    data: updated
  })
})

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword)
    throw new AppError(status.BAD_REQUEST, 'Old and new password are required')
  const result = await userService.changePassword(
    userId,
    oldPassword,
    newPassword
  )
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Password changed successfully',
    data: result
  })
})

export const userController = {
  getAll: getAllUsers,
  ban: banUser,
  unban: unbanUser,
  getMe,
  updateProfile,
  updateProfilePhoto,
  changePassword
}
