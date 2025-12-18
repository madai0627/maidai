<template>
  <div class="diary-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">📔 我的日记</h1>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        写日记
      </el-button>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧：筛选 + 列表 -->
      <div class="left-pane">
        <!-- 筛选工具栏 -->
        <el-card class="filter-card" shadow="hover">
          <div class="filter-row">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索日记内容..."
              clearable
              @keyup.enter="handleSearch"
              style="width: 200px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select
              v-model="filters.mood"
              placeholder="心情筛选"
              clearable
              style="width: 140px"
              @change="handleSearch"
            >
              <el-option label="全部心情" value="" />
              <el-option
                v-for="mood in MOOD_TYPES"
                :key="mood"
                :label="MOOD_LABELS[mood].emoji + ' ' + MOOD_LABELS[mood].label"
                :value="mood"
              />
            </el-select>
            
            <el-date-picker
              v-model="filters.month"
              type="month"
              placeholder="选择月份"
              value-format="YYYY-MM"
              clearable
              @change="handleSearch"
              style="width: 160px"
            />
            
            <el-button @click="resetFilters">重置</el-button>
          </div>
        </el-card>

        <!-- 日记列表 -->
        <el-card class="list-card" shadow="hover">
          <DiaryList
            :list="diaryList"
            :loading="loading"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @create="openCreateDialog"
            @view="openDetailDialog"
            @edit="openEditDialog"
            @delete="handleDelete"
            @page-change="handlePageChange"
          />
        </el-card>
      </div>

      <!-- 右侧：统计面板 -->
      <div class="right-pane">
        <DiaryStats
          ref="statsRef"
          :user-id="userId"
          :selected-mood="filters.mood"
          @mood-select="handleMoodSelect"
          @month-change="handleStatsMonthChange"
        />
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <DiaryEdit
      v-model="showEditDialog"
      :diary="editingDiary"
      :user-id="userId"
      @saved="handleSaved"
    />

    <!-- 详情弹窗 -->
    <DiaryDetail
      v-model="showDetailDialog"
      :diary="viewingDiary"
      @edit="handleDetailEdit"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import DiaryList from './components/DiaryList.vue'
import DiaryEdit from './components/DiaryEdit.vue'
import DiaryDetail from './components/DiaryDetail.vue'
import DiaryStats from './components/DiaryStats.vue'
import { MOOD_TYPES, MOOD_LABELS } from '@/constants/diary.js'
import { getDiaryList, deleteDiary } from '@/api/index.js'

// 用户ID（从localStorage获取）
const userId = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.id || 1
})

// 列表数据
const diaryList = ref([])
const loading = ref(false)
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 筛选条件
const filters = reactive({
  keyword: '',
  mood: '',
  month: ''
})

// 统计面板引用
const statsRef = ref(null)

// 弹窗状态
const showEditDialog = ref(false)
const showDetailDialog = ref(false)
const editingDiary = ref(null)
const viewingDiary = ref(null)

// 页面加载
onMounted(() => {
  loadDiaryList()
})

// 加载日记列表
const loadDiaryList = async () => {
  loading.value = true
  try {
    const params = {
      userId: userId.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.mood) params.mood = filters.mood
    if (filters.month) {
      params.startDate = `${filters.month}-01`
      const [year, month] = filters.month.split('-').map(Number)
      const lastDay = new Date(year, month, 0).getDate()
      params.endDate = `${filters.month}-${lastDay}`
    }

    const res = await getDiaryList(params)
    if (res.code === 0) {
      diaryList.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg || '加载失败')
    }
  } catch (error) {
    ElMessage.error('加载失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 图表点击筛选
const handleMoodSelect = (mood) => {
  filters.mood = mood
  currentPage.value = 1
  loadDiaryList()
}

// 统计面板月份变化
const handleStatsMonthChange = (month) => {
  // 可选：同步筛选条件
  // filters.month = month
  // loadDiaryList()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadDiaryList()
}

// 重置筛选
const resetFilters = () => {
  filters.keyword = ''
  filters.mood = ''
  filters.month = ''
  currentPage.value = 1
  loadDiaryList()
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  loadDiaryList()
}

// 打开新建弹窗
const openCreateDialog = () => {
  editingDiary.value = null
  showEditDialog.value = true
}

// 打开编辑弹窗
const openEditDialog = (diary) => {
  editingDiary.value = diary
  showEditDialog.value = true
}

// 打开详情弹窗
const openDetailDialog = (diary) => {
  viewingDiary.value = diary
  showDetailDialog.value = true
}

// 从详情页编辑
const handleDetailEdit = (diary) => {
  showDetailDialog.value = false
  openEditDialog(diary)
}

// 保存后刷新
const handleSaved = () => {
  loadDiaryList()
  statsRef.value?.refresh()
}

// 删除日记
const handleDelete = async (diary) => {
  try {
    const res = await deleteDiary(diary.id, userId.value)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      showDetailDialog.value = false
      loadDiaryList()
      statsRef.value?.refresh()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    ElMessage.error('删除失败: ' + error.message)
  }
}
</script>

<style scoped>
.diary-page {
  padding: 20px;
  margin: 20px;
  min-height: calc(100vh - 100px);
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

/* 主内容区 */
.main-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.left-pane {
  flex: 1;
  min-width: 0;
}

.right-pane {
  width: 360px;  /* 增加宽度，让图表显示更完整 */
  flex-shrink: 0;
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 列表卡片 */
.list-card {
  min-height: 500px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .right-pane {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .diary-page {
    margin: 10px;
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .filter-row {
    flex-direction: column;
  }
  
  .filter-row > * {
    width: 100% !important;
  }
}
</style>

