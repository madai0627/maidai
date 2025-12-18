/**
 * 用户管理 API
 */
import http from '@/util/request'

export const getUserListSync = () => http.get('/api/users/user-list')
export const setRoleSync = (data) => http.post('/api/users/set-role', data)
export const removeUserSync = (id) => http.delete(`/api/users/remove-user?id=${id}`)
export const updateUserSync = (data) => http.post('/api/users/update-user', data)

