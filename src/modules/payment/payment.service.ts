import config from '@/config/index.js'
import { BookingStatus, PaymentStatus } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'
import { stripe } from '@/lib/stripe.js'
import { AppError } from '@/utils/appError.js'
import status from 'http-status'
import type Stripe from 'stripe'

const createCheckoutSession = async (userId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true }
  })

  if (!booking) throw new AppError(status.NOT_FOUND, 'Booking not found')
  if (booking.customerId !== userId)
    throw new AppError(status.FORBIDDEN, 'Unauthorized')
  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new AppError(
      status.BAD_REQUEST,
      'Payment is only allowed for ACCEPTED bookings'
    )
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: booking.service.title,
            description: `Payment for booking ID: ${booking.id}`
          },
          unit_amount: Math.round(booking.service.price * 100)
        },
        quantity: 1
      }
    ],
    success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.app_url}/payment/cancel`,
    metadata: {
      userId,
      bookingId
    }
  })

  return { paymentUrl: session.url }
}

const handleWebhook = async (payload: Buffer, sig: string) => {
  const endPointSecret = config.stripe_webhook_secret
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endPointSecret)
  } catch (err: any) {
    throw new AppError(status.BAD_REQUEST, `Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.bookingId
    const transactionId = session.payment_intent as string
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0

    if (bookingId && transactionId) {
      await prisma.$transaction(async tx => {
        await tx.payment.upsert({
          where: { bookingId },
          update: {
            status: PaymentStatus.COMPLETED,
            transactionId,
            paidAt: new Date()
          },
          create: {
            bookingId,
            amount: amountTotal,
            transactionId,
            provider: 'Stripe',
            status: PaymentStatus.COMPLETED,
            paidAt: new Date()
          }
        })

        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.PAID }
        })
      })
    }
  }
}

const getPaymentHistoryFromDB = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: { booking: { customerId: userId } },
    include: {
      booking: {
        include: {
          service: true,
          technician: true
        }
      }
    },
    orderBy: { paidAt: 'desc' }
  })

  return payments
}

const getPaymentDetails = async (userId: string, paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          service: true,
          technician: true
        }
      }
    }
  })

  if (!payment) throw new AppError(status.NOT_FOUND, 'Payment not found')
  if (payment.booking.customerId !== userId)
    throw new AppError(status.FORBIDDEN, 'Unauthorized')

  return payment
}

export const paymentService = {
  createCheckoutSession,
  handleWebhook,
  history: getPaymentHistoryFromDB,
  details: getPaymentDetails
}
