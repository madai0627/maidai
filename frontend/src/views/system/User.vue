<template>
  <el-table :data="userList" border style="width: 100%" max-height="800">
    <el-table-column prop="id" label="id" width="300" align="center" />
    <el-table-column prop="username" label="用户名" width="300" align="center" />
    <el-table-column prop="created_at" label="注册时间" width="300" align="center" />
    <el-table-column prop="role" label="角色" width="300" align="center" />
    <el-table-column label="操作" min-width="150" align="center">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="setRole(scope.row.id)">
          分配角色
        </el-button>
      </template>
    </el-table-column>
  </el-table>

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
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getUserListSync, setRoleSync,getRoleSync } from '@/api/index';

const userList = ref([]);
const currentUser = ref('')
const showDialog = ref(false)
const roleList = ref([])
const currentRole = ref('')

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