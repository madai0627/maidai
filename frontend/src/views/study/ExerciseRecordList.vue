<template>
  <div class="exercise-record-list">
    <el-card class="study-card">
      <div class="card-header">
        <h2 class="card-title">做题记录</h2>
      </div>
    </el-card>

    <!-- 筛选栏 -->
    <el-card class="study-card">
      <div class="study-filter-bar">
        <div class="filter-item">
          <label>时间范围：</label>
          <el-select v-model="filters.dateRange" placeholder="全部" style="width: 150px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="最近7天" value="7d" />
            <el-option label="最近30天" value="30d" />
          </el-select>
        </div>
        <div class="filter-item">
          <label>来源类型：</label>
          <el-select v-model="filters.sourceType" placeholder="全部" style="width: 150px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="练习" :value="1" />
            <el-option label="考试" :value="2" />
            <el-option label="作业" :value="3" />
          </el-select>
        </div>
        <el-button @click="resetFilter">重置</el-button>
      </div>
    </el-card>

    <!-- 列表 -->
    <el-card class="study-card" v-loading="loading">
      <el-table :data="records" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="subjectCode" label="科目" width="100" align="center">
          <template #default="scope">
            {{ scope.row.subjectCode || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="来源" width="200" align="center">
          <template #default="scope">
            <el-tag :type="getSourceTypeTag(scope.row.sourceType)">
              {{ getSourceTypeText(scope.row.sourceType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="300" align="center">
          <template #default="scope">
            {{ formatDate(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalCount" label="题数" width="150" align="center" />
        <el-table-column prop="correctCount" label="正确" width="150" align="center">
          <template #default="scope">
            <span style="color: #67C23A;">{{ scope.row.correctCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="wrongCount" label="错误" width="150" align="center">
          <template #default="scope">
            <span style="color: #F56C6C;">{{ scope.row.wrongCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="正确率" width="200" align="center">
          <template #default="scope">
            {{ ((scope.row.accuracy || 0) * 100).toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column label="得分" width="150" align="center">
          <template #default="scope">
            {{ scope.row.score || 0 }} / {{ scope.row.maxScore || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="viewDetail(scope.row.id)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-if="!loading && records.length === 0" class="study-empty">
        <div class="empty-icon">📝</div>
        <div class="empty-text">最近还没有做题记录，去开始一次练习吧！</div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getExerciseRecords } from '@/api'
import { ElMessage } from 'element-plus'
import '@/styles/study/index.scss'

const router = useRouter()
const userStore = useUserStore()
const userId = computed(() => userStore.userId || 1)

const loading = ref(false)
const records = ref([])
const total = ref(0)

const filters = ref({
  dateRange: '',
  sourceType: ''
})

const pagination = ref({
  page: 1,
  pageSize: 20
})

// 加载数据
const loadRecords = async () => {
  loading.value = true
  try {
    const params = {
      userId: userId.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    
    // 处理筛选条件
    if (filters.value.dateRange) {
      params.dateRange = filters.value.dateRange
    }
    if (filters.value.sourceType) {
      params.sourceType = filters.value.sourceType
    }
    
    const res = await getExerciseRecords(params)
    const data = res?.data || res
    
    // 确保数据格式正确
    if (Array.isArray(data)) {
      records.value = data
      total.value = data.length
    } else {
      records.value = data?.list || []
      total.value = data?.total || 0
    }
  } catch (error) {
    console.error('加载做题记录失败:', error)
    ElMessage.error('加载失败，请稍后重试')
    records.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 筛选
const handleFilter = () => {
  pagination.value.page = 1
  loadRecords()
}

// 重置筛选
const resetFilter = () => {
  filters.value = {
    dateRange: '',
    sourceType: ''
  }
  handleFilter()
}

// 分页
const handlePageChange = (page) => {
  pagination.value.page = page
  loadRecords()
}

const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.page = 1
  loadRecords()
}

// 查看详情
const viewDetail = (id) => {
  router.push(`/study/records/${id}`)
}

// 工具函数
const formatDate = (date) => {
  if (!date) return '--'
  return new Date(date).toLocaleString('zh-CN')
}

const getSourceTypeText = (type) => {
  const map = { 1: '练习', 2: '考试', 3: '作业' }
  return map[type] || '未知'
}

const getSourceTypeTag = (type) => {
  const map = { 1: 'primary', 2: 'warning', 3: 'success' }
  return map[type] || 'info'
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.exercise-record-list {
  padding: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

