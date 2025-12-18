<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <Sidebar />
    </el-aside>
    <el-container :class="{'el-container': true, isclose: appStore.sidebarCollapsed}">
      <el-header>
        <Navbar />
      </el-header>
      <el-main>
        <Breadcrumb />
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()

</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-header {
  padding: 0;
}

.el-aside {
  color: #fff;
}

.el-main {
  padding: 20px;
  background-color: #f0f2f5;
}
.el-container {
  transition: all .4s;
}
.isclose {
  margin-left: -135px;
}
</style>