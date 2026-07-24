import type { UserRole } from '@/generated/prisma/enums.js'

declare global {
	namespace Express {
		interface Request {
			user?: {
				email: string
				id: string
				name: string
				role: UserRole
			}
		}
	}
}
