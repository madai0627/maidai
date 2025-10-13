<template>
  <div class="navbar">
    <div class="left">
      <el-button @click="toggleSideBar" v-if="!route.name.includes('Index')">
        <el-icon>
          <Fold />
        </el-icon>
      </el-button>

      <div class="setting" @click="router.push('/')">
        <el-icon><House /></el-icon>
      </div>
    </div>
    <div class="center" v-if="route.name.includes('Index')">
      <div class="tab-item" :class="{active: route.name === 'Index'}" @click="router.push('/')">首页</div>
      <div class="tab-item" :class="{active: route.name === 'IndexCat'}" @click="router.push('/index-cat')">宠物</div>
      <div class="tab-item" :class="{active: route.name === 'IndexFinance'}" @click="router.push('/index-finance')">财务</div>
      <div class="tab-item" :class="{active: route.name === 'IndexQuiz' || route.name === 'IndexQuizDo'}" @click="router.push('/index-quiz')">做题</div>
    </div>
    <div class="right">
      <div class="setting" @click="router.push('/quiz-admin')">
        <el-icon>
          <Setting />
        </el-icon>
      </div>
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
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const useUserStore = userStore()

console.log(route);

const toggleSideBar = () => {
  useUserStore.isCloseSide = !useUserStore.isCloseSide
}

const username = ref('')
username.value = JSON.parse(localStorage.getItem('userInfo'))?.username
let timeTemp = JSON.parse(localStorage.getItem('userInfo'))?.timeTemp
let currentTime = new Date().getTime()
if (!username.value || currentTime - timeTemp > 12 * 60 * 60 * 1000) {
  localStorage.removeItem('userInfo')
  router.push('/login')
}

const logout = () => {
  logoutSync().then(res => {
    if (res.code != 0) {
      alert(res.msg)
      return
    }
    localStorage.removeItem('userInfo')
    router.push('/login')
  })
}
</script>

<style scoped lang="scss">
.navbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.left, .right, .center {
  display: flex;
  align-items: center;
  gap: 20px;
}

.setting {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

.tab-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 15px;
  border-radius: 10px;
  background-color: #f0f2f5;
  font-size: 14px;
  font-weight: 500;
  color: #333;

  &.active {
    background-color: #409eff;
    color: #fff;
  }
}
</style>