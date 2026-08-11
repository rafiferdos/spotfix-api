import type { NotificationType } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'

export const notify = async (params: {
  userId: string
  title: string
  message: string
  type?: NotificationType
  link?: string
}) => {
  try {
    await prisma.notification.create({ data: { ...params } })
  } catch (err) {
    console.error('[notify] failed to create notification', err)
  }
}
