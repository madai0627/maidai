/**
 * 认证相关 API
 */
import http from '@/util/request'

export const loginSync = (data) => http.post('/api/users/login', data)
export const logoutSync = () => http.get('/api/users/logout')
export const registerSync = (data) => http.post('/api/users/register', data)

