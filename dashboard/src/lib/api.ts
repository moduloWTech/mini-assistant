import axios from 'axios'

// Em desenvolvimento, o Vite roda na 5173 e o backend na 3000.
// Em produção, eles rodam na mesma origem.
const isDev = import.meta.env.DEV
const API_BASE = isDev ? 'http://localhost:3000' : window.location.origin

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Inject Auth token gracefully
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('saas_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercept 401 Unauthorized to trigger logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('saas_token')
      localStorage.removeItem('saas_client')
      window.location.href = '/' // Force reload to login screen
    }
    return Promise.reject(error)
  }
)
