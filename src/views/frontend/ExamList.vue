<template>
  <div class="exam-list-page">
    <!-- ==================== Tab 切换 ==================== -->
    <el-tabs v-model="activeTab" class="exam-tabs">
      <!-- ==================== 标准模式 ==================== -->
      <el-tab-pane label="标准模式" name="standard">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" v-for="exam in publishedExams" :key="exam.id">
            <el-card shadow="hover" class="exam-card">
              <div class="exam-icon">
                <el-icon :size="40" color="#4A6CF7"><EditPen /></el-icon>
              </div>
              <h3 class="exam-title">{{ exam.title }}</h3>
              <p class="exam-desc">{{ exam.description }}</p>
              <div class="exam-meta">
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ exam.duration }} 分钟</span>
                </div>
                <div class="meta-item">
                  <el-icon><Trophy /></el-icon>
                  <span>总分 {{ exam.totalScore }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Document /></el-icon>
                  <span>{{ exam.questionIds.length }} 题</span>
                </div>
              </div>
              <div class="exam-actions">
                <el-button type="primary" @click="$router.push(`/exam/${exam.id}`)">
                  查看详情
                </el-button>
                <el-button type="success" @click="startExam(exam.id)">
                  开始考试
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-empty v-if="publishedExams.length === 0" description="暂无可用考试" />
      </el-tab-pane>

      <!-- ==================== 无尽模式 ==================== -->
      <el-tab-pane label="无尽模式" name="endless">
        <el-card shadow="never" class="endless-card">
          <div class="endless-content">
            <div class="endless-icon">
              <el-icon :size="64" color="#4A6CF7"><RefreshRight /></el-icon>
            </div>
            <h2>无尽练习模式</h2>
            <p class="endless-desc">
              系统将从所有题库中随机抽取题目，不限题量，不限时间，适合日常刷题练习。
              每答完一题即可查看答案与解析，帮助您巩固知识点。
            </p>
            <div class="endless-features">
              <div class="feature-item">
                <el-icon color="#67C23A"><CircleCheck /></el-icon>
                <span>随机出题，每次体验不同</span>
              </div>
              <div class="feature-item">
                <el-icon color="#67C23A"><CircleCheck /></el-icon>
                <span>不限时间，轻松练习</span>
              </div>
              <div class="feature-item">
                <el-icon color="#67C23A"><CircleCheck /></el-icon>
                <span>即时反馈，快速提升</span>
              </div>
              <div class="feature-item">
                <el-icon color="#67C23A"><CircleCheck /></el-icon>
                <span>覆盖全学科，综合提升</span>
              </div>
            </div>
            <el-button type="primary" size="large" @click="startEndless">
              <el-icon><VideoPlay /></el-icon> 开始练习
            </el-button>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  EditPen, Clock, Trophy, Document, RefreshRight,
  CircleCheck, VideoPlay
} from '@element-plus/icons-vue'
import { mockExamPapers } from '../../data/mockData'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const activeTab = ref('standard')

// ---- 已发布考试 ----
const publishedExams = computed(() =>
  mockExamPapers.filter(e => e.status === 'published')
)

// ---- 操作 ----
function startExam(id: number) {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push(`/exam/take/${id}`)
}

function startEndless() {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  ElMessage.info('无尽模式即将开放，敬请期待！')
}
</script>

<style scoped>
.exam-list-page {
  max-width: 100%;
}

.exam-tabs {
  margin-top: 8px;
}

/* ==================== 考试卡片 ==================== */
.exam-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.exam-card:hover {
  transform: translateY(-4px);
}

.exam-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #EEF2FF, #E8ECFF);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.exam-title {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.exam-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.exam-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
}

.exam-actions {
  display: flex;
  gap: 12px;
}

/* ==================== 无尽模式 ==================== */
.endless-card {
  margin-top: 16px;
}

.endless-content {
  text-align: center;
  padding: 32px 0;
}

.endless-icon {
  margin-bottom: 20px;
}

.endless-content h2 {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 12px;
}

.endless-desc {
  font-size: 15px;
  color: #909399;
  line-height: 1.8;
  max-width: 600px;
  margin: 0 auto 24px;
}

.endless-features {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}
</style>
