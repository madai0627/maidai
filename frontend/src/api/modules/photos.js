/**
 * 照片墙模块 API
 */
import http from '@/util/request'

// 照片墙 API
export const getPhotoWallList = (params) => http.get('/api/photo-wall/list', { params })
export const addPhotoWall = (data) => http.post('/api/photo-wall/add', data)
export const editPhotoWall = (id, data) => http.patch(`/api/photo-wall/edit?id=${id}`, data)
export const deletePhotoWall = (id) => http.delete(`/api/photo-wall/delete?id=${id}`)
export const uploadPhotoTemp = (formData) => http.post('/api/photo-wall/upload', formData, { 
  headers: { 'Content-Type': 'multipart/form-data' } 
})

// 照片管理 API（管理后台）
export const getCatListSync = () => http.get('/api/cat-info/get-cat')
export const removeCatSync = (id) => http.delete(`/api/cat-info/remove-cat?id=${id}`)
export const addCatSync = (data) => http.post('/api/cat-info/save-cat', data)
export const editCatSync = (id, data) => http.patch(`/api/cat-info/update-cat?id=${id}`, data)
export const searchCatSync = (id) => http.get(`/api/cat-info/search-cat?id=${id}`)
export const uploadCatImageSync = (formData) => http.post('/api/cat-info/upload-image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

// 照片分类管理 API
export const getCatTypeSync = () => http.get('/api/cat-type/get-cat-type')
export const addCatTypeSync = (data) => http.post('/api/cat-type/add-cat-type', data)
export const editCatTypeSync = (data) => http.patch('/api/cat-type/edit-cat-type', data)
export const deleteCatTypeSync = (id) => http.delete(`/api/cat-type/delete-cat-type?id=${id}`)
export const uploadCatTypeImageSync = (formData) => http.post('/api/cat-type/upload-image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

