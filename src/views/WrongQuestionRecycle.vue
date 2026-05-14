<template>
  <div class="recycle-page">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">
          <span class="logo-icon">&#x1F4DD;</span>
          <span class="logo-text">在线考试系统</span>
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/exam/list" class="nav-link">考试列表</router-link>
          <router-link to="/wrong-questions" class="nav-link">错题库</router-link>
          <div v-if="user" class="nav-user">
            <span class="user-name">{{ user.name }}</span>
            <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
          </div>
          <router-link v-else to="/login" class="nav-link login-btn">登录</router-link>
        </div>
      </div>
    </nav>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">错题回收站</h1>
        <div class="header-actions">
          <el-button @click="handleSelectAll">
            {{ isAllSelected ? '取消全选' : '全选' }}
          </el-button>
          <el-button type="success" @click="handleBatchRestore" :disabled="selectedIds.length === 0">
            批量恢复 ({{ selectedIds.length }})
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedIds.length === 0">
            批量删除 ({{ selectedIds.length }})
          </el-button>
          <el-button type="danger" plain @click="handleClearAll" :disabled="recycleItems.length === 0">
            清空回收站
          </el-button>
        </div>
      </div>

      <!-- Recycle List -->
      <div v-if="recycleItems.length > 0" class="recycle-list">
        <div
          v-for="item in recycleItems"
          :key="item.id"
          class="recycle-card"
          :class="{ 'recycle-selected': selectedIds.includes(item.questionId) }"
        >
          <div class="recycle-checkbox">
            <el-checkbox
              :model-value="selectedIds.includes(item.questionId)"
              @change="toggleSelect(item.questionId)"
            />
          </div>
          <div class="recycle-content">
            <div class="recycle-meta">
              <el-tag :type="getTypeTag(item.question.type)" size="small">
                {{ getTypeText(item.question.type) }}
              </el-tag>
              <el-tag type="info" size="small">{{ item.question.category }}</el-tag>
              <span class="recycle-time">删除于 {{ formatDate(item.deletedAt) }}</span>
            </div>
            <p class="recycle-question">{{ item.question.content }}</p>
            <div class="recycle-info">
              <span>错误 {{ item.wrongCount }} 次</span>
              <span>你的答案：{{ item.userAnswer }}</span>
              <span>正确答案：<span class="text-correct">{{ item.question.answer }}</span></span>
            </div>
          </div>
          <div class="recycle-actions">
            <el-button type="success" size="small" @click="handleRestore(item.questionId)">恢复</el-button>
            <el-button type="danger" size="small" @click="handleDelete(item.questionId)">永久删除</el-button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">&#x1F5D1;</div>
        <p>回收站为空</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { secureStorage } from '../utils/security'
import { wrongQuestionApi, userApi } from '../api'
import type { User, WrongQuestionRecycleItem } from '../types'

const router = useRouter()
const user = ref<User | null>(null)
const recycleItems = ref<WrongQuestionRecycleItem[]>([])
const selectedIds = ref<number[]>([])

const isAllSelected = computed(() => {
  return recycleItems.value.length > 0 && selectedIds.value.length === recycleItems.value.length
})

onMounted(() => {
  user.value = secureStorage.getItem<User>('user')
  if (user.value) {
    recycleItems.value = wrongQuestionApi.getRecycleBin(user.value.id)
  }
})

function getTypeTag(type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    single: 'primary', multiple: 'success', judge: 'warning', fill: 'info', essay: 'danger'
  }
  return map[type] || 'primary'
}

function getTypeText(type: string): string {
  const map: Record<string, string> = {
    single: '单选题', multiple: '多选题', judge: '判断题', fill: '填空题', essay: '问答题'
  }
  return map[type] || '未知'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

function toggleSelect(questionId: number) {
  const idx = selectedIds.value.indexOf(questionId)
  if (idx === -1) {
    selectedIds.value.push(questionId)
  } else {
    selectedIds.value.splice(idx, 1)
  }
}

function handleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = recycleItems.value.map(item => item.questionId)
  }
}

function handleRestore(questionId: number) {
  if (!user.value) return
  try {
    wrongQuestionApi.restoreFromRecycleBin(user.value.id, questionId)
    recycleItems.value = wrongQuestionApi.getRecycleBin(user.value.id)
    selectedIds.value = selectedIds.value.filter(id => id !== questionId)
    ElMessage.success('已恢复')
  } catch (error: any) {
    ElMessage.error(error.message)
  }
}

function handleDelete(questionId: number) {
  if (!user.value) return
  ElMessageBox.confirm('永久删除后不可恢复，确定要删除吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    wrongQuestionApi.deleteFromRecycleBin(user.value!.id, questionId)
    recycleItems.value = wrongQuestionApi.getRecycleBin(user.value!.id)
    selectedIds.value = selectedIds.value.filter(id => id !== questionId)
    ElMessage.success('已永久删除')
  }).catch(() => {})
}

function handleBatchRestore() {
  if (!user.value) return
  for (const questionId of selectedIds.value) {
    try {
      wrongQuestionApi.restoreFromRecycleBin(user.value.id, questionId)
    } catch { /* skip */ }
  }
  recycleItems.value = wrongQuestionApi.getRecycleBin(user.value.id)
  selectedIds.value = []
  ElMessage.success('批量恢复成功')
}

function handleBatchDelete() {
  if (!user.value) return
  ElMessageBox.confirm(`确定要永久删除选中的 ${selectedIds.value.length} 条记录吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    for (const questionId of selectedIds.value) {
      wrongQuestionApi.deleteFromRecycleBin(user.value!.id, questionId)
    }
    recycleItems.value = wrongQuestionApi.getRecycleBin(user.value!.id)
    selectedIds.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

function handleClearAll() {
  if (!user.value) return
  ElMessageBox.confirm('确定要清空回收站吗？所有记录将被永久删除。', '清空回收站', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    for (const item of recycleItems.value) {
      wrongQuestionApi.deleteFromRecycleBin(user.value!.id, item.questionId)
    }
    recycleItems.value = []
    selectedIds.value = []
    ElMessage.success('回收站已清空')
  }).catch(() => {})
}

function handleLogout() {
  userApi.logout()
  user.value = null
  router.push('/')
}
</script>

<style scoped>
.recycle-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.logo-icon { font-size: 1.5rem; }

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: #555;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.nav-link:hover { color: #667eea; }

.login-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff !important;
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-weight: 500;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  color: #333;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Page Content */
.page-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 5rem 1.5rem 2rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Recycle List */
.recycle-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recycle-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
  transition: all 0.2s;
}

.recycle-selected {
  border-color: #667eea;
  background: #f8f9ff;
}

.recycle-checkbox {
  padding-top: 0.25rem;
  flex-shrink: 0;
}

.recycle-content {
  flex: 1;
}

.recycle-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.recycle-time {
  font-size: 0.8rem;
  color: #bbb;
}

.recycle-question {
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 0.5rem;
}

.recycle-info {
  display: flex;
  gap: 1.25rem;
  font-size: 0.85rem;
  color: #888;
}

.text-correct {
  color: #52c41a;
  font-weight: 500;
}

.recycle-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 1.5rem;
  color: #999;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .recycle-card {
    flex-direction: column;
  }
  .recycle-actions {
    flex-direction: row;
  }
}
</style>
