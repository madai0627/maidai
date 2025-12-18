<template>
  <div class="toolbar">
    <el-form :inline="true" :model="filters">
      <el-form-item label="日期">
        <el-date-picker v-model="dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="用途">
        <el-select v-model="filters.purpose" placeholder="选择用途" filterable clearable style="width: 180px">
          <el-option v-for="p in purposeOptions" :key="p" :label="p" :value="p" />
        </el-select>
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="filters.category" placeholder="收入/支出" clearable style="width: 140px">
          <el-option label="收入" value="收入" />
          <el-option label="支出" value="支出" />
        </el-select>
      </el-form-item>
      <el-form-item label="金额范围">
        <el-input v-model.number="filters.minAmount" placeholder="最小" style="width: 120px" />
        <span style="margin: 0 8px">-</span>
        <el-input v-model.number="filters.maxAmount" placeholder="最大" style="width: 120px" />
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
      <el-form-item>
        <el-button type="success" @click="addRecord">新增记录</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" :disabled="!selectedIds.length" @click="batchDelete">
          批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </div>

  <el-table :data="recordList" border style="width: 100%" max-height="800" @selection-change="handleSelectionChange">
  <el-table-column type="selection" width="55" align="center" />
  <el-table-column prop="id" label="id" width="100" align="center" />
    <el-table-column prop="amount" label="金额(¥)" width="140" align="center" />
    <el-table-column prop="category" label="分类" width="160" align="center" />
    <el-table-column prop="purpose" label="用途" min-width="200" align="center" />
    <el-table-column prop="remark" label="备注" min-width="240" align="center" />
    <el-table-column prop="created_at" label="时间" width="200" align="center" />
    <el-table-column label="操作" width="180" align="center">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="editRecord(scope.row)">编辑</el-button>
        <el-button link type="danger" size="small" @click="deleteRecord(scope.row.id)">删除</el-button>
      </template>
    </el-table-column>
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

  <el-dialog draggable v-model="showDialog" :title="dialogTitle" width="30%" :before-close="handleClose">
    <el-form :model="form" label-width="80px">
      <el-form-item label="金额(¥)">
        <el-input v-model="form.amount" />
      </el-form-item>
      <el-form-item label="分类">
        <el-input v-model="form.category" />
      </el-form-item>
      <el-form-item label="用途">
        <el-input v-model="form.purpose" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFinanceRecordList, editFinanceRecord, deleteFinanceRecord, addFinanceRecord, getFinancePurposeList, batchDeleteFinanceRecord } from '@/api/index.js'
import { ElMessageBox, ElMessage } from 'element-plus'

const recordList = ref([])
const total = ref(0)
const selectedIds = ref([])

const filters = ref({
  page: 1,
  pageSize: 10,
  purpose: '',
  category: '',
  minAmount: undefined,
  maxAmount: undefined,
  sortBy: '',
  order: ''
})
const dateRange = ref([])
const purposeOptions = ref([])

const showDialog = ref(false)
const dialogTitle = ref('编辑记录')
const form = ref({ id: undefined, amount: '', category: '', purpose: '', remark: '' })

onMounted(async () => { await loadPurposeOptions(); getList() })

const loadPurposeOptions = async () => {
  const res = await getFinancePurposeList()
  if (res.code === 0) {
    purposeOptions.value = res.data.map(i => i.purpose)
  }
}

const onSearch = () => {
  if(filters.value.order) {
    filters.value.sortBy = 'amount'
  }
  filters.value.page = 1
  getList()
}
const onReset = () => {
  filters.value = { page: 1, pageSize: 10, purpose: '', category: '', minAmount: undefined, maxAmount: undefined, sortBy: '', order: '' }
  dateRange.value = []
  getList()
}

const getList = async () => {
  const params = { ...filters.value }
  if (dateRange.value && dateRange.value.length === 2) {
    params.startDate = dateRange.value[0]
    params.endDate = dateRange.value[1]
  }
  const res = await getFinanceRecordList(params)
  if (res.code != 0) return
  recordList.value = res.data.list
  total.value = res.data.total
  recordList.value.forEach(item => item.created_at = window.Util.transformTime(item.created_at))
}

const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map(r => r.id)
}

const editRecord = (row) => {
  form.value = { id: row.id, amount: row.amount, category: row.category, purpose: row.purpose, remark: row.remark }
  dialogTitle.value = '编辑记录'
  showDialog.value = true
}
const addRecord = () => {
  form.value = { id: undefined, amount: '', category: '', purpose: '', remark: '' }
  dialogTitle.value = '新增记录'
  showDialog.value = true
}
const handleClose = () => { showDialog.value = false }
const confirmEdit = async () => {
  if (dialogTitle.value === '新增记录') {
    const res = await addFinanceRecord({ amount: form.value.amount, category: form.value.category, purpose: form.value.purpose, remark: form.value.remark })
    if (res.code != 0) { ElMessage.error(res.msg || '新增失败'); return }
    ElMessage.success('新增成功')
  } else {
    const res = await editFinanceRecord(form.value.id, { amount: form.value.amount, category: form.value.category, purpose: form.value.purpose, remark: form.value.remark })
    if (res.code != 0) { ElMessage.error(res.msg || '更新失败'); return }
    ElMessage.success('更新成功')
  }
  showDialog.value = false
  getList()
}
const deleteRecord = (id) => {
  ElMessageBox.confirm('确定删除该记录吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(async () => {
    const res = await deleteFinanceRecord(id)
    if (res.code != 0) { ElMessage.error(res.msg || '删除失败'); return }
    ElMessage.success('删除成功')
    getList()
  })
}

const batchDelete = () => {
  if (!selectedIds.value.length) return
  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await batchDeleteFinanceRecord(selectedIds.value)
    if (res.code != 0) {
      ElMessage.error(res.msg || '批量删除失败'); return
    }
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    getList()
  })
}
</script>

<style>
.toolbar { margin-bottom: 12px; }
.pager { margin-top: 12px; display: flex; justify-content: flex-end; }
</style>


