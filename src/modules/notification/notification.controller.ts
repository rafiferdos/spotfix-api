import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { notificationService } from './notification.service.js'

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const data = await notificationService.getMyNotifications(
    req.user?.id as string
  )
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Notifications retrieved',
    data
  })
})

const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user?.id as string)
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Unread count retrieved',
    data: { count }
  })
})

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  await notificationService.markAsRead(req.user?.id as string, id as string)
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Notification marked as read'
  })
})

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.user?.id as string)
  sendResponse(res, {
    statusCode: status.OK,
    message: 'All notifications marked as read'
  })
})

export const notificationController = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
}
