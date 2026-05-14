<template>
  <div class="exam-result-page" v-if="record">
    <!-- Header -->
    <div class="result-header">
      <h1>考试结果</h1>
      <el-button @click="goBack">返回考试列表</el-button>
    </div>

    <!-- Score Circle -->
    <div class="score-section">
      <div class="score-circle" :class="scoreClass">
        <svg viewBox="0 0 120 120" class="score-ring">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e8e8e8" stroke-width="8" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            :stroke="scoreColor"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div class="score-text">
          <div class="score-number">{{ record.score }}</div>
          <div class="score-total">/ {{ record.totalScore || exam?.totalScore || 0 }}</div>
        </div>
      </div>
      <div class="score-label" :style="{ color: scoreColor }">{{ scoreLabel }}</div>
    </div>

    <!-- Statistics -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-value correct">{{ correctCount }}</div>
        <div class="stat-label">答对</div>
      </div>
      <div class="stat-card">
        <div class="stat-value wrong">{{ wrongCount }}</div>
        <div class="stat-label">答错</div>
      </div>
      <div class="stat-card">
        <div class="stat-value unanswered">{{ unansweredCount }}</div>
        <div class="stat-label">未答</div>
      </div>
      <div class="stat-card">
        <div class="stat-value rate">{{ accuracyRate }}%</div>
        <div class="stat-label">正确率</div>
      </div>
    </div>

    <!-- Answer Details -->
    <div class="details-section">
      <h2 class="section-title">答题详情</h2>
      <div class="details-list">
        <template v-for="(answer, index) in record.answers" :key="answer.id">
        <div
          class="detail-card"
          :class="{ 'detail-correct': answer.isCorrect, 'detail-wrong': !answer.isCorrect && answer.answer }"
        >
          <div class="detail-header">
            <span class="detail-index">第 {{ index + 1 }} 题</span>
            <el-tag :type="answer.isCorrect ? 'success' : (answer.answer ? 'danger' : 'info')" size="small">
              {{ answer.isCorrect ? '正确' : (answer.answer ? '错误' : '未答') }}
            </el-tag>
          </div>
          <p class="detail-question">{{ getQuestionContent(answer.questionId) }}</p>

          <!-- Show options for choice questions -->
          <div v-if="getQuestion(answer.questionId)?.options" class="detail-options">
            <div
              v-for="(option, idx) in getQuestion(answer.questionId)!.options"
              :key="idx"
              class="detail-option"
              :class="{
                'option-correct': getOptionLabel(idx) === getQuestion(answer.questionId)!.answer,
                'option-wrong-user': getOptionLabel(idx) === answer.answer && !answer.isCorrect
              }"
            >
              <span class="option-label">{{ getOptionLabel(idx) }}. {{ option }}</span>
            </div>
          </div>

          <div class="detail-answers">
            <p v-if="answer.answer">
              <span class="answer-label">你的答案：</span>
              <span :class="answer.isCorrect ? 'text-correct' : 'text-wrong'">{{ formatAnswer(answer) }}</span>
            </p>
            <p v-else>
              <span class="answer-label">你的答案：</span>
              <span class="text-muted">未作答</span>
            </p>
            <p>
              <span class="answer-label">正确答案：</span>
              <span class="text-correct">{{ getQuestion(answer.questionId)?.answer }}</span>
            </p>
          </div>

          <div v-if="getQuestion(answer.questionId)?.analysis" class="detail-analysis">
            <p><strong>解析：</strong>{{ getQuestion(answer.questionId)?.analysis }}</p>
          </div>
        </div>
        </template>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <p>未找到考试记录</p>
    <el-button type="primary" @click="goBack">返回考试列表</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { examRecordApi, examApi } from '../api'
import type { ExamRecord, Question, Exam } from '../types'

const router = useRouter()
const route = useRoute()

const recordId = computed(() => Number(route.params.id))
const record = ref<ExamRecord | null>(null)
const questions = ref<Question[]>([])
const exam = ref<Exam | undefined>(undefined)

const circumference = 2 * Math.PI * 54

onMounted(() => {
  record.value = examRecordApi.getRecordById(recordId.value) || null
  if (record.value) {
    exam.value = examApi.getExamById(record.value.paperId)
    if (exam.value) {
      questions.value = exam.value.questions
    }
  }
})

