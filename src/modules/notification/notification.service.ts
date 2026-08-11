import { prisma } from '@/lib/prisma.js'

const getMyNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
}

const getUnreadCount = async (userId: string) => {
  return prisma.notification.count({ where: { userId, isRead: false } })
}

const markAsRead = async (userId: string, id: string) => {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true }
  })
}

const markAllAsRead = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  })
}

export const notificationService = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
}
