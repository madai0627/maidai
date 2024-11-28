<template>
  <el-breadcrumb class="breadcrumb" separator="/">
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
      {{ item.meta?.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  return route.matched.filter(item => item.meta && item.meta.title)
})
</script>

<style scoped>
.breadcrumb {
  margin-bottom: 20px;
}
</style>