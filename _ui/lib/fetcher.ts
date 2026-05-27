/**
 * Tiny axios wrapper. Mirrors the API of the real PeakAgent `useFetcher` hook
 * (`_ui/lib/fetcher.tsx`) so the code you write here looks like code we'd write
 * in production.
 *
 * Usage:
 *   import { fetcher } from '@/lib/fetcher'
 *   const { data } = await fetcher.post('/handlers/front/listings-filter', { search, beds, baths })
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

const client: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export const fetcher = {
  get<T = unknown>(path: string, params?: Record<string, unknown>): Promise<AxiosResponse<T>> {
    return client.get<T>(path, { params })
  },

  post<T = unknown>(path: string, body?: Record<string, unknown>): Promise<AxiosResponse<T>> {
    return client.post<T>(path, body ?? {})
  },
}
