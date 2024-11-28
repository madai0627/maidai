<template>
  <div class="navbar">
    <div class="left">
      <el-button @click="toggleSideBar">
        <el-icon><Fold /></el-icon>
      </el-button>
    </div>
    <div class="right">
      <el-dropdown>
        <span class="user-info">
          Admin
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人信息</el-dropdown-item>
            <el-dropdown-item divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import {Fold, ArrowDown} from '@element-plus/icons-vue'
import {defineEmits} from 'vue'
import userStore from '@/store'
const useUserStore = userStore()

console.log(useUserStore.isCloseSide,'==');
const toggleSideBar = () => {
  useUserStore.isCloseSide = !useUserStore.isCloseSide
  console.log(useUserStore.isCloseSide,'==22222');
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