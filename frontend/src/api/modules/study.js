/**
 * 学习记录模块 API
 * 对应后端 /study/* 接口
 */
import http from '@/util/request'

// 做题记录相关 API
export const getExerciseRecords = (params) => http.get('/api/study/exercise-records', { params })
export const getExerciseRecordDetail = (id, params) => http.get(`/api/study/exercise-records/${id}`, { params })
export const createExerciseRecord = (data) => http.post('/api/study/exercise-records', data)

// 错题相关 API（新接口）
export const getWrongQuestionsNew = (params) => http.get('/api/study/wrong-questions', { params })
export const updateWrongQuestionStatus = (data) => http.post('/api/study/wrong-questions/status', data)
export const generateWrongQuestionPractice = (data) => http.post('/api/study/wrong-questions/practice', data)

// 学习统计 API
export const getLearningOverview = (params) => http.get('/api/study/stats/learning-overview', { params })
export const getLearningDetail = (params) => http.get('/api/study/stats/learning-detail', { params })

