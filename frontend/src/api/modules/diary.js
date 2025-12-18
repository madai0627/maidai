/**
 * 日记模块 API
 */
import http from '@/util/request'

export const getDiaryList = (params) => http.get('/api/diary/list', { params })
export const getDiaryDetail = (id, userId) => http.get(`/api/diary/${id}`, { params: { userId } })
export const createDiary = (data) => http.post('/api/diary/create', data)
export const updateDiary = (id, userId, data) => http.put(`/api/diary/${id}?userId=${userId}`, data)
export const deleteDiary = (id, userId) => http.delete(`/api/diary/${id}?userId=${userId}`)
export const getDiaryMoodStats = (params) => http.get('/api/diary/stats/mood', { params })
export const getDiaryCalendar = (params) => http.get('/api/diary/calendar', { params })
export const getDiaryStreak = (userId) => http.get('/api/diary/streak', { params: { userId } })

