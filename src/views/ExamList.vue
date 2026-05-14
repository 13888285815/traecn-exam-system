<template>
  <div class="exam-list-page">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">
          <span class="logo-icon">&#x1F4DD;</span>
          <span class="logo-text">在线考试系统</span>
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/wrong-questions" class="nav-link">错题库</router-link>
          <router-link v-if="user && user.role === 'admin'" to="/admin/users" class="nav-link">管理后台</router-link>
          <div v-if="user" class="nav-user">
            <span class="user-name">{{ user.name }}</span>
            <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
          </div>
          <router-link v-else to="/login" class="nav-link login-btn">登录</router-link>
        </div>
      </div>
    </nav>

    <div class="page-content">
      <h1 class="page-title">考试列表</h1>

      <!-- Mode Selection -->
      <div class="mode-section">
        <div class="mode-card" @click="scrollToExams">
          <div class="mode-icon">&#x1F4DD;</div>
          <h3>标准模式</h3>
          <p>选择试卷，限时完成考试</p>
        </div>
        <div class="mode-card" @click="startEndlessMode">
          <div class="mode-icon">&#x1F504;</div>
          <h3>无尽模式</h3>
          <p>随机题目，无限练习</p>
        </div>
      </div>

      <!-- Exam Cards -->
      <div ref="examSectionRef" class="exam-section">
        <h2 class="section-title">可用试卷</h2>
        <div v-if="publishedExams.length > 0" class="exam-grid">
          <div v-for="exam in publishedExams" :key="exam.id" class="exam-card">
            <div class="exam-card-header">
              <h3 class="exam-card-title">{{ exam.title }}</h3>
              <el-tag :type="getExamStatusType(exam)" size="small">{{ getExamStatusText(exam) }}</el-tag>
            </div>
            <p class="exam-card-desc">{{ exam.description || '暂无描述' }}</p>
            <div class="exam-card-info">
              <div class="info-item">
                <span class="info-icon">&#x23F1;</span>
                <span>{{ exam.duration }}分钟</span>
              </div>
              <div class="info-item">
                <span class="info-icon">&#x2B50;</span>
                <span>{{ exam.totalScore }}分</span>
              </div>
              <div class="info-item">
                <span class="info-icon">&#x1F4DD;</span>
                <span>{{ exam.questions.length }}题</span>
              </div>
            </div>
            <div class="exam-card-footer">
              <el-button type="primary" @click="startExam(exam.id)">开始考试</el-button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">&#x1F4ED;</div>
          <p>暂无可用试卷</p>
          <span>请等待管理员发布试卷</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { secureStorage } from '../utils/security'
import { examApi, userApi } from '../api'
import type { User, Exam } from '../types'

const router = useRouter()
const user = ref<User | null>(null)
const examSectionRef = ref<HTMLElement | null>(null)

const publishedExams = computed(() => {
  return examApi.getAllExams().filter(e => e.status === 'published')
})

onMounted(() => {
  user.value = secureStorage.getItem<User>('user')
})

function getExamStatusType(exam: Exam): 'success' | 'info' | 'warning' {
  if (exam.status === 'published') return 'success'
  return 'info'
}

function getExamStatusText(exam: Exam): string {
  if (exam.status === 'published') return '已发布'
  return '草稿'
}

function scrollToExams() {
  examSectionRef.value?.scrollIntoView({ behavior: 'smooth' })
}

function startExam(examId: number) {
  router.push(`/exam/take/${examId}`)
}

function startEndlessMode() {
  router.push('/exam/take/0')
}

function handleLogout() {
  userApi.logout()
  user.value = null
  router.push('/')
}
</script>

<style scoped>
.exam-list-page {
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

.logo-icon {
  font-size: 1.5rem;
}

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

.nav-link:hover {
  color: #667eea;
}

.login-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff !important;
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-weight: 500;
}

.login-btn:hover {
  opacity: 0.9;
  color: #fff !important;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 1.5rem 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 2rem;
}

/* Mode Section */
.mode-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.mode-card {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  border: 2px solid transparent;
}

.mode-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.mode-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.mode-card h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.mode-card p {
  color: #999;
  font-size: 0.9rem;
}

/* Exam Section */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
}

.exam-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.exam-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.exam-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.exam-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.exam-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.exam-card-desc {
  color: #777;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.exam-card-info {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #666;
  font-size: 0.85rem;
}

.info-icon {
  font-size: 1rem;
}

.exam-card-footer {
  display: flex;
  justify-content: flex-end;
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

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.empty-state span {
  font-size: 0.9rem;
  color: #bbb;
}

@media (max-width: 768px) {
  .exam-grid {
    grid-template-columns: 1fr;
  }
}
</style>
