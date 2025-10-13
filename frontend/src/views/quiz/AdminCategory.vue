<template>
  <div class="page">
    <div class="toolbar">
      <el-button type="success" @click="addCategory">新增分类</el-button>
    </div>

    <el-table :data="categories" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="100" align="center" />
      <el-table-column prop="name" label="名称" min-width="200" align="center" />
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="editRow(scope.row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="remove(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog draggable v-model="showDialog" :title="dialogTitle" width="30%" :before-close="handleClose">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="confirmEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getQuizCategories, addQuizCategory, editQuizCategory, deleteQuizCategory } from '@/api'

const categories = ref([])
const showDialog = ref(false)
const dialogTitle = ref('新增分类')
const form = ref({ id: null, name: '' })

const load = async () => {
  const res = await getQuizCategories()
  categories.value = Array.isArray(res) ? res : (res?.data || [])
}

const addCategory = () => {
  form.value = { id: null, name: '' }
  dialogTitle.value = '新增分类'
  showDialog.value = true
}

const editRow = (row) => {
  form.value = { id: row.id, name: row.name }
  dialogTitle.value = '编辑分类'
  showDialog.value = true
}

const handleClose = () => { showDialog.value = false }

const confirmEdit = async () => {
  if (!form.value.name) { ElMessage.error('请输入分类名称'); return }
  if (form.value.id) {
    const res = await editQuizCategory(form.value.id, { name: form.value.name })
    if (res.code && res.code !== 0) { ElMessage.error(res.msg || '更新失败'); return }
    ElMessage.success('更新成功')
  } else {
    const res = await addQuizCategory({ name: form.value.name })
    if (res.code && res.code !== 0) { ElMessage.error(res.msg || '新增失败'); return }
    ElMessage.success('新增成功')
  }
  showDialog.value = false
  await load()
}

const remove = async (row) => {
  ElMessageBox.confirm('确定删除该分类吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(async () => {
    const res = await deleteQuizCategory(row.id)
    if (res.code && res.code !== 0) { ElMessage.error(res.msg || '删除失败'); return }
    ElMessage.success('删除成功')
    await load()
  })
}

onMounted(load)
</script>

<style scoped>
.page { padding: 16px; }
.toolbar { margin-bottom: 12px; }
.dialog-footer { display: inline-flex; gap: 8px; }
</style>


