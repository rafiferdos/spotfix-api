import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export default {
	port: process.env.PORT || 5000,
	database_url: process.env.DATABASE_URL || '',
	bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS || 10,
	jwtSecret: process.env.JWT_SECRET || '',
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
	jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
	jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
	app_url: process.env.APP_URL || 'http://localhost:3000',
	stripe_product_id: process.env.STRIPE_PRODUCT_ID || '',
	stripe_price_id: process.env.STRIPE_PRICE_ID || '',
	stripe_secret_key: process.env.STRIPE_SECRET_KEY || '',
	stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || '',
	isProduction: process.env.NODE_ENV === 'production'
}