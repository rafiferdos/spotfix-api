import { PaymentStatus } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'

const getOverview = async () => {
  const [
    totalUsers,
    totalCustomers,
    totalTechnicians,
    totalBookings,
    payments,
    bookingsByStatusRaw,
    serviceCategories
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'TECHNICIAN' } }),
    prisma.booking.count(),
    prisma.payment.findMany({ where: { status: PaymentStatus.COMPLETED } }),
    prisma.booking.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.service.groupBy({ by: ['categoryId'], _count: { categoryId: true } })
  ])

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

  const now = new Date()
  const revenueByMonth = Array.from({ length: 6 }, (_, idx) => {
    const i = 5 - idx
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthLabel = d.toLocaleString('default', {
      month: 'short',
      year: '2-digit'
    })
    const monthRevenue = payments
      .filter(
        p =>
          p.paidAt &&
          p.paidAt.getFullYear() === d.getFullYear() &&
          p.paidAt.getMonth() === d.getMonth()
      )
      .reduce((sum, p) => sum + p.amount, 0)
    return { month: monthLabel, revenue: monthRevenue }
  })

  const bookingsByStatus = bookingsByStatusRaw.map(b => ({
    status: b.status,
    count: b._count.status
  }))

  const categoryIds = serviceCategories.map(c => c.categoryId)
  const categoryRecords = await prisma.category.findMany({
    where: { id: { in: categoryIds } }
  })
  const topCategories = serviceCategories
    .map(c => ({
      name:
        categoryRecords.find(cat => cat.id === c.categoryId)?.name ?? 'Unknown',
      count: c._count.categoryId
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalRevenue,
    totalUsers,
    totalCustomers,
    totalTechnicians,
    totalBookings,
    bookingsByStatus,
    revenueByMonth,
    topCategories
  }
}

const getActivity = async () => {
  const [recentBookings, recentPayments, recentUsers] = await Promise.all([
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true } },
        technician: { select: { name: true } },
        service: { select: { title: true } }
      }
    }),
    prisma.payment.findMany({
      take: 10,
      where: { status: PaymentStatus.COMPLETED },
      orderBy: { paidAt: 'desc' },
      include: {
        booking: { include: { service: { select: { title: true } } } }
      }
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { name: true, role: true, createdAt: true }
    })
  ])

  const activity = [
    ...recentBookings.map(b => ({
      id: `booking-${b.id}`,
      type: 'booking' as const,
      message: `${b.customer.name} booked "${b.service.title}" with ${b.technician.name}`,
      timestamp: b.createdAt
    })),
    ...recentPayments.map(p => ({
      id: `payment-${p.id}`,
      type: 'payment' as const,
      message: `Payment of ৳${p.amount} received for "${p.booking.service.title}"`,
      timestamp: p.paidAt ?? p.createdAt
    })),
    ...recentUsers.map(u => ({
      id: `user-${u.name}-${u.createdAt.getTime()}`,
      type: 'registration' as const,
      message: `${u.name} joined as ${u.role}`,
      timestamp: u.createdAt
    }))
  ]

  return activity
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 20)
}

export const analyticsService = { getOverview, getActivity }
