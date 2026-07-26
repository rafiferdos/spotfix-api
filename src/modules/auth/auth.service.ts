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

const registerUserIntoDB = async (payload: IReg) => {
	const { name, email, password, profilePhoto } = payload

	const user = await prisma.user.findUnique({
		where: { email }
	})
	if (user) throw new AppError(status.CONFLICT, 'User with this email already exists')

	const passwordHash = await bcrypt.hash(
		password,
		Number(config.bcryptSaltRounds)
	)

	const newUser = await prisma.user.create({
		data: {
			name,
			email,
			password: passwordHash,
			profile: {
				create: {
					profilePhoto: profilePhoto || null
				}
			}
		}
	})

	const result = await prisma.user.findUnique({
		where: {
			id: newUser.id,
			email: newUser.email || email
		},
		include: {
			profile: true
		},
		omit: {
			password: true
		}
	})
	return result
}

export const AuthServices = {
	login: loginUserIntoDB,
	refreshToken
}
