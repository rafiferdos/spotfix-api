import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { userService } from './user.service.js'

const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await userService.getAll()

  sendResponse(res, {
    statusCode: status.OK,
    message: 'Users retrieved successfully',
    data: users
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

export const userController = {
  getAll: getAllUsers,
  ban: banUser,
  unban: unbanUser
}
