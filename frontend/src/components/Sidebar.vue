<template>
  <el-menu
    :default-active="activeMenu"
    class="sidebar-menu"
    :collapse="appStore.sidebarCollapsed"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    router
  >
    <template v-for="group in menuGroups" :key="group.key">
      <el-sub-menu :index="group.path">
        <template #title>
          <el-icon>
            <component :is="group.icon" />
          </el-icon>
          <span>{{ group.title }}</span>
        </template>
        <el-menu-item
          v-for="item in group.children"
          :key="item.path"
          :index="'/admin/' + item.path"
        >
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-sub-menu>
    </template>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import {
  Collection,
  Folder,
  Document,
  Picture,
  FolderChecked,
  Coin,
  Tickets,
  User,
  UserFilled,
  Setting
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 图标映射
const iconMap = {
  Collection,
  Folder,
  Document,
  Picture,
  FolderChecked,
  Coin,
  Tickets,
  User,
  UserFilled,
  Setting
}

// 获取管理后台路由（从 /admin 路由的 children 中获取）
const routes = computed(() => {
  const adminRoute = router.options.routes.find(r => r.path === '/admin')
  return adminRoute?.children || []
})

// 将扁平化的路由转换为分组菜单结构
const menuGroups = computed(() => {
  const groups = {}
  
  routes.value.forEach(route => {
    if (!route.meta?.parent) return
    
    const parent = route.meta.parent
    if (!groups[parent]) {
      // 根据父级名称确定图标和路径
      let icon = 'Setting'
      let path = ''
      if (parent === '题库管理') {
        icon = 'Collection'
        path = 'quiz'
      } else if (parent === '照片管理') {
        icon = 'Picture'
        path = 'photos'
      } else if (parent === '财务管理') {
        icon = 'Coin'
        path = 'finance'
      } else if (parent === '系统管理') {
        icon = 'Setting'
        path = 'system'
      }
      
      groups[parent] = {
        key: parent,
        title: parent,
        icon: iconMap[icon] || Setting,
        path: `/admin/${path}`,
        children: []
      }
    }
    
    groups[parent].children.push({
      path: route.path,
      title: route.meta.title,
      icon: iconMap[route.meta.icon] || Document
    })
  })
  
  return Object.values(groups)
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