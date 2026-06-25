import request from '../request'

export interface LoginData {
  username: string
  password: string
}

export interface UserInfo {
  id: number
  username: string
  real_name: string
  email: string
  phone: string
  position: string
  department: string
  avatar: string | null
  is_active: boolean
  date_joined: string
  last_login: string | null
  active_project: number | null
  active_project_name: string
}

export function login(data: LoginData) {
  return request.post('/auth/login/', data)
}

export function refreshToken(refresh: string) {
  return request.post('/auth/refresh/', { refresh })
}

export function getCurrentUser() {
  return request.get<UserInfo>('/users/me/')
}

export function updateProfile(data: Partial<UserInfo>) {
  return request.patch<UserInfo>('/users/me/', data)
}
