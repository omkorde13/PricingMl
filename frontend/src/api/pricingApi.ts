import axios, { AxiosError } from 'axios'
import type { PredictRequest, PredictResponse } from '@/types'

const apiClient = axios.create({
    baseURL: '/api',
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

apiClient.interceptors.response.use(
    (res) => res,
    (err: AxiosError) => {
        const status  = err.response?.status ?? 0
        const message = (err.response?.data as { message?: string })?.message
            ?? err.message ?? 'Unknown error'
        return Promise.reject({ message, status })
    }
)

export async function predict(payload: PredictRequest): Promise<PredictResponse> {
    const { data } = await apiClient.post<PredictResponse>('/predict', payload)
    return data
}

export async function checkHealth(): Promise<boolean> {
    try {
        await apiClient.get('/health')
        return true
    } catch {
        return false
    }
}