<template>
  <el-table :data="userList" border style="width: 100%" max-height="800">
    <el-table-column prop="id" label="id" width="300" align="center" />
    <el-table-column prop="username" label="用户名" width="300" align="center" />
    <el-table-column prop="created_at" label="注册时间" width="300" align="center" />
    <el-table-column prop="role" label="角色" width="300" align="center" />
    <el-table-column label="操作" min-width="200" align="center">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="setRole(scope.row.id)">
          分配角色
        </el-button>
        <el-button link type="warning" size="small" @click="editUser(scope.row)">
          编辑
        </el-button>
        <el-button link type="danger" size="small" @click="deleteUser(scope.row.id)">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分配角色对话框 -->
  <el-dialog draggable align-center v-model="showDialog" title="分配角色" width="25%" :before-close="handleClose">
    <div class="role-container">
      <div v-for="role in roleList" :key="role.id" :class="{'role-item': true,'checked': role.id == currentRole}" @click="changeRole(role.id)">{{ role.role_name }}</div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="success" @click="confirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 编辑用户对话框 -->
  <el-dialog draggable align-center v-model="showEditDialog" title="编辑用户" width="30%" :before-close="handleEditClose">
    <el-form :model="editForm" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="editForm.username" disabled />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="editForm.password" type="password" placeholder="留空则不修改密码" />
      </el-form-item>
      <el-form-item label="角色">
        <el-input v-model="editForm.role" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleEditClose">取消</el-button>
        <el-button type="primary" @click="confirmEdit">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getUserListSync, setRoleSync, getRoleSync, removeUserSync, updateUserSync } from '@/api/index';
import { ElMessageBox,ElMessage } from 'element-plus';

const userList = ref([]);
const currentUser = ref('')
const showDialog = ref(false)
const roleList = ref([])
const currentRole = ref('')

// 编辑用户相关
const showEditDialog = ref(false)
const editForm = ref({
  id: null,
  username: '',
  password: '',
  role: ''
})

onMounted(() => {
  getUserList();
});

const getUserList= () => {
  getUserListSync().then(res=>{
    if(res.code != 0) {
      return
    }
    userList.value = res.data
    userList.value.forEach(item=>{
      item.created_at = window.Util.transformTime(item.created_at)
      item.role = item.role || '无'
    })
  })
}

const handleClose = () => {
  showDialog.value = false
}

const changeRole = (id) => {
  currentRole.value = id
}

const setRole = (id) => {
  currentUser.value = id
  getRoleSync().then(res=>{
    if(res.code != 0) {
      return
    }
    roleList.value = res.data
    currentRole.value = res.data[0].id
    showDialog.value = true
  })
}

const confirm = () => {
  let role_name = roleList.value.find(item=>item.id == currentRole.value)?.role_name
  if(!role_name) {
    return
  }
  setRoleSync({id: currentUser.value, role: role_name}).then(res=>{
    if(res.code != 0) {
      return
    }
    showDialog.value = false
    getUserList()
  })
}

// 删除用户
const deleteUser = (id) => {
  ElMessageBox.confirm('确定删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    removeUserSync(id).then(res => {
      if (res.code === 0) {
        ElMessage.success('删除成功')
        getUserList()
      } else {
        ElMessage.error('删除失败：' + res.msg)
      }
    })
  })
}

// 编辑用户
const editUser = (user) => {
  editForm.value = {
    id: user.id,
    username: user.username,
    password: '',
    role: user.role
  }
  showEditDialog.value = true
}

// 关闭编辑对话框
const handleEditClose = () => {
  showEditDialog.value = false
  editForm.value = {
    id: null,
    username: '',
    password: '',
    role: ''
  }
}

// 确认编辑
const confirmEdit = () => {
  const updateData = {
    id: editForm.value.id,
    role: editForm.value.role
  }
  
  // 只有密码不为空时才更新密码
  if (editForm.value.password.trim()) {
    updateData.password = editForm.value.password
  }
  
  updateUserSync(updateData).then(res => {
    if (res.code === 0) {
      ElMessage.success('更新成功')
      showEditDialog.value = false
      getUserList()
    } else {
      ElMessage.error('更新失败：' + res.msg)
    }
  })
}
</script>

<style lang="scss">
.role-container {
  display: flex;
  .role-item {
    height: 30px;
    line-height: 30px;
    padding: 0 10px;
    border: 1px solid #2bbb61;
    color: #2bbb61;
    border-radius: 6px;
    margin-right: 10px;
    cursor: pointer;
  }
  .role-item.checked {
    background-color: #2bbb61;
    color: #fff;
  }
}
</style>