/**
 * 角色管理 API
 */
import http from '@/util/request'

export const addRoleSync = (data) => http.post('/api/role/add-role', data)
export const getRoleSync = () => http.get('/api/role/get-role')
export const editRoleSync = (id, data) => http.patch(`/api/role/edit-role?id=${id}`, data)
export const deleteRoleSync = (id) => http.delete(`/api/role/delete-role?id=${id}`)

