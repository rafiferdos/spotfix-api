export interface IRegisterUserPayload {
  name: string
  email: string
  password: string
  phone?: string
  role?: 'CUSTOMER' | 'PROVIDER' | 'ADMIN'
  address?: string
  profileImage?: string
}

export interface ILoginCredentials {
  email: string
  password: string
}

export interface ILoginResponse {
  accessToken: string
}
