import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Client, AuthState } from '@/types/auth'

interface AuthContextData extends AuthState {
  signIn: (token: string, client: Client) => void
  signOut: () => void
  updateClient: (client: Client) => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AuthState>({
    token: null,
    client: null,
    loading: true,
  })

  useEffect(() => {
    const loadStorageData = () => {
      const token = localStorage.getItem('saas_token')
      const clientStr = localStorage.getItem('saas_client')

      if (token && clientStr) {
        try {
          const client = JSON.parse(clientStr)
          setData({ token, client, loading: false })
        } catch (error) {
          localStorage.removeItem('saas_token')
          localStorage.removeItem('saas_client')
          setData({ token: null, client: null, loading: false })
        }
      } else {
        setData({ token: null, client: null, loading: false })
      }
    }

    loadStorageData()
  }, [])

  const signIn = (token: string, client: Client) => {
    localStorage.setItem('saas_token', token)
    localStorage.setItem('saas_client', JSON.stringify(client))
    setData({ token, client, loading: false })
  }

  const signOut = () => {
    localStorage.removeItem('saas_token')
    localStorage.removeItem('saas_client')
    setData({ token: null, client: null, loading: false })
  }

  const updateClient = (client: Client) => {
    localStorage.setItem('saas_client', JSON.stringify(client))
    setData((prev) => ({ ...prev, client }))
  }

  return (
    <AuthContext.Provider value={{ ...data, signIn, signOut, updateClient }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
