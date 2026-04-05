import axios from 'axios'

export type ApiErrorPayload = {
  code?: string
  message?: string
  details?: unknown
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

