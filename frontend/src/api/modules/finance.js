/**
 * 财务模块 API
 */
import http from '@/util/request'

// 财务-用途管理 API
export const getFinancePurposeList = () => http.get('/api/finance-purpose/list')
export const addFinancePurpose = (data) => http.post('/api/finance-purpose/add', data)
export const editFinancePurpose = (id, data) => http.patch(`/api/finance-purpose/edit?id=${id}`, data)
export const deleteFinancePurpose = (id) => http.delete(`/api/finance-purpose/delete?id=${id}`)

// 财务-预算管理 API
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

