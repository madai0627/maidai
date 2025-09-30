<template>
  <el-button type="primary" class="add-btn" @click="openAdd">新增预算</el-button>
  <el-table :data="budgetList" border style="width: 100%" max-height="800">
    <el-table-column prop="id" label="id" width="120" align="center" />
    <el-table-column prop="amount" label="预算金额(¥)" min-width="300" align="center" />
    <el-table-column prop="updated_at" label="修改时间" min-width="300" align="center" />
  </el-table>

  <el-dialog draggable v-model="showDialog" title="新增预算" width="30%" :before-close="handleClose">
    <el-form :model="form" label-width="100px">
      <el-form-item label="预算金额(¥)">
        <el-input v-model="form.amount" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="confirmAdd">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFinanceBudgetList, addFinanceBudget } from '@/api/index.js'
import { ElMessage } from 'element-plus'

const budgetList = ref([])
const showDialog = ref(false)
const form = ref({ amount: '' })

onMounted(() => {
  getList()
})

const getList = async () => {
  const res = await getFinanceBudgetList()
  if (res.code != 0) return
  budgetList.value = res.data
  budgetList.value.forEach(item => {
    item.updated_at = window.Util.transformTime(item.updated_at)
  })
}

const openAdd = () => { form.value = { amount: '' }; showDialog.value = true }
const handleClose = () => { showDialog.value = false }
const confirmAdd = async () => {
  const res = await addFinanceBudget({ amount: form.value.amount })
  if (res.code != 0) { ElMessage.error(res.msg || '新增失败'); return }
  ElMessage.success('新增成功')
  showDialog.value = false
  getList()
}
</script>

<style>
.add-btn { margin-bottom: 12px; }
</style>


