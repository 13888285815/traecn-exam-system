<template>
  <div class="user-dashboard">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 数据展示 -->
    <template v-else>
      <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #e6f7ff;">
            <el-icon :size="32" color="#1890ff"><Collection /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalExams }}</div>
            <div class="stat-label">参加考试</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #fff7e6;">
            <el-icon :size="32" color="#faad14"><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.avgScore }}</div>
            <div class="stat-label">平均分数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #f6ffed;">
            <el-icon :size="32" color="#52c41a"><Trophy /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.passRate }}%</div>
            <div class="stat-label">通过率</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #fff1f0;">
            <el-icon :size="32" color="#ff4d4f"><WarnTriangleFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.wrongCount }}</div>
            <div class="stat-label">错题数量</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 24px">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近考试</span>
              <el-button type="primary" link @click="$router.push('/user/records')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentExams" stripe>
            <el-table-column prop="examName" label="考试名称" />
            <el-table-column prop="score" label="分数" width="80">
              <template #default="{ row }">
                <el-tag :type="getScoreTagType(row.score)">{{ row.score }}分</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="考试时间" width="120" />
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>我的错题</span>
              <el-button type="primary" link @click="$router.push('/user/wrong')">查看全部</el-button>
            </div>
          </template>
          <div v-if="recentWrong.length === 0">
            <el-empty description="暂无错题记录" />
          </div>
          <div v-else class="wrong-list">
            <div v-for="item in recentWrong" :key="item.id" class="wrong-item">
              <div class="wrong-content">
                <span class="wrong-type">{{ getQuestionTypeLabel(item.type) }}</span>
                <p class="wrong-question">{{ item.content }}</p>
              </div>
              <el-tag size="small" type="danger">答错 {{ item.wrongCount }} 次</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" style="margin-top: 24px">
      <template #header>
        <div class="card-header">
          <span>快捷操作</span>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <div class="quick-action" @click="$router.push('/exam')">
            <el-icon :size="32" color="#4A6CF7"><EditPen /></el-icon>
            <span>开始考试</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="quick-action" @click="$router.push('/user/wrong')">
            <el-icon :size="32" color="#E6A23C"><WarnTriangleFilled /></el-icon>
            <span>错题练习</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="quick-action" @click="$router.push('/user/records')">
            <el-icon :size="32" color="#67C23A"><TrendCharts /></el-icon>
            <span>成绩查询</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="quick-action" @click="$router.push('/question')">
            <el-icon :size="32" color="#909399"><Collection /></el-icon>
            <span>题库浏览</span>
          </div>
        </el-col>
      </el-row>
    </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Collection, TrendCharts, Trophy, WarnTriangleFilled, EditPen } from '@element-plus/icons-vue'
import { examRecordApi, wrongQuestionApi } from '../../../api'
import { useAuthStore } from '../../../stores/auth'
import type { QuestionType } from '../../../types'

const authStore = useAuthStore()
const loading = ref(true)

const stats = ref({
  totalExams: 0,
  avgScore: 0,
  passRate: 0,
  wrongCount: 0
})

const recentExams = ref<any[]>([])

const recentWrong = ref<any[]>([])

function getScoreTagType(score: number) {
  if (score >= 90) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

function getQuestionTypeLabel(type: QuestionType) {
  const map: Record<QuestionType, string> = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    fill: '填空题',
    essay: '问答题'
  }
  return map[type] || '未知'
}

async function loadData() {
  loading.value = true
  try {
    const userId = authStore.user?.id
    if (!userId) {
      loading.value = false
      return
    }

    const records = examRecordApi.getRecordsByUserId(userId)
    stats.value.totalExams = records.length

    if (records.length > 0) {
      const totalScore = records.reduce((sum, r) => sum + r.score, 0)
      stats.value.avgScore = Math.round(totalScore / records.length)

      const passedCount = records.filter(r => r.score >= 60).length
      stats.value.passRate = Math.round((passedCount / records.length) * 100)

      recentExams.value = records.slice(0, 5).map(r => ({
        examName: `考试 #${r.examId}`,
        score: r.score,
        time: new Date(r.endTime).toLocaleDateString()
      }))
    }

    const wrongQuestions = wrongQuestionApi.getWrongQuestionsByUserId(userId)
    stats.value.wrongCount = wrongQuestions.length
    recentWrong.value = wrongQuestions.slice(0, 3).map(wq => ({
      id: wq.id,
      type: wq.question.type,
      content: wq.question.content,
      wrongCount: wq.wrongCount
    }))
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-dashboard {
  padding: 0;
}

.loading-container {
  padding: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wrong-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.wrong-content {
  flex: 1;
  min-width: 0;
}

.wrong-type {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  display: block;
}

.wrong-question {
  font-size: 14px;
  color: #606266;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  background: #f5f7fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-action:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.quick-action span {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 12px;
  }
}
</style>
