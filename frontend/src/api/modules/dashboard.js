/**
 * 首页 Dashboard API
 * 用于首页数据聚合
 */
import http from '@/util/request'

/**
 * 获取首页概览数据
 * @param {number} userId - 用户ID
 * @returns {Promise} 概览数据
 */
export const getDashboardOverview = (userId) => {
  return http.get('/api/dashboard/overview', { params: { userId } })
}

/**
 * 获取最近动态
 * @param {number} userId - 用户ID
 * @param {number} limit - 限制数量，默认10
 * @returns {Promise} 最近动态列表
 */
export const getRecentActivities = (userId, limit = 10) => {
  return http.get('/api/dashboard/activities', { params: { userId, limit } })
}

