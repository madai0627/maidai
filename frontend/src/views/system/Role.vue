<template>
  <el-button type="primary" class="add-btn" @click="addrole">添加角色</el-button>
  <el-table :data="roleList" border style="width: 100%" max-height="800">
    <el-table-column prop="id" label="id" width="200" align="center" />
    <el-table-column prop="role_name" label="角色名" width="200" align="center" />
    <el-table-column prop="permissions" label="权限" width="400" align="center" />
    <el-table-column prop="description" label="描述" width="400" align="center" />
    <el-table-column prop="created_at" label="创建时间" width="200" align="center" />
    <el-table-column label="操作" min-width="150" align="center">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="editRole(scope.row)">
          编辑
        </el-button>
        <el-button link type="danger" size="small" @click="deleteRole(scope.row.id)">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-dialog draggable v-model="showDialog" :title="dialogTitle" width="30%" :before-close="handleClose">
    <el-form :model="form" label-width="80px" :size="formSize" ref="ruleFormRef" :rules="rules">
      <el-form-item label="角色名" prop="role_name">
        <el-input v-model="form.role_name" style="width: 250px;" />
      </el-form-item>
      <el-form-item label="权限" prop="permissions">
        <el-input v-model="form.permissions" style="width: 250px;" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" style="width: 250px;" />
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
import { ref, onMounted, reactive } from 'vue';
import { getRoleSync, addRoleSync, deleteRoleSync, editRoleSync } from '@/api/index.js';
import { ElMessageBox, ElMessage } from 'element-plus';


const roleList = ref([])
const showDialog = ref(false)
const dialogTitle = ref('添加角色')
const formSize = ref('default')
const form = ref({
  role_name: '',
  permissions: '',
  description: '',
})

const initForm = ref({
  role_name: '',
  permissions: '',
  description: '',
})


const ruleFormRef = ref()

const rules = reactive({
  role_name: [
    { required: true, message: '请输入角色名', trigger: 'blur' }
  ],
  permissions: [
    { required: true, message: '请输入角色权限', trigger: 'blur' }
  ]
})

onMounted(() => {
  getRoleList();
});
const getRoleList = async () => {
  const res = await getRoleSync();
  if (res.code != 0) {
    ElMessage.error(res.msg)
    return
  }
  roleList.value = res.data;
  roleList.value.forEach(item => {
    item.created_at = window.Util.transformTime(item.created_at)
  })
};
const addrole = () => {
  showDialog.value = true
  dialogTitle.value = '添加角色'
  ruleFormRef.value.clearValidate()
  form.value = JSON.parse(JSON.stringify(initForm.value))
}

const handleClose = () => {
  showDialog.value = false
}

const confirm = () => {
  if (dialogTitle.value == '添加角色') {
    addRoleSync(form.value).then(res => {
      if (res.code != 0) {
        return
      }
      getRoleList()
      showDialog.value = false
      ElMessage.success('添加成功')
    }).catch(() => {
      ElMessage.error('添加失败')
    })
  } else {
    editRoleSync(form.value.id, form.value).then(res => {
      if (res.code != 0) {
        return
      }
      getRoleList()
      showDialog.value = false
      ElMessage.success('编辑成功')
    }).catch(() => {
      ElMessage.error('编辑失败')
    })
  }

}

const deleteRole = (id) => {
  ElMessageBox.confirm('确定删除该角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    deleteRoleSync(id).then(res => {
      if (res.code != 0) {
        ElMessage.error(res.msg)
        return
      }
      getRoleList()
      ElMessage.success('删除成功')
    }).catch(() => {
      ElMessage.error('删除失败')
    })
  })
}

const editRole = (row) => {
  form.value = { ...row }
  dialogTitle.value = '编辑角色'
  showDialog.value = true
}
</script>

<style>
.add-btn {
  margin-bottom: 20px;
}
</style>