<template>
  <el-menu
    :default-active="activeMenu"
    class="sidebar-menu"
    :collapse="useUserStore.isCloseSide"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    router
  >
    <template v-for="item in routes" :key="item.path">
      <el-sub-menu v-if="item.children" :index="item.path">
        <template #title>
          <el-icon>
            <component :is="item.meta?.icon" />
          </el-icon>
          <span>{{ item.meta?.title }}</span>
        </template>
        <el-menu-item
          v-for="child in item.children"
          :key="child.path"
          :index="item.path + '/' + child.path"
        >
          <el-icon>
            <component :is="child.meta?.icon" />
          </el-icon>
          <span>{{ child.meta?.title }}</span>
        </el-menu-item>
      </el-sub-menu>
      
      <el-menu-item v-else :index="item.path">
        <el-icon>
          <component :is="item.meta?.icon" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import userStore from '@/store'

const route = useRoute()
const router = useRouter()
const useUserStore = userStore()

const routes = computed(() => {
  return router.options.routes
})

const activeMenu = computed(() => {
  return route.path
})
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  border-right: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}
</style>