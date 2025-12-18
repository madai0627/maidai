<!--
  空白布局组件
  用于登录页等不需要导航栏的页面
-->
<template>
  <div class="blank-layout">
    <router-view />
  </div>
</template>

<script setup>
// 空白布局，无需额外逻辑
</script>

<style scoped lang="scss">
.blank-layout {
  width: 100%;
  height: 100vh;
  overflow: auto;
}
</style>

