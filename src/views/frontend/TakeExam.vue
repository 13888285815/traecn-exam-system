<template>
  <div class="exam-take-page" v-if="exam && questions.length">
    <!-- ==================== 顶部信息栏 ==================== -->
    <el-card shadow="never" class="top-bar">
      <div class="top-bar-content">
        <div class="top-left">
          <h2>{{ exam.title }}</h2>
        </div>
        <div class="top-center">
          <div class="countdown" :class="{ 'countdown-warning': remainingMinutes < 5 }">
            <el-icon><Clock /></el-icon>
            <span>{{ countdownText }}</span>
          </div>
        </div>
        <div class="top-right">
          <el-button type="danger" @click="showSubmitDialog = true">
            <el-icon><CircleCheck /></el-icon> 交卷
          </el-button>
        </div>
      </div>
    </el-card>

    <div class="exam-body">
      <!-- ==================== 左侧题号导航 ==================== -->
      <el-card shadow="never" class="nav-card">
        <div class="nav-title">答题卡</div>
        <div class="nav-grid">
          <div
            v-for="(q, index) in questions"
            :key="q.id"
            class="nav-item"
            :class="{
              'nav-current': index === currentIndex,
              'nav-answered': isAnswered(index),
              'nav-unanswered': !isAnswered(index)
            }"
            @click="goToQuestion(index)"
          >
            {{ index + 1 }}
          </div>
        </div>
        <div class="nav-legend">
          <div class="legend-item">
            <span class="legend-dot dot-current"></span>
            <span>当前</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot dot-answered"></span>
            <span>已答</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot dot-unanswered"></span>
            <span>未答</span>
          </div>
        </div>
      </el-card>

      <!-- ==================== 中间题目区 ==================== -->
      <el-card shadow="never" class="question-card">
        <div class="question-header">
          <span class="question-index">第 {{ currentIndex + 1 }} 题 / 共 {{ questions.length }} 题</span>
          <el-tag :type="typeTagMap[currentQuestion.type]" size="small">
            {{ typeNameMap[currentQuestion.type] }}
          </el-tag>
          <span class="question-score">{{ currentQuestion.score }} 分</span>
        </div>

        <div class="question-content">{{ currentQuestion.content }}</div>

        <!-- 单选 -->
        <el-radio-group
          v-if="currentQuestion.type === 'single'"
          v-model="answers[currentIndex]"
          class="answer-group"
        >
          <el-radio
            v-for="(opt, oi) in currentQuestion.options"
            :key="oi"
            :value="optionLabels[oi]"
            class="answer-option"
          >
            {{ optionLabels[oi] }}. {{ opt }}
          </el-radio>
        </el-radio-group>

        <!-- 多选 -->
        <el-checkbox-group
          v-if="currentQuestion.type === 'multiple'"
          :model-value="multiAnswers[currentIndex] || []"
          @update:model-value="(val: string[]) => multiAnswers[currentIndex] = val"
          class="answer-group"
        >
          <el-checkbox
            v-for="(opt, oi) in currentQuestion.options"
            :key="oi"
            :label="optionLabels[oi]"
            :value="optionLabels[oi]"
            class="answer-option"
          >
            {{ optionLabels[oi] }}. {{ opt }}
          </el-checkbox>
        </el-checkbox-group>

        <!-- 判断 -->
        <el-radio-group
          v-if="currentQuestion.type === 'judge'"
          v-model="answers[currentIndex]"
          class="answer-group"
        >
          <el-radio value="正确" class="answer-option">正确</el-radio>
          <el-radio value="错误" class="answer-option">错误</el-radio>
        </el-radio-group>

        <!-- 填空 -->
        <el-input
          v-if="currentQuestion.type === 'fill'"
          v-model="answers[currentIndex]"
          placeholder="请输入答案"
          class="fill-input"
        />

        <!-- 问答 -->
        <el-input
          v-if="currentQuestion.type === 'essay'"
          v-model="answers[currentIndex]"
          type="textarea"
          :rows="5"
          placeholder="请输入您的答案"
          class="essay-input"
        />
      </el-card>
    </div>

    <!-- ==================== 底部导航 ==================== -->
    <div class="bottom-bar">
      <el-button @click="prevQuestion" :disabled="currentIndex === 0">
        <el-icon><ArrowLeft /></el-icon> 上一题
      </el-button>
      <span class="page-info">{{ currentIndex + 1 }} / {{ questions.length }}</span>
      <el-button @click="nextQuestion" :disabled="currentIndex === questions.length - 1">
        下一题 <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>

    <!-- ==================== 提交确认对话框 ==================== -->
    <el-dialog
      v-model="showSubmitDialog"
      title="确认交卷"
      width="420px"
      center
    >
      <div class="submit-dialog-content">
        <el-icon :size="48" color="#E6A23C"><WarningFilled /></el-icon>
        <p>您确定要提交试卷吗？</p>
        <p class="submit-info">
          已答 <strong>{{ answeredCount }}</strong> 题，未答 <strong>{{ questions.length - answeredCount }}</strong> 题
        </p>
        <p v-if="questions.length - answeredCount > 0" class="submit-warning">
          还有未完成的题目，提交后将无法修改！
        </p>
      </div>
      <template #footer>
        <el-button @click="showSubmitDialog = false">继续答题</el-button>
        <el-button type="danger" @click="submitExam">确认交卷</el-button>
      </template>
    </el-dialog>
  </div>

  <div v-else class="loading-wrap">
    <el-empty description="试卷不存在" />
    <el-button type="primary" @click="$router.push('/exam')">返回考试列表</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Clock, CircleCheck, ArrowLeft, ArrowRight, WarningFilled
} from '@element-plus/icons-vue'
import { mockExamPapers, mockQuestions } from '../../data/mockData'

