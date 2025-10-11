import http from "../util/request";

export const getCatListSync = () => http.get("/api/cat-info/get-cat");

export const removeCatSync = (id) =>
  http.delete(`/api/cat-info/remove-cat?id=${id}`);

export const addCatSync = (data) => http.post("/api/cat-info/save-cat", data);

export const editCatSync = (id, data) =>
  http.patch(`/api/cat-info/update-cat?id=${id}`, data);

export const searchCatSync = (id) => {
  return http.get(`/api/cat-info/search-cat?id=${id}`);
}

export const registerSync = (data) => {
  return http.post('/api/users/register', data)
}

export const loginSync = (data) => {
  return http.post('/api/users/login', data)
}

export const logoutSync = () => {
  return http.get('/api/users/logout')
}

export const getUserListSync = ()=> {
  return http.get('/api/users/user-list')
}

export const setRoleSync = (data)=> {
  return http.post('/api/users/set-role', data)
}

export const removeUserSync = (id) => {
  return http.delete(`/api/users/remove-user?id=${id}`)
}

export const updateUserSync = (data) => {
  return http.post('/api/users/update-user', data)
}

export const addRoleSync = (data)=> {
  return http.post('/api/role/add-role', data)
}

export const getRoleSync = ()=> {
  return http.get('/api/role/get-role')
}

export const editRoleSync = (id,data)=>{
  return http.patch('/api/role/edit-role?id='+ id, data)
}

export const deleteRoleSync = (id)=>{
  return http.delete('/api/role/delete-role?id='+ id)
}

// 分类管理API
export const getCatTypeSync = () => {
  return http.get('/api/cat-type/get-cat-type')
}

export const addCatTypeSync = (data) => {
  return http.post('/api/cat-type/add-cat-type', data)
}

export const editCatTypeSync = (data) => {
  return http.patch('/api/cat-type/edit-cat-type', data)
}

export const deleteCatTypeSync = (id) => {
  return http.delete(`/api/cat-type/delete-cat-type?id=${id}`)
}

// 图片上传API
export const uploadCatImageSync = (formData) => {
  return http.post('/api/cat-info/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const uploadCatTypeImageSync = (formData) => {
  return http.post('/api/cat-type/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 财务-用途管理 API
export const getFinancePurposeList = () => http.get('/api/finance-purpose/list')
export const addFinancePurpose = (data) => http.post('/api/finance-purpose/add', data)
export const editFinancePurpose = (id, data) => http.patch(`/api/finance-purpose/edit?id=${id}`, data)
export const deleteFinancePurpose = (id) => http.delete(`/api/finance-purpose/delete?id=${id}`)

// 财务-预算管理 API（只读）
export const getFinanceBudgetList = () => http.get('/api/finance-budget/list')
export const addFinanceBudget = (data) => http.post('/api/finance-budget/add', data)

// 财务-记录管理 API
export const getFinanceRecordList = (params) => http.get('/api/finance-record/list', { params })
export const editFinanceRecord = (id, data) => http.patch(`/api/finance-record/edit?id=${id}`, data)
export const deleteFinanceRecord = (id) => http.delete(`/api/finance-record/delete?id=${id}`)
export const addFinanceRecord = (data) => http.post('/api/finance-record/add', data)
export const getFinanceRecordMonthlyStats = () => {
  return http.get('/api/finance-record/monthly-stats', { params: { _ts: Date.now() } })
}
export const getFinanceStatsByPurpose = (params) => http.get('/api/finance-record/stats-by-purpose', { params })
export const getFinanceStatsByDay = (params) => http.get('/api/finance-record/stats-by-day', { params })

// 照片墙 API
export const getPhotoWallList = (params) => http.get('/api/photo-wall/list', { params })
export const addPhotoWall = (data) => http.post('/api/photo-wall/add', data)
export const editPhotoWall = (id, data) => http.patch(`/api/photo-wall/edit?id=${id}`, data)
export const deletePhotoWall = (id) => http.delete(`/api/photo-wall/delete?id=${id}`)
export const uploadPhotoTemp = (formData) => http.post('/api/photo-wall/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })