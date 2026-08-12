import type { Prisma } from '@/generated/prisma/client.js'
import { prisma } from '@/lib/prisma.js'
import type {
  IAvailabilityPayload,
  ITechnicianProfilePayload
} from './technician.interface.js'

const upsertProfileIntoDB = async (
  userId: string,
  payload: Partial<ITechnicianProfilePayload>
) => {
  const existingProfile = await prisma.technicianProfile.findUnique({
    where: { userId }
  })

  if (existingProfile) {
    const updatedProfile = await prisma.technicianProfile.update({
      where: { userId },
      data: payload
    })
    return updatedProfile
  }

  const newProfile = await prisma.technicianProfile.create({
    data: {
      userId,
      ...(payload as ITechnicianProfilePayload)
    }
  })
  return newProfile
}

const updateAvailabilityInDB = async (
  technicianId: string,
  slots: IAvailabilityPayload
) => {
  const updatedProfile = await prisma.technicianProfile.update({
    where: { userId: technicianId },
    data: slots
  })
  return updatedProfile
}

const getAllTechniciansFromDB = async (
  filters: { skill?: string; location?: string; rating?: number },
  pagination: { skip: number; limit: number }
) => {
  const whereConditions: Prisma.TechnicianProfileWhereInput = {}

  if (filters.skill) {
    // Check if the skill array contains the specific string
    whereConditions.skills = { has: filters.skill }
  }

  // We build a nested user condition if location or rating exists
  const userConditions: Prisma.UserWhereInput = {}

  if (filters.location) {
    userConditions.address = { contains: filters.location, mode: 'insensitive' }
  }

  if (filters.rating) {
    // Match technicians whose bookings have reviews >= specified rating
    userConditions.technician = {
      some: {
        review: {
          rating: { gte: filters.rating }
        }
      }
    }
  }

  // Attach userConditions to the main where object if it has any keys
  if (Object.keys(userConditions).length > 0) {
    whereConditions.user = userConditions
  }

  const [technicians, total] = await Promise.all([
    prisma.technicianProfile.findMany({
      where: whereConditions,
      skip: pagination.skip,
      take: pagination.limit,
      select: {
        id: true,
        userId: true,
        skills: true,
        experience: true,
        pricing: true,
        user: {
          select: { name: true, address: true, email: true, profileImage: true }
        }
      }
    }),
    prisma.technicianProfile.count({ where: whereConditions })
  ])

  return { technicians, total }
}
const getTechnicianProfileWithReviews = async (technicianId: string) => {
  const profile = await prisma.technicianProfile.findUniqueOrThrow({
    where: { userId: technicianId },
    select: {
      id: true,
      skills: true,
      availabilitySlots: true,
      experience: true,
      pricing: true,
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          technician: {
            select: {
              id: true,
              status: true,
              scheduleDate: true,
              review: {
                select: {
                  id: true,
                  rating: true,
                  comment: true,
                  createdAt: true
                }
              },
              service: {
                select: {
                  id: true,
                  title: true,
                  description: true
                }
              }
            }
          }
        }
      }
    }
  })

  return profile
}

const getEarningsSummaryFromDB = async (technicianId: string) => {
  const payments = await prisma.payment.findMany({
    where: { status: 'COMPLETED', booking: { technicianId } },
    include: { booking: { include: { service: true } } }
  })

  const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0)

  const completedJobs = await prisma.booking.count({
    where: { technicianId, status: 'COMPLETED' }
  })
  const pendingPayoutJobs = await prisma.booking.count({
    where: { technicianId, status: { in: ['PAID', 'IN_PROGRESS'] } }
  })

  const now = new Date()
  const earningsByMonth = Array.from({ length: 6 }, (_, idx) => {
    const i = 5 - idx
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthLabel = d.toLocaleString('default', {
      month: 'short',
      year: '2-digit'
    })
    const monthEarnings = payments
      .filter(
        p =>
          p.paidAt &&
          p.paidAt.getFullYear() === d.getFullYear() &&
          p.paidAt.getMonth() === d.getMonth()
      )
      .reduce((sum, p) => sum + p.amount, 0)
    return { month: monthLabel, earnings: monthEarnings }
  })

  const serviceMap = new Map<string, { count: number; revenue: number }>()
  for (const p of payments) {
    const title = p.booking.service.title
    const current = serviceMap.get(title) ?? { count: 0, revenue: 0 }
    current.count += 1
    current.revenue += p.amount
    serviceMap.set(title, current)
  }
  const topServices = Array.from(serviceMap.entries())
    .map(([title, v]) => ({ title, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return {
    totalEarnings,
    completedJobs,
    pendingPayoutJobs,
    earningsByMonth,
    topServices
  }
}

export const technicianService = {
  upsert: upsertProfileIntoDB,
  updateAvailability: updateAvailabilityInDB,
  allTechnicians: getAllTechniciansFromDB,
  getProfileWithReviews: getTechnicianProfileWithReviews,
  getEarningsSummary: getEarningsSummaryFromDB
}
