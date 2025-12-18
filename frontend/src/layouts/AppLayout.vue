<!--
  用户功能布局组件
  用于所有用户功能页面（日记、照片墙、财务、学习等）
  包含顶部导航栏和主内容区
-->
<template>
  <el-container class="app-layout">
    <el-header class="app-header">
      <AppNavbar />
    </el-header>
    <el-main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import AppNavbar from './components/AppNavbar.vue'
</script>

<style scoped lang="scss">
.app-layout {
  min-height: 100vh;
}

.app-header {
  height: 60px;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  background: #fff;
}

.app-main {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

