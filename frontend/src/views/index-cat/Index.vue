<template>
  <el-container class="layout-container">
    <el-header>
      <Navbar />
    </el-header>
  </el-container>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
</style>