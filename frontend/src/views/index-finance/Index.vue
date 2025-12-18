<template>
  <div class="finance-index">
    <div class="left-pane">
      <el-card class="budget-card" shadow="hover">
        <div class="budget-header">本月预算（¥）</div>
        <div class="budget-amount">{{ latestBudget }}</div>
        <div class="budget-action">
          <el-input v-model="budgetForm.amount" placeholder="输入新的预算金额" style="width: 200px; margin-right: 8px" />
          <el-button type="primary" @click="saveBudget">保存</el-button>
        </div>
      </el-card>

      <el-card class="record-card" shadow="hover">
        <div class="form-row">
          <div class="label">金额</div>
          <el-input v-model="recordForm.amount" placeholder="请输入金额" @input="onAmountInput" />
        </div>

        <div class="form-row">
          <div class="label">分类</div>
          <el-select v-model="recordForm.category" placeholder="选择 收入/支出" style="width: 100%">
            <el-option label="收入" value="收入" />
            <el-option label="支出" value="支出" />
          </el-select>
        </div>

        <div class="form-row">
          <div class="label">用途 <span v-if="isIncome" style="color:#999;">（收入默认“工资”，可不选）</span></div>
          <el-select v-model="recordForm.purpose" :disabled="isIncome" filterable clearable placeholder="选择用途" style="width: 100%">
            <el-option v-for="p in purposeList" :key="p.id" :label="p.purpose" :value="p.purpose" />
          </el-select>
        </div>

        <div class="form-row">
          <div class="label">日期</div>
          <el-date-picker v-model="recordForm.created_at" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" />
        </div>

        <div class="form-row">
          <div class="label">备注</div>
          <el-input v-model="recordForm.remark" placeholder="支持 #标签 与 emoji，如 #加班餐 😊" />
        </div>

        <div class="form-actions">
          <el-button type="success" @click="submitRecord">记一笔</el-button>
          <el-button @click="openList">查看历史</el-button>
        </div>
      </el-card>
    </div>

    <!-- 右侧面板 - 进度条 + 图表 -->
    <div class="right-pane">
      <el-card class="progress-card" shadow="hover">
        <div class="progress-header">
          <div class="progress-title">{{ monthlyStats.month }} 消费进度</div>
          <div class="progress-subtitle">本月消费情况</div>
        </div>
        
        <div class="progress-content">
          <div class="progress-bar-container">
            <div class="progress-bar-bg">
              <div 
                class="progress-bar-fill" 
                :style="{ width: progressPercentage + '%' }"
                :class="progressBarClass"
              ></div>
            </div>
            <div class="progress-text">
              <span class="current-amount">¥{{ monthlyStats.totalExpense }}</span>
              <span class="budget-amount">/ ¥{{ latestBudget }}</span>
            </div>
          </div>
          
          <div class="progress-stats">
            <div class="stat-item">
              <div class="stat-label">已消费</div>
              <div class="stat-value expense">¥{{ monthlyStats.totalExpense }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">剩余预算</div>
              <div class="stat-value remaining">¥{{ remainingBudget }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">进度</div>
              <div class="stat-value progress">{{ progressPercentage }}%</div>
            </div>
          </div>
          
          <div class="progress-tips" v-if="progressTips">
            <div class="tip-content">
              <span class="tip-icon">{{ progressTips.icon }}</span>
              <span class="tip-text">{{ progressTips.text }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="charts-card" shadow="hover">
        <div class="charts-toolbar">
          <el-segmented v-model="chartRange" :options="chartRangeOptions" @change="reloadCharts" />
        </div>
        <div class="charts-grid">
          <div id="piePurpose" class="chart-box"></div>
          <div id="barDaily" class="chart-box"></div>
        </div>
      </el-card>
    </div>

    <!-- 历史记录弹窗 -->
    <el-dialog v-model="showListDialog" title="记账数据" width="80%" top="5vh">
      <div class="toolbar">
        <el-form :inline="true" :model="filters">
          <el-form-item label="日期">
            <el-date-picker v-model="dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="用途">
            <el-select v-model="filters.purpose" placeholder="选择用途" filterable clearable style="width: 200px">
              <el-option v-for="p in purposeList" :key="p.id" :label="p.purpose" :value="p.purpose" />
            </el-select>
          </el-form-item>
          <el-form-item label="金额范围">
            <el-input v-model.number="filters.minAmount" placeholder="最小" style="width: 120px" />
            <span style="margin: 0 8px">-</span>
            <el-input v-model.number="filters.maxAmount" placeholder="最大" style="width: 120px" />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="filters.category" placeholder="收入/支出" style="width: 120px">
              <el-option label="全部" value="all" />
              <el-option label="收入" value="income" />
              <el-option label="支出" value="expense" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-select v-model="filters.order" placeholder="金额排序" style="width: 140px">
              <el-option label="金额升序" value="ASC" />
              <el-option label="金额降序" value="DESC" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
            <el-button @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="recordList" border style="width: 100%" max-height="600px">
        <el-table-column prop="id" label="id" width="100" align="center" />
        <el-table-column prop="amount" label="金额(¥)" width="140" align="center">
          <template #default="scope">
            <span :class="Number(scope.row.amount) >= 0 ? 'inc' : 'exp'">{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="160" align="center" />
        <el-table-column prop="purpose" label="用途" min-width="200" align="center" />
        <el-table-column prop="remark" label="备注" min-width="240" align="center" />
        <el-table-column prop="created_at" label="时间" width="200" align="center" />
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :total="total"
          :page-size="filters.pageSize"
          :current-page="filters.page"
          @current-change="(p)=>{filters.page=p; getList()}"
          @size-change="(s)=>{filters.pageSize=s; filters.page=1; getList()}"
          :page-sizes="[10,20,50]"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { getFinanceBudgetList, addFinanceBudget, getFinanceRecordList, addFinanceRecord, getFinancePurposeList, getFinanceRecordMonthlyStats, getFinanceStatsByPurpose, getFinanceStatsByDay } from '@/api/index.js'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const latestBudget = ref('0.00')
const budgetForm = ref({ amount: '' })

const purposeList = ref([])

const isIncome = ref(false)

const recordForm = ref({ amount: '', category: '', purpose: '', remark: '', created_at: '' })
const amountTypeText = ref('')
const amountTypeClass = ref('')

const showListDialog = ref(false)
const recordList = ref([])
const total = ref(0)
const filters = ref({ page: 1, pageSize: 10, category: '', minAmount: undefined, maxAmount: undefined, sortBy: 'amount', order: 'DESC', type: 'all' })
const dateRange = ref([])

// 消费进度条相关数据
const monthlyStats = ref({ totalExpense: '0.00', month: '' })

// 图表相关状态
const chartRangeOptions = [
  { label: '本月', value: 'month' },
  { label: '近7天', value: '7d' },
  { label: '近30天', value: '30d' },
]
const chartRange = ref('month')
let pieChart, barChart

onMounted(() => {
  loadBudget()
  loadPurposes()
  loadMonthlyStats()
  nextTick(() => initCharts())
  // 默认日期
  recordForm.value.created_at = formatDate(new Date())
})

const formatDate = (d) => {
  const dt = new Date(d)
  const y = dt.getFullYear()
  const m = String(dt.getMonth()+1).padStart(2,'0')
  const day = String(dt.getDate()).padStart(2,'0')
  return `${y}-${m}-${day}`
}

// 计算属性
const progressPercentage = computed(() => {
  const budget = Number(latestBudget.value)
  const expense = Number(monthlyStats.value.totalExpense)
  if (budget <= 0) return 0
  const percentage = (expense / budget) * 100
  return Math.min(percentage, 100).toFixed(1)
})

const remainingBudget = computed(() => {
  const budget = Number(latestBudget.value)
  const expense = Number(monthlyStats.value.totalExpense)
  const remaining = budget - expense
  return remaining >= 0 ? remaining.toFixed(2) : '0.00'
})

const progressBarClass = computed(() => {
  const percentage = Number(progressPercentage.value)
  if (percentage >= 100) return 'danger'
  if (percentage >= 80) return 'warning'
  if (percentage >= 60) return 'caution'
  return 'safe'
})

const progressTips = computed(() => {
  const percentage = Number(progressPercentage.value)
  if (percentage >= 100) {
    return { icon: '⚠️', text: '预算已超支，请注意控制消费' }
  } else if (percentage >= 80) {
    return { icon: '⚡', text: '预算使用较多，建议控制支出' }
  } else if (percentage >= 60) {
    return { icon: '📊', text: '预算使用适中，继续保持' }
  } else if (percentage >= 30) {
    return { icon: '👍', text: '预算控制良好' }
  } else {
    return { icon: '💚', text: '预算控制优秀' }
  }
})

// 加载月度消费统计
const loadMonthlyStats = async () => {
  try {
    const res = await getFinanceRecordMonthlyStats()
    if (res.code === 0) {
      monthlyStats.value = res.data
    }
  } catch (error) {
    console.error('加载月度统计失败:', error)
  }
}

// 计算图表时间范围
const getRange = () => {
  const now = new Date()
  let start, end
  if (chartRange.value === '7d') {
    const s = new Date(now)
    s.setDate(s.getDate() - 6)
    start = formatDate(s)
    end = formatDate(now)
  } else if (chartRange.value === '30d') {
    const s = new Date(now)
    s.setDate(s.getDate() - 29)
    start = formatDate(s)
    end = formatDate(now)
  } else {
    start = formatDate(new Date(now.getFullYear(), now.getMonth(), 1))
    end = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  }
  return { start, end }
}

// 初始化与加载图表
const initCharts = () => {
  const pieEl = document.getElementById('piePurpose')
  const barEl = document.getElementById('barDaily')
  if (pieEl && !pieChart) pieChart = window.echarts.init(pieEl)
  if (barEl && !barChart) barChart = window.echarts.init(barEl)
  reloadCharts()
  window.addEventListener('resize', resizeCharts)
}

const resizeCharts = () => {
  pieChart && pieChart.resize()
  barChart && barChart.resize()
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  pieChart && pieChart.dispose()
  barChart && barChart.dispose()
})

const reloadCharts = async () => {
  const { start, end } = getRange()
  const [pieRes, barRes] = await Promise.all([
    getFinanceStatsByPurpose({ start, end, _ts: Date.now() }),
    getFinanceStatsByDay({ start, end, _ts: Date.now() }),
  ])
  if (pieRes?.code === 0) renderPie(pieRes.data)
  if (barRes?.code === 0) renderBar(barRes.data)
}

const renderPie = (data) => {
  const option = {
    title: { text: '用途支出占比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ( {d}% )' },
    legend: { bottom: 0, type: 'scroll' },
    series: [
      {
        name: '支出占比',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data,
      },
    ],
  }
  pieChart && pieChart.setOption(option)
}

const renderBar = ({ days, income, expense }) => {
  const option = {
    title: { text: '每日收支', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { top: 24, data: ['收入', '支出'] },
    grid: { left: 32, right: 24, bottom: 40, top: 60 },
    xAxis: {
      type: 'category',
      data: days,
      axisTick: { alignWithLabel: true },
      axisLabel: {
        formatter: (val) => {
          // 仅显示 MM-DD
          if (typeof val === 'string' && val.length >= 7 && val.includes('-')) {
            return val.slice(5)
          }
          return val
        },
      },
    },
    yAxis: { type: 'value' },
    series: [
      { name: '收入', type: 'bar', data: income, itemStyle: { color: '#67c23a' } },
      { name: '支出', type: 'bar', data: expense, itemStyle: { color: '#f56c6c' } },
    ],
  }
  barChart && barChart.setOption(option)
}

const loadBudget = async () => {
  const res = await getFinanceBudgetList()
  if (res.code === 0 && res.data.length) {
    latestBudget.value = Number(res.data[0].amount).toFixed(2)
  } else {
    latestBudget.value = '0.00'
  }
}

const saveBudget = async () => {
  if (!budgetForm.value.amount) { ElMessage.error('请输入预算金额'); return }
  const res = await addFinanceBudget({ amount: Number(budgetForm.value.amount) })
  if (res.code !== 0) { ElMessage.error(res.msg || '保存失败'); return }
  ElMessage.success('保存成功')
  budgetForm.value.amount = ''
  loadBudget()
  // 预算更新后，刷新图表（进度与占比会联动）
  reloadCharts()
}

const loadPurposes = async () => {
  const res = await getFinancePurposeList()
  if (res.code === 0) purposeList.value = res.data
}

const onAmountInput = () => {
  const n = Number(recordForm.value.amount)
  if (isNaN(n)) { amountTypeText.value = ''; amountTypeClass.value=''; return }
}

const submitRecord = async () => {
  const n = Number(recordForm.value.amount)
  if (isNaN(n)) { ElMessage.error('请输入有效金额'); return }
  if (!recordForm.value.category) { ElMessage.error('请选择分类'); return }
  isIncome.value = recordForm.value.category === '收入'
  
  // 统一用正数上送，后端按分类统计
  const amount = Math.abs(n)
  
  const payload = {
    userId: userStore.userId || 1,
    amount: amount,
    category: recordForm.value.category,
    purpose: isIncome.value ? '工资' : recordForm.value.purpose,
    remark: recordForm.value.remark,
    created_at: recordForm.value.created_at,
  }
  const res = await addFinanceRecord(payload)
  if (res.code !== 0) { ElMessage.error(res.msg || '记账失败'); return }
  ElMessage.success('已记账')
  // 清理
  recordForm.value.amount = ''
  recordForm.value.remark = ''
  // 刷新月度统计
  loadMonthlyStats()
  // 刷新图表
  reloadCharts()
}

const openList = () => { showListDialog.value = true; getList() }
const onSearch = () => { filters.value.page = 1; getList() }
const onReset = () => { filters.value = { page: 1, pageSize: 10, category: '', minAmount: undefined, maxAmount: undefined, sortBy: 'amount', order: 'DESC', type: 'all' }; dateRange.value=[]; getList() }

const getList = async () => {
  const params = { ...filters.value }
  if (dateRange.value && dateRange.value.length === 2) {
    params.startDate = dateRange.value[0]
    params.endDate = dateRange.value[1]
  }
  // 类型过滤（前端根据正负做本地过滤，再分页）简化处理
  const res = await getFinanceRecordList(params)
  if (res.code !== 0) return
  let list = res.data.list
  if (filters.value.type === 'income') list = list.filter(i => Number(i.amount) >= 0)
  if (filters.value.type === 'expense') list = list.filter(i => Number(i.amount) < 0)
  list.forEach(i => i.created_at = window.Util.transformTime(i.created_at))
  recordList.value = list
  total.value = res.data.total
}
</script>

<style scoped>
.finance-index { 
  padding: 20px;
  margin: 20px; 
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.left-pane { 
  max-width: 600px; 
  flex: 0 0 auto;
}

.right-pane {
  flex: 1;
  min-width: 400px;
}

.budget-card { margin-bottom: 16px; }
.budget-header { font-size: 14px; color: #666; }
.budget-amount { font-size: 28px; font-weight: 600; margin: 8px 0 12px; }
.budget-action { display: flex; align-items: center; }
.form-row { margin-bottom: 12px; }
.label { margin-bottom: 4px; color: #666; font-size: 13px; }
.form-actions { display: flex; gap: 8px;margin-top: 36px;}
.amount-hint { margin-left: 8px; font-weight: 600; }
.inc { color: #2bbb61; }
.exp { color: #f56c6c; }
.toolbar { margin-bottom: 12px; }
.pager { margin-top: 12px; display: flex; justify-content: flex-end; }

/* 进度条卡片样式 */
.progress-card {
  margin-bottom: 16px;
}

/* 图表卡片 */
.charts-card { margin-top: 16px; }
.charts-toolbar { display: flex; justify-content: flex-end; margin-bottom: 8px; }
.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chart-box { height: 320px; background: #fff; border-radius: 8px; }

.progress-header {
  margin-bottom: 20px;
  text-align: center;
}

.progress-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.progress-subtitle {
  font-size: 14px;
  color: #909399;
}

.progress-content {
  padding: 0 8px;
}

/* 进度条容器 */
.progress-bar-container {
  margin-bottom: 24px;
}

.progress-bar-bg {
  width: 100%;
  height: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.3) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 进度条颜色状态 */
.progress-bar-fill.safe {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.progress-bar-fill.caution {
  background: linear-gradient(135deg, #e6a23c 0%, #f0c78a 100%);
}

.progress-bar-fill.warning {
  background: linear-gradient(135deg, #f56c6c 0%, #f89898 100%);
}

.progress-bar-fill.danger {
  background: linear-gradient(135deg, #f56c6c 0%, #ff6b6b 100%);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 16px;
  font-weight: 600;
}

.current-amount {
  color: #303133;
}

.budget-amount {
  color: #909399;
}

/* 统计信息 */
.progress-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
}

.stat-value.expense {
  color: #f56c6c;
}

.stat-value.remaining {
  color: #67c23a;
}

.stat-value.progress {
  color: #409eff;
}

/* 提示信息 */
.progress-tips {
  padding: 12px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.tip-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tip-icon {
  font-size: 16px;
}

.tip-text {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .finance-index {
    flex-direction: column;
  }
  
  .right-pane {
    min-width: unset;
    width: 100%;
  }
  
  .progress-stats {
    grid-template-columns: 1fr 1fr;
  }

  .charts-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .finance-index {
    margin: 10px 20px;
    padding: 15px;
  }
  
  .progress-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .progress-text {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
}
</style>