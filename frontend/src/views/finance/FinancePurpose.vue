<template>
  <el-button type="primary" class="add-btn" @click="addPurpose">新增用途</el-button>
  <el-table :data="purposeList" border style="width: 100%" max-height="800">
    <el-table-column prop="id" label="id" width="120" align="center" />
    <el-table-column prop="purpose" label="用途" min-width="300" align="center" />
    <el-table-column prop="remark" label="备注" min-width="300" align="center" />
    <el-table-column prop="created_at" label="时间" min-width="300" align="center" />
    <el-table-column label="操作" min-width="200" align="center">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="editPurpose(scope.row)">
          编辑
        </el-button>
        <el-button link type="danger" size="small" @click="deletePurpose(scope.row.id)">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog draggable v-model="showDialog" :title="dialogTitle" width="30%" :before-close="handleClose">
    <el-form :model="form" label-width="80px" :size="formSize" ref="ruleFormRef" :rules="rules">
      <el-form-item label="用途" prop="purpose">
        <el-input v-model="form.purpose" style="width: 250px;" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" style="width: 250px;" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="confirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { getFinancePurposeList, addFinancePurpose, editFinancePurpose, deleteFinancePurpose } from '@/api/index.js'
import { ElMessageBox, ElMessage } from 'element-plus'

const purposeList = ref([])
const showDialog = ref(false)
const dialogTitle = ref('新增用途')
const formSize = ref('default')
const form = ref({
  id: undefined,
  purpose: '',
  remark: ''
})

const initForm = ref({
  id: undefined,
  purpose: '',
  remark: ''
})

const ruleFormRef = ref()

const rules = reactive({
  purpose: [
    { required: true, message: '请输入用途', trigger: 'blur' }
  ]
})

onMounted(() => {
  getList()
})

const getList = async () => {
  const res = await getFinancePurposeList()
  if (res.code != 0) {
    ElMessage.error(res.msg)
    return
  }
  purposeList.value = res.data
  purposeList.value.forEach(item => {
    item.created_at = window.Util.transformTime(item.created_at)
  })
}

const addPurpose = () => {
  showDialog.value = true
  dialogTitle.value = '新增用途'
  ruleFormRef.value?.clearValidate()
  form.value = JSON.parse(JSON.stringify(initForm.value))
}

const handleClose = () => {
  showDialog.value = false
}

const confirm = () => {
  if (dialogTitle.value === '新增用途') {
    addFinancePurpose({ purpose: form.value.purpose, remark: form.value.remark }).then(res => {
      if (res.code != 0) return
      getList()
      showDialog.value = false
      ElMessage.success('添加成功')
    }).catch(() => ElMessage.error('添加失败'))
  } else {
    editFinancePurpose(form.value.id, { purpose: form.value.purpose, remark: form.value.remark }).then(res => {
      if (res.code != 0) return
      getList()
      showDialog.value = false
      ElMessage.success('编辑成功')
    }).catch(() => ElMessage.error('编辑失败'))
  }
}

const deletePurpose = (id) => {
  ElMessageBox.confirm('确定删除该用途吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    deleteFinancePurpose(id).then(res => {
      if (res.code != 0) {
        ElMessage.error(res.msg)
        return
      }
      getList()
      ElMessage.success('删除成功')
    }).catch(() => ElMessage.error('删除失败'))
  })
}

const editPurpose = (row) => {
  form.value = { ...row }
  dialogTitle.value = '编辑用途'
  showDialog.value = true
}
</script>

<style>
.add-btn {
  margin-bottom: 20px;
}
</style>


