<template>
  <div class="exam-result-page" v-if="result">
    <!-- ==================== 顶部成绩概览 ==================== -->
    <el-card shadow="never" class="score-card">
      <div class="score-content">
        <div class="score-circle">
          <el-progress
            type="circle"
            :percentage="scorePercent"
            :width="160"
            :stroke-width="12"
            :color="scoreColor"
          >
            <template #default>
              <div class="score-inner">
                <div class="score-value">{{ result.score }}</div>
                <div class="score-total">/ {{ result.totalScore }}</div>
              </div>
            </template>
          </el-progress>
        </div>
        <div class="score-details">
          <div class="detail-item">
            <div class="detail-icon" style="background: #EEF2FF;">
              <el-icon :size="24" color="#4A6CF7"><Clock /></el-icon>
            </div>
            <div>
              <div class="detail-value">{{ formatTime(result.timeSpent) }}</div>
              <div class="detail-label">用时</div>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-icon" style="background: #F0F9EB;">
              <el-icon :size="24" color="#67C23A"><Select /></el-icon>
            </div>
            <div>
              <div class="detail-value">{{ correctRate }}%</div>
              <div class="detail-label">正确率</div>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-icon" style="background: #FDF6EC;">
              <el-icon :size="24" color="#E6A23C"><Trophy /></el-icon>
            </div>
            <div>
              <div class="detail-value">{{ result.results.filter(r => r.isCorrect).length }} / {{ result.results.length }}</div>
              <div class="detail-label">正确题数</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- ==================== 答题详情列表 ==================== -->
    <el-card shadow="never" class="detail-card">
      <template #header>
        <div class="card-header">
          <h2>答题详情</h2>
          <el-tag :type="result.score >= result.totalScore * 0.6 ? 'success' : 'danger'" size="large">
            {{ result.score >= result.totalScore * 0.6 ? '已通过' : '未通过' }}
          </el-tag>
        </div>
      </template>

      <div class="result-list">
        <div
          v-for="(item, index) in result.results"
          :key="item.questionId"
          class="result-item"
          :class="{ 'result-correct': item.isCorrect, 'result-wrong': !item.isCorrect }"
        >
          <div class="result-top">
            <span class="result-index">第 {{ index + 1 }} 题</span>
            <el-tag :type="typeTagMap[item.question.type]" size="small">
              {{ typeNameMap[item.question.type] }}
            </el-tag>
            <el-tag :type="item.isCorrect ? 'success' : 'danger'" size="small">
              {{ item.isCorrect ? '正确' : '错误' }}
            </el-tag>
            <span class="result-score">{{ item.question.score }} 分</span>
          </div>

          <div class="result-question">{{ item.question.content }}</div>

          <div class="result-answers">
            <div class="answer-row">
              <span class="answer-label">你的答案：</span>
              <span :class="item.isCorrect ? 'text-success' : 'text-danger'">
                {{ item.userAnswer || '未作答' }}
              </span>
            </div>
            <div v-if="!item.isCorrect" class="answer-row">
              <span class="answer-label">正确答案：</span>
              <span class="text-success">{{ item.correctAnswer }}</span>
            </div>
          </div>

          <div class="result-analysis" v-if="item.question.analysis">
            <strong>解析：</strong>{{ item.question.analysis }}
          </div>
        </div>
      </div>
    </el-card>

    <!-- ==================== 底部操作 ==================== -->
    <div class="bottom-actions">
      <el-button type="primary" size="large" @click="$router.push('/exam')">
        <el-icon><ArrowLeft /></el-icon> 返回考试列表
      </el-button>
    </div>
  </div>

  <div v-else class="loading-wrap">
    <el-empty description="暂无考试结果" />
    <el-button type="primary" @click="$router.push('/exam')">返回考试列表</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Clock, Select, Trophy, ArrowLeft } from '@element-plus/icons-vue'

interface ExamResultData {
  examId: number
  examTitle: string
  totalScore: number
  score: number
  timeSpent: number
  results: {
    questionId: number
    question: {
      id: number
      type: string
      content: string
      options?: string[]
      answer: string
      analysis: string
      score: number
      difficulty: number
      category: string
    }
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
  }[]
}

const route = useRoute()
const result = ref<ExamResultData | null>(null)

// ---- 类型映射 ----
const typeNameMap: Record<string, string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  fill: '填空题',
  essay: '问答题'
}

const typeTagMap: Record<string, string> = {
  single: '',
  multiple: 'success',
  judge: 'warning',
  fill: 'info',
  essay: 'danger'
}

// ---- 计算 ----
const scorePercent = computed(() => {
  if (!result.value) return 0
  return Math.round((result.value.score / result.value.totalScore) * 100)
})

const scoreColor = computed(() => {
  if (scorePercent.value >= 80) return '#67C23A'
  if (scorePercent.value >= 60) return '#E6A23C'
  return '#F56C6C'
})

const correctRate = computed(() => {
  if (!result.value || result.value.results.length === 0) return 0
  const correct = result.value.results.filter(r => r.isCorrect).length
  return Math.round((correct / result.value.results.length) * 100)
})

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m} 分 ${s} 秒`
}

// ---- 生命周期 ----
onMounted(() => {
  const data = sessionStorage.getItem('exam_result')
  if (data) {
    try {
      result.value = JSON.parse(data)
    } catch {
      result.value = null
    }
  }
})
</script>

<style scoped>
.exam-result-page {
  max-width: 100%;
}

/* ==================== 成绩概览 ==================== */
.score-card {
  margin-bottom: 24px;
}

.score-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 64px;
  padding: 24px 0;
}

.score-circle {
  flex-shrink: 0;
}

.score-inner {
  text-align: center;
}

.score-value {
  font-size: 36px;
  font-weight: 700;
  color: #303133;
}

.score-total {
  font-size: 14px;
  color: #909399;
}

.score-details {
  display: flex;
  gap: 40px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-value {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.detail-label {
  font-size: 13px;
  color: #909399;
}

/* ==================== 答题详情 ==================== */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  padding: 16px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  border-left: 4px solid;
}

.result-correct {
  border-left-color: #67C23A;
}

.result-wrong {
  border-left-color: #F56C6C;
}

.result-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.result-index {
  font-size: 14px;
  font-weight: 600;
  color: #4A6CF7;
}

.result-score {
  margin-left: auto;
  font-size: 13px;
  color: #909399;
}

.result-question {
  font-size: 15px;
  color: #303133;
  line-height: 1.6;
  margin-bottom: 12px;
}

.result-answers {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.answer-row {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.answer-label {
  color: #909399;
  flex-shrink: 0;
}

.text-success {
  color: #67C23A;
  font-weight: 600;
}

.text-danger {
  color: #F56C6C;
  font-weight: 600;
}

.result-analysis {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  padding: 10px 12px;
  background: #F5F7FA;
  border-radius: 6px;
}

.result-analysis strong {
  color: #303133;
}

/* ==================== 底部 ==================== */
.bottom-actions {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

.loading-wrap {
  text-align: center;
  padding: 80px 0;
}

@media (max-width: 768px) {
  .score-content {
    flex-direction: column;
    gap: 32px;
  }

  .score-details {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
