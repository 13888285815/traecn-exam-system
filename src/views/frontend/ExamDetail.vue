<template>
  <div class="exam-detail-page" v-if="exam">
    <!-- ==================== 试卷信息 ==================== -->
    <el-card shadow="never" class="exam-header">
      <div class="header-content">
        <div class="header-left">
          <el-button link @click="$router.push('/exam')">
            <el-icon><ArrowLeft /></el-icon> 返回考试列表
          </el-button>
          <h1 class="exam-title">{{ exam.title }}</h1>
          <p class="exam-desc">{{ exam.description }}</p>
          <div class="exam-tags">
            <el-tag type="primary">{{ exam.bankName }}</el-tag>
            <el-tag v-if="exam.status === 'published'" type="success">已发布</el-tag>
            <el-tag v-else type="info">草稿</el-tag>
          </div>
        </div>
        <div class="header-right">
          <el-button type="primary" size="large" @click="startExam">
            <el-icon><VideoPlay /></el-icon> 开始考试
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- ==================== 考试信息卡片 ==================== -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="info-card">
          <div class="info-icon" style="background: #EEF2FF;">
            <el-icon :size="28" color="#4A6CF7"><Clock /></el-icon>
          </div>
          <div class="info-value">{{ exam.duration }}</div>
          <div class="info-label">考试时长（分钟）</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="info-card">
          <div class="info-icon" style="background: #F0F9EB;">
            <el-icon :size="28" color="#67C23A"><Trophy /></el-icon>
          </div>
          <div class="info-value">{{ exam.totalScore }}</div>
          <div class="info-label">总分</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="info-card">
          <div class="info-icon" style="background: #FDF6EC;">
            <el-icon :size="28" color="#E6A23C"><Medal /></el-icon>
          </div>
          <div class="info-value">{{ exam.passScore }}</div>
          <div class="info-label">及格分</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="info-card">
          <div class="info-icon" style="background: #FEF0F0;">
            <el-icon :size="28" color="#F56C6C"><Document /></el-icon>
          </div>
          <div class="info-value">{{ exam.questionIds.length }}</div>
          <div class="info-label">题目数量</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ==================== 注意事项 ==================== -->
    <el-card shadow="never" class="notice-card">
      <template #header>
        <h2>考试注意事项</h2>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(notice, index) in notices"
          :key="index"
          :type="notice.type"
          :hollow="false"
        >
          <p>{{ notice.text }}</p>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>

  <div v-else class="loading-wrap">
    <el-empty description="试卷不存在" />
    <el-button type="primary" @click="$router.push('/exam')">返回考试列表</el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Clock, Trophy, Medal, Document, VideoPlay } from '@element-plus/icons-vue'
import { mockExamPapers } from '../../data/mockData'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// ---- 试卷信息 ----
const exam = computed(() => {
  const id = Number(route.params.id)
  return mockExamPapers.find(e => e.id === id)
})

// ---- 注意事项 ----
const notices = [
  { text: '考试开始后请勿刷新或关闭页面，否则可能导致答题进度丢失。', type: 'danger' as const },
  { text: '考试时间为 ' + (exam.value?.duration || 0) + ' 分钟，倒计时结束后系统将自动提交试卷。', type: 'warning' as const },
  { text: '及格分数为 ' + (exam.value?.passScore || 0) + ' 分，请合理分配答题时间。', type: 'primary' as const },
  { text: '单选题和多选题请点击选项进行选择，判断题请选择"正确"或"错误"。', type: 'primary' as const },
  { text: '填空题请直接输入答案，问答题请在文本框中作答。', type: 'primary' as const },
  { text: '考试过程中可随时查看已答题目的导航，方便跳转。', type: 'success' as const },
  { text: '提交前请仔细检查答案，提交后无法修改。', type: 'warning' as const }
]

// ---- 操作 ----
function startExam() {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (exam.value) {
    router.push(`/exam/take/${exam.value.id}`)
  }
}
</script>

<style scoped>
.exam-detail-page {
  max-width: 100%;
}

/* ==================== 头部 ==================== */
.exam-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 12px;
}

.exam-desc {
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
  margin-bottom: 16px;
}

.exam-tags {
  display: flex;
  gap: 8px;
}

.header-right {
  flex-shrink: 0;
}

/* ==================== 信息卡片 ==================== */
.info-card {
  text-align: center;
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.info-card:hover {
  transform: translateY(-4px);
}

.info-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.info-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.info-label {
  font-size: 13px;
  color: #909399;
}

/* ==================== 注意事项 ==================== */
.notice-card {
  margin-top: 24px;
}

.notice-card h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.notice-card p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.loading-wrap {
  text-align: center;
  padding: 80px 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }
}
</style>
