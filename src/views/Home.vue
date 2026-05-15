<template>
  <div class="home-page">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">
          <span class="logo-icon">&#x1F4DD;</span>
          <span class="logo-text">在线考试系统</span>
        </router-link>
        <div class="nav-links">
          <router-link to="/exam/list" class="nav-link">考试列表</router-link>
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

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">在线考试系统</h1>
        <p class="hero-description">
          高效便捷的在线考试平台，支持多种题型、实时评分、错题记录等功能，助您轻松备考，提升学习效率。
        </p>
        <div class="hero-buttons">
          <router-link to="/exam/list" class="btn btn-primary">开始考试</router-link>
          <router-link to="/wrong-questions" class="btn btn-secondary">查看错题</router-link>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2 class="section-title">系统特性</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">&#x1F4DA;</div>
          <h3 class="feature-title">丰富题库</h3>
          <p class="feature-desc">支持单选、多选、判断、填空、问答等多种题型，满足不同考试需求</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">&#x26A1;</div>
          <h3 class="feature-title">实时评分</h3>
          <p class="feature-desc">交卷后即时生成成绩报告，详细展示每道题的答题情况和解析</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">&#x1F4C4;</div>
          <h3 class="feature-title">错题记录</h3>
          <p class="feature-desc">自动收集错题，支持分类筛选和错题练习，针对性复习提升</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">&#x1F4C1;</div>
          <h3 class="feature-title">PDF导入</h3>
          <p class="feature-desc">支持从PDF文件导入试卷，快速创建考试，节省备课时间</p>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="statistics">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ examCount }}</div>
          <div class="stat-label">试卷数量</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ questionCount }}</div>
          <div class="stat-label">题目数量</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ userCount }}</div>
          <div class="stat-label">用户数量</div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>&copy; {{ new Date().getFullYear() }} 云南意念科技有限公司 All Rights Reserved</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { secureStorage } from '../utils/security'
import { examApi, questionApi, userApi } from '../api'
import type { User } from '../types'

const router = useRouter()
const user = ref<User | null>(null)
const examCount = ref(0)
const questionCount = ref(0)
const userCount = ref(0)

onMounted(() => {
  user.value = secureStorage.getItem<User>('user')
  examCount.value = examApi.getAllExams().filter(e => e.status === 'published').length
  questionCount.value = questionApi.getAllQuestions().length
  userCount.value = userApi.getAllUsers().length
})

function handleLogout() {
  userApi.logout()
  user.value = null
  router.push('/')
}
</script>

<style scoped>
.home-page {
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
  padding: 0.5rem 0;
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

/* Hero Section */
.hero {
  padding: 8rem 1.5rem 4rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
  letter-spacing: 2px;
}

.hero-description {
  font-size: 1.15rem;
  line-height: 1.8;
  opacity: 0.9;
  margin-bottom: 2.5rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.85rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary {
  background: #fff;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.6);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #fff;
}

.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -80px;
  right: -60px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -40px;
  left: -40px;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 40%;
  left: 10%;
}

/* Features Section */
.features {
  padding: 4rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 2.5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
}

.feature-desc {
  font-size: 0.9rem;
  color: #777;
  line-height: 1.6;
}

/* Statistics Section */
.statistics {
  padding: 3rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-grid {
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.stat-item {
  text-align: center;
  color: #fff;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.85;
}

/* Footer */
.footer {
  text-align: center;
  padding: 2rem 1.5rem;
  color: #999;
  font-size: 0.85rem;
  background: #fff;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  .hero-description {
    font-size: 1rem;
  }
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .nav-links {
    gap: 0.75rem;
  }
}
</style>
