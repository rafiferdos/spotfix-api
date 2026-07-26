import config from '@/config/index.js'
import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import { JwtUtils } from '@/utils/jwt.js'
import bcrypt from 'bcryptjs'
import status from 'http-status'
import type { JwtPayload } from 'jsonwebtoken'
import type { ILoginCredentials } from './auth.interface.js'

const loginUserIntoDB = async (payload: ILoginCredentials) => {
	const { email, password } = payload

	const user = await prisma.user.findUniqueOrThrow({
		where: { email }
	})

	if (!user) throw new Error('User not found')

	const isPasswordMatched = await bcrypt.compare(password, user.password)
	if (!isPasswordMatched) throw new Error('Invalid password')

	// const { password: _password, ...userWithoutPassword } = user
	// return userWithoutPassword

	const jwtPayload = {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role
	}

	const { accessToken, refreshToken } = JwtUtils.createAuthTokens(jwtPayload, {
		accessSecret: config.jwtSecret,
		accessExpiresIn: config.jwtExpiresIn,
		refreshSecret: config.jwtRefreshSecret,
		refreshExpiresIn: config.jwtRefreshExpiresIn
	})

	return {
		accessToken,
		refreshToken
	}
}

const refreshToken = async (token: string) => {
    const decoded = JwtUtils.verifyToken<JwtPayload>(token, config.jwtRefreshSecret)

    const { id } = decoded

    const user = await prisma.user.findUnique({
        where: { id }
    })

    if (!user) throw new AppError(status.NOT_FOUND, 'User not found')

    const jwtPayload = {
        id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const { accessToken } = JwtUtils.createAuthTokens(jwtPayload, {
        accessSecret: config.jwtSecret,
        accessExpiresIn: config.jwtExpiresIn,
        refreshSecret: config.jwtRefreshSecret,
        refreshExpiresIn: config.jwtRefreshExpiresIn
    })

    return { accessToken }
}

export const AuthServices = {
	login: loginUserIntoDB,
	refreshToken
}
