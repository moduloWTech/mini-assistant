export interface Client {
  id: string
  name: string
  email: string
  companyName?: string
  systemPersona?: string
  whatsappPhoneNumberId?: string
  telegramVerifyToken?: string
  hasTelegram?: boolean
  webhookUrl?: string
  hasGoogleCalendar?: boolean
  allowedDomains?: string[]
}

export interface AuthState {
  token: string | null
  client: Client | null
  loading: boolean
}

export interface AuthResponse {
  token: string
  client: Client
}

export interface ApiError {
  error: string
}
