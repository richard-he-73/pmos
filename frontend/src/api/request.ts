import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const request: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器：注入 Token
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('pmos-token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器：Token 过期自动刷新
request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('pmos-refresh-token')
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          })
          localStorage.setItem('pmos-token', res.data.access)
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`
          return request(originalRequest)
        } catch {
          localStorage.removeItem('pmos-token')
          localStorage.removeItem('pmos-refresh-token')
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default request
