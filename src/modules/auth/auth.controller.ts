import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { AuthServices } from './auth.service.js'

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body
  const result = await AuthServices.login(payload)

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })

  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: false, // Set to true in production when using HTTPS
    sameSite: 'none',
    maxAge: 15 * 60 * 1000 // 15 minutes
  })

  sendResponse(res, {
    statusCode: status.OK,
    message: 'User logged in successfully',
    data: result
  })
})

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies
  if (!refreshToken) {
    res.status(status.UNAUTHORIZED).json({ message: 'Refresh token not found' })
    return
  }

  const { accessToken } = await AuthServices.refreshToken(refreshToken)

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false, // Set to true in production when using HTTPS
    sameSite: 'none',
    maxAge: 15 * 60 * 1000 // 15 minutes
  })

  sendResponse(res, {
    statusCode: status.OK,
    message: 'Access token refreshed successfully',
    data: { accessToken }
  })
})

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body

  const result = await AuthServices.register(payload)

  sendResponse(res, {
    statusCode: status.OK,
    message: 'User registered successfully',
    data: result
  })
})

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string
  const user = await AuthServices.getMe(userId)

  sendResponse(res, {
    statusCode: status.OK,
    message: 'User retrieved successfully',
    data: user
  })
})

export const AuthControllers = {
  login: loginUser,
  refreshToken,
  register: registerUser,
  getMe
}
