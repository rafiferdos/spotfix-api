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

export const userController = {
  getAll: getAllUsers
}
