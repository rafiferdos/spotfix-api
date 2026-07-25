export interface ILoginCredentials {
  email: string
  password: string
}

export interface IChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface IRefreshTokenPayload {
  refreshToken: string
}

export interface ILoginResponse {
  accessToken: string
  refreshToken: string
  needsPasswordChange?: boolean
}