const route = useRoute()
const router = useRouter()

// ---- 试卷与题目 ----
const examId = Number(route.params.id)
const exam = computed(() => mockExamPapers.find(e => e.id === examId))
const questions = computed(() => {
  if (!exam.value) return []
  return mockQuestions.filter(q => exam.value!.questionIds.includes(q.id))
})

const currentIndex = ref(0)
const currentQuestion = computed(() => questions.value[currentIndex.value])

// ---- 答题数据 ----
const answers = ref<string[]>([])
const multiAnswers = ref<string[][]>([])

// 初始化答题数组
function initAnswers() {
  answers.value = questions.value.map(() => '')
  multiAnswers.value = questions.value.map(() => [])
}

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

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

// ---- 答题状态 ----
function isAnswered(index: number): boolean {
  const q = questions.value[index]
  if (!q) return false
  if (q.type === 'multiple') {
    return (multiAnswers.value[index] || []).length > 0
  }
  return !!answers.value[index]?.trim()
}

const answeredCount = computed(() => {
  let count = 0
  questions.value.forEach((q, i) => {
    if (isAnswered(i)) count++
  })
  return count
})

// ---- 倒计时 ----
const totalSeconds = ref(0)
const remainingSeconds = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const remainingMinutes = computed(() => Math.floor(remainingSeconds.value / 60))

const countdownText = computed(() => {
  const m = Math.floor(remainingSeconds.value / 60)
  const s = remainingSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

function startTimer() {
  totalSeconds.value = (exam.value?.duration || 60) * 60
  remainingSeconds.value = totalSeconds.value
  timer = setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) {
      clearInterval(timer!)
      timer = null
      ElMessage.warning('考试时间已到，系统自动提交！')
      submitExam()
    }
  }, 1000)
}

// ---- 导航 ----
function goToQuestion(index: number) {
  currentIndex.value = index
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  }
}

// ---- 提交 ----
const showSubmitDialog = ref(false)

function submitExam() {
  showSubmitDialog.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  // 计算成绩
  let score = 0
  const results = questions.value.map((q, i) => {
    let userAns = ''
    if (q.type === 'multiple') {
      userAns = (multiAnswers.value[i] || []).sort().join('')
    } else {
      userAns = (answers.value[i] || '').trim()
    }
    const correct = userAns === q.answer
    if (correct) score += q.score
    return {
      questionId: q.id,
      question: q,
      userAnswer: userAns,
      correctAnswer: q.answer,
      isCorrect: correct
    }
  })

  // 存储结果到 sessionStorage
  const timeSpent = totalSeconds.value - remainingSeconds.value
  sessionStorage.setItem('exam_result', JSON.stringify({
    examId,
    examTitle: exam.value?.title,
    totalScore: exam.value?.totalScore,
    score,
    timeSpent,
    results
  }))

  router.push(`/exam/result/${examId}`)
}

// ---- 生命周期 ----
onMounted(() => {
  initAnswers()
  startTimer()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
.exam-take-page {
  max-width: 100%;
}

/* ==================== 顶部栏 ==================== */
.top-bar {
  margin-bottom: 16px;
}

.top-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-left h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #4A6CF7;
  font-variant-numeric: tabular-nums;
}

.countdown-warning {
  color: #F56C6C;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ==================== 主体 ==================== */
.exam-body {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

/* ==================== 题号导航 ==================== */
.nav-card {
  width: 200px;
  flex-shrink: 0;
  align-self: flex-start;
  position: sticky;
  top: 80px;
}

.nav-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.nav-item {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-current {
  background: #4A6CF7;
  color: #fff;
}

.nav-answered {
  background: #67C23A;
  color: #fff;
}

.nav-unanswered {
  background: #F5F7FA;
  color: #909399;
  border: 1px solid #DCDFE6;
}

.nav-item:hover {
  opacity: 0.85;
}

.nav-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.dot-current { background: #4A6CF7; }
.dot-answered { background: #67C23A; }
.dot-unanswered { background: #F5F7FA; border: 1px solid #DCDFE6; }

/* ==================== 题目区 ==================== */
.question-card {
  flex: 1;
  min-width: 0;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.question-index {
  font-size: 15px;
  font-weight: 600;
  color: #4A6CF7;
}

.question-score {
  margin-left: auto;
  font-size: 13px;
  color: #909399;
}

.question-content {
  font-size: 16px;
  color: #303133;
  line-height: 1.8;
  margin-bottom: 24px;
}

.answer-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.answer-option {
  font-size: 15px;
  line-height: 1.6;
}

.fill-input {
  max-width: 400px;
}

.essay-input {
  margin-top: 8px;
}

/* ==================== 底部栏 ==================== */
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 16px 0;
}

.page-info {
  font-size: 14px;
  color: #909399;
}

/* ==================== 提交对话框 ==================== */
.submit-dialog-content {
  text-align: center;
  padding: 16px 0;
}

.submit-dialog-content p {
  font-size: 15px;
  color: #606266;
  margin-top: 12px;
}

.submit-info {
  margin-top: 8px !important;
}

.submit-info strong {
  color: #4A6CF7;
}

.submit-warning {
  color: #E6A23C !important;
  font-size: 13px !important;
}

.loading-wrap {
  text-align: center;
  padding: 80px 0;
}

@media (max-width: 768px) {
  .exam-body {
    flex-direction: column;
  }

  .nav-card {
    width: 100%;
    position: static;
  }

  .nav-grid {
    grid-template-columns: repeat(10, 1fr);
  }
}
</style>
