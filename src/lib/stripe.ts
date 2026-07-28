import config from '@/config/index.js'
import Stripe from 'stripe'

export const stripe = new Stripe(config.stripe_secret_key)