const correctCount = computed(() => record.value?.answers.filter(a => a.isCorrect).length || 0)
const wrongCount = computed(() => record.value?.answers.filter(a => !a.isCorrect && a.answer).length || 0)
const unansweredCount = computed(() => record.value?.answers.filter(a => !a.answer).length || 0)
const totalAnswered = computed(() => correctCount.value + wrongCount.value)
const accuracyRate = computed(() => {
  if (totalAnswered.value === 0) return 0
  return Math.round((correctCount.value / totalAnswered.value) * 100)
})

const scorePercentage = computed(() => {
  const total = record.value?.totalScore || 0
  if (!record.value || total === 0) return 0
  return record.value.score / total
})

const dashOffset = computed(() => {
  return circumference * (1 - scorePercentage.value)
})

const scoreColor = computed(() => {
  const p = scorePercentage.value
  if (p >= 0.9) return '#52c41a'
  if (p >= 0.75) return '#1890ff'
  if (p >= 0.6) return '#faad14'
  return '#f5222d'
})

const scoreClass = computed(() => {
  const p = scorePercentage.value
  if (p >= 0.9) return 'excellent'
  if (p >= 0.75) return 'good'
  if (p >= 0.6) return 'pass'
  return 'fail'
})

const scoreLabel = computed(() => {
  const p = scorePercentage.value
  if (p >= 0.9) return '优秀'
  if (p >= 0.75) return '良好'
  if (p >= 0.6) return '及格'
  return '不及格'
})

function getQuestion(questionId: number): Question | undefined {
  return questions.value.find(q => q.id === questionId)
}

function getQuestionContent(questionId: number): string {
  return getQuestion(questionId)?.content || '题目内容不可用'
}

function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index)
}

function formatAnswer(answer: { answer: string; questionId: number }): string {
  const question = getQuestion(answer.questionId)
  if (!question) return answer.answer

  if (question.type === 'single' || question.type === 'multiple') {
    const labels = answer.answer.split('').map((ch, i) => {
      const optionIndex = ch.charCodeAt(0) - 65
      if (question.options && optionIndex >= 0 && optionIndex < question.options.length) {
        return `${ch}. ${question.options[optionIndex]}`
      }
      return ch
    })
    return labels.join('、')
  }

  return answer.answer
}

function goBack() {
  router.push('/exam/list')
}
</script>

<style scoped>
.exam-result-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: 100vh;
  background: #f5f7fa;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.result-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
}

/* Score Section */
.score-section {
  text-align: center;
  margin-bottom: 2rem;
}

.score-circle {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 1rem;
}

.score-ring {
  width: 100%;
  height: 100%;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: #333;
  line-height: 1;
}

.score-total {
  font-size: 1rem;
  color: #999;
  margin-top: 0.25rem;
}

.score-label {
  font-size: 1.25rem;
  font-weight: 600;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.stat-value.correct { color: #52c41a; }
.stat-value.wrong { color: #f5222d; }
.stat-value.unanswered { color: #999; }
.stat-value.rate { color: #1890ff; }

.stat-label {
  font-size: 0.85rem;
  color: #999;
  margin-top: 0.25rem;
}

/* Details Section */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #e8e8e8;
}

.detail-correct {
  border-left-color: #52c41a;
}

.detail-wrong {
  border-left-color: #f5222d;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.detail-index {
  font-weight: 600;
  color: #333;
}

.detail-question {
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
  margin-bottom: 0.75rem;
}

.detail-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.detail-option {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #555;
}

.option-correct {
  background: #f6ffed;
  color: #52c41a;
  font-weight: 500;
}

.option-wrong-user {
  background: #fff2f0;
  color: #f5222d;
  text-decoration: line-through;
}

.detail-answers {
  margin-bottom: 0.5rem;
}

.detail-answers p {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.answer-label {
  color: #999;
}

.text-correct {
  color: #52c41a;
  font-weight: 500;
}

.text-wrong {
  color: #f5222d;
  font-weight: 500;
}

.text-muted {
  color: #ccc;
}

.detail-analysis {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
}

.not-found {
  text-align: center;
  padding: 4rem 1.5rem;
  color: #999;
}

.not-found p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
