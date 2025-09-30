<template>
  <Navbar />
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
import { ref, onMounted } from 'vue'
import { getFinanceBudgetList, addFinanceBudget, getFinanceRecordList, addFinanceRecord, getFinancePurposeList } from '@/api/index.js'
import { ElMessage } from 'element-plus'
import Navbar from '../../components/Navbar.vue'

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

onMounted(() => {
  loadBudget()
  loadPurposes()
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
  const payload = {
    amount: n,
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
.finance-index { padding: 20px;margin: 20px 50px; }
.left-pane { max-width: 520px; }
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
</style>