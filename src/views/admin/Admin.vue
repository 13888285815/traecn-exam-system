<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <router-link to="/" class="sidebar-logo">
          <span class="logo-icon">&#x1F4DD;</span>
          <span class="logo-text">管理后台</span>
        </router-link>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ 'nav-active': isActive(item.path) }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main-area">
      <!-- Top Bar -->
      <header class="top-bar">
        <div class="top-left">
          <h1 class="page-title">{{ currentPageTitle }}</h1>
        </div>
        <div class="top-right">
          <span class="user-info">{{ user?.name || '管理员' }}</span>
          <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
        </div>
      </header>

      <!-- Content -->
      <main class="content-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { secureStorage } from '../../utils/security'
import { userApi } from '../../api'
import type { User } from '../../types'

const router = useRouter()
const route = useRoute()
const user = ref<User | null>(null)

const menuItems = [
  { path: '/admin/users', label: '用户管理', icon: '\u{1F465}' },
  { path: '/admin/questions', label: '题库管理', icon: '\u{1F4DA}' },
  { path: '/admin/exams', label: '试卷管理', icon: '\u{1F4DD}' },
  { path: '/admin/time-slots', label: '考试时段', icon: '\u{1F552}' },
  { path: '/admin/categories', label: '分类管理', icon: '\u{1F4C1}' },
  { path: '/admin/import', label: '试卷导入', icon: '\u{1F4E5}' },
  { path: '/admin/recycle-bin', label: '回收站', icon: '\u{1F5D1}' },
  { path: '/admin/data-clean', label: '数据清理', icon: '\u{1F9F9}' },
  { path: '/admin/error-analysis', label: '错误分析', icon: '\u{1F4CA}' }
]

const currentPageTitle = computed(() => {
  const item = menuItems.find(m => route.path === m.path)
  return item?.label || '管理后台'
})

function isActive(path: string): boolean {
  return route.path === path
}

onMounted(() => {
  user.value = secureStorage.getItem<User>('user')
})

function handleLogout() {
  userApi.logout()
  user.value = null
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

/* Sidebar */
.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #fff;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.15rem;
  font-weight: 700;
}

.sidebar-nav {
  flex: 1;
  padding: 0.75rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.nav-active {
  color: #fff;
  background: rgba(102, 126, 234, 0.3);
  border-left-color: #667eea;
}

.nav-icon {
  font-size: 1.15rem;
}

.nav-text {
  font-weight: 500;
}

/* Main Area */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Top Bar */
.top-bar {
  background: #fff;
  padding: 0 1.5rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 50;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  color: #555;
  font-size: 0.9rem;
}

/* Content Area */
.content-area {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
  .nav-text,
  .logo-text {
    display: none;
  }
  .nav-item {
    justify-content: center;
    padding: 0.75rem;
  }
  .nav-icon {
    font-size: 1.25rem;
  }
}
</style>
