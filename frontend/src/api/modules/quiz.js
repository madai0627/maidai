/**
 * 题库模块 API
 */
import http from '@/util/request'

// 分类管理 API
export const getQuizCategories = () => http.get('/api/quiz/categories')
export const addQuizCategory = (data) => http.post('/api/quiz/categories', data)
export const editQuizCategory = (id, data) => http.put(`/api/quiz/categories/${id}`, data)
export const deleteQuizCategory = (id) => http.delete(`/api/quiz/categories/${id}`)

// 题目管理 API
export const getQuizQuestions = (params) => http.get('/api/quiz/questions', { params })
export const addQuizQuestion = (data) => http.post('/api/quiz/questions', data)
export const editQuizQuestion = (id, data) => http.put(`/api/quiz/questions/${id}`, data)
export const deleteQuizQuestion = (id) => http.delete(`/api/quiz/questions/${id}`)
export const batchDeleteQuizQuestions = (ids) => http.delete('/api/quiz/questions/batch', { data: { ids } })

// 答题记录 API
export const submitQuizAnswer = (data) => http.post('/api/quiz/records/submit', data)
export const getWrongQuestions = (userId) => http.get('/api/quiz/records/wrong', { params: { userId } })
export const getUserQuizStats = (userId) => http.get('/api/quiz/records/stats', { params: { userId } })
export const getRecentQuizRecords = (userId, limit) => http.get('/api/quiz/records/recent', { params: { userId, limit } })

// 图表数据 API
export const getQuizCategoryStats = (userId) => http.get('/api/quiz/records/category-stats', { params: { userId } })
export const getQuizDifficultyStats = (userId) => http.get('/api/quiz/records/difficulty-stats', { params: { userId } })
export const getQuizWeeklyTrend = (userId) => http.get('/api/quiz/records/weekly-trend', { params: { userId } })

// Excel导入导出 API
export const importQuizQuestions = (formData) => http.post('/api/quiz/questions/import-excel', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const downloadQuizTemplate = () => http.get('/api/quiz/template/download', {
  responseType: 'blob'
})

// 收藏功能 API
export const addQuizFavorite = (data) => http.post('/api/quiz/favorites/add', data)
export const removeQuizFavorite = (userId, questionId) => http.delete('/api/quiz/favorites/remove', { params: { userId, questionId } })
export const getQuizFavorites = (userId) => http.get('/api/quiz/favorites/list', { params: { userId } })
export const checkQuizFavorite = (userId, questionId) => http.get('/api/quiz/favorites/check', { params: { userId, questionId } })

