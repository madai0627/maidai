<template>
  <div class="navbar">
    <div class="left">
      <el-button @click="toggleSideBar">
        <el-icon>
          <Fold />
        </el-icon>
      </el-button>
    </div>
    <div class="right">
      <el-dropdown>
        <span class="user-info">
          {{ username }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人信息</el-dropdown-item>
            <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { Fold, ArrowDown } from '@element-plus/icons-vue'
import { ref } from 'vue'
import userStore from '@/store'
import { logoutSync } from '@/api/index'
const useUserStore = userStore()
const toggleSideBar = () => {
  useUserStore.isCloseSide = !useUserStore.isCloseSide
}

const username = ref('')
username.value = JSON.parse(localStorage.getItem('userInfo'))?.username
if (!username.value) {
  window.location.href = '/login'
}

const logout = () => {
  logoutSync().then(res=>{
    if(res.code != 0) {
      alert(res.msg)
      return
    }
    localStorage.removeItem('userInfo')
    window.location.href = '/login'
  })
}
</script>

<style scoped>
.navbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>