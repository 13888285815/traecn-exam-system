<template>
  <div class="take-exam-page">
    <!-- Exam Header -->
    <div class="exam-header">
      <div class="header-left">
        <h2 class="exam-title">{{ examTitle }}</h2>
        <span class="exam-info" v-if="!isEndlessMode">
          共 {{ questions.length }} 题 | 总分 {{ totalScore }} 分
        </span>
        <span class="exam-info" v-else>无尽模式 | 已答 {{ answeredCount }} 题</span>
      </div>
      <div class="header-right">
        <div v-if="!isEndlessMode" class="timer" :class="{ 'timer-warning': isTimeWarning }">
          <span class="timer-icon">&#x23F1;</span>
          <span class="timer-text">{{ formattedTime }}</span>
        </div>
        <el-button type="danger" @click="handleSubmitExam">提交试卷</el-button>
      </div>
    </div>

    <div class="exam-body">
      <!-- Question Navigation -->
      <div class="question-nav">
        <div class="nav-title">题号导航</div>
        <div class="nav-grid">
          <div
            v-for="(q, index) in questions"
            :key="q.id"
            class="nav-item"
            :class="{
              'nav-current': index === currentIndex,
              'nav-answered': isAnswered(q.id),
              'nav-correct': isCorrectAnswer(q.id),
              'nav-wrong': isWrongAnswer(q.id)
            }"
            @click="goToQuestion(index)"
          >
            {{ index + 1 }}
          </div>
        </div>
      </div>

      <!-- Question Area -->
      <div class="question-area" v-if="currentQuestion">
        <div class="question-header">
          <el-tag :type="getQuestionTypeTag(currentQuestion.type)" size="small">
            {{ getQuestionTypeText(currentQuestion.type) }}
          </el-tag>
          <span class="question-score">{{ currentQuestion.score }}分</span>
          <span class="question-index">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</span>
        </div>

        <div class="question-content">
          <p class="question-text">{{ currentQuestion.content }}</p>
        </div>

        <!-- Single Choice -->
        <div v-if="currentQuestion.type === 'single'" class="options-area">
          <div
            v-for="(option, idx) in currentQuestion.options"
            :key="idx"
            class="option-item"
            :class="{
              'option-selected': currentAnswer === getOptionLabel(idx),
              'option-correct': showFeedback && getOptionLabel(idx) === currentQuestion.answer,
              'option-wrong': showFeedback && currentAnswer === getOptionLabel(idx) && currentAnswer !== currentQuestion.answer
            }"
            @click="selectAnswer(getOptionLabel(idx))"
          >
            <span class="option-label">{{ getOptionLabel(idx) }}</span>
            <span class="option-text">{{ option }}</span>
          </div>
        </div>

        <!-- Multiple Choice -->
        <div v-if="currentQuestion.type === 'multiple'" class="options-area">
          <div
            v-for="(option, idx) in currentQuestion.options"
            :key="idx"
            class="option-item"
            :class="{
              'option-selected': currentMultipleAnswers.includes(getOptionLabel(idx)),
              'option-correct': showFeedback && currentQuestion.answer.includes(getOptionLabel(idx)),
              'option-wrong': showFeedback && currentMultipleAnswers.includes(getOptionLabel(idx)) && !currentQuestion.answer.includes(getOptionLabel(idx))
            }"
            @click="toggleMultipleAnswer(getOptionLabel(idx))"
          >
            <span class="option-label">{{ getOptionLabel(idx) }}</span>
            <span class="option-text">{{ option }}</span>
          </div>
        </div>

        <!-- Judge -->
        <div v-if="currentQuestion.type === 'judge'" class="options-area">
          <div
            class="option-item"
            :class="{
              'option-selected': currentAnswer === '正确',
              'option-correct': showFeedback && currentQuestion.answer === '正确',
              'option-wrong': showFeedback && currentAnswer === '正确' && currentQuestion.answer !== '正确'
            }"
            @click="selectAnswer('正确')"
          >
            <span class="option-label">&#x2705;</span>
            <span class="option-text">正确</span>
          </div>
          <div
            class="option-item"
            :class="{
              'option-selected': currentAnswer === '错误',
              'option-correct': showFeedback && currentQuestion.answer === '错误',
              'option-wrong': showFeedback && currentAnswer === '错误' && currentQuestion.answer !== '错误'
            }"
            @click="selectAnswer('错误')"
          >
            <span class="option-label">&#x274C;</span>
            <span class="option-text">错误</span>
          </div>
        </div>

        <!-- Fill -->
        <div v-if="currentQuestion.type === 'fill'" class="fill-area">
          <el-input
            v-model="currentAnswer"
            placeholder="请输入答案"
            size="large"
            :class="{ 'fill-correct': showFeedback && isCurrentCorrect, 'fill-wrong': showFeedback && !isCurrentCorrect }"
          />
        </div>

        <!-- Essay -->
        <div v-if="currentQuestion.type === 'essay'" class="essay-area">
          <el-input
            v-model="currentAnswer"
            type="textarea"
            :rows="6"
            placeholder="请输入您的答案"
            size="large"
          />
        </div>

        <!-- Feedback -->
        <div v-if="showFeedback" class="feedback-area" :class="isCurrentCorrect ? 'feedback-correct' : 'feedback-wrong'">
          <div class="feedback-header">
            <span v-if="isCurrentCorrect">&#x2705; 回答正确</span>
            <span v-else>&#x274C; 回答错误</span>
          </div>
          <div class="feedback-detail">
            <p><strong>正确答案：</strong>{{ currentQuestion.answer }}</p>
            <p v-if="currentQuestion.analysis"><strong>解析：</strong>{{ currentQuestion.analysis }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <el-button @click="goToQuestion(currentIndex - 1)" :disabled="currentIndex === 0">
            上一题
          </el-button>
          <el-button type="primary" @click="saveAndNext">
            {{ currentIndex === questions.length - 1 && !isEndlessMode ? '保存' : '保存并下一题' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { examApi, examSessionApi, questionApi } from '../api'
import type { Question, ExamSession } from '../types'

const router = useRouter()
const route = useRoute()

const examId = computed(() => Number(route.params.id))
const isEndlessMode = computed(() => examId.value === 0)

const examTitle = ref('')
const questions = ref<Question[]>([])
const currentIndex = ref(0)
const currentAnswer = ref('')
const currentMultipleAnswers = ref<string[]>([])
const answers = ref<{ questionId: number; answer: string; timeSpent: number }[]>([])
const showFeedback = ref(false)
const isCurrentCorrect = ref(false)
const sessionId = ref<number>(0)
const timeRemaining = ref(0)
const totalScore = ref(0)
let timer: ReturnType<typeof setInterval> | null = null
const questionStartTime = ref(Date.now())

const currentQuestion = computed(() => {
  return questions.value[currentIndex.value] || null
})

const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const isTimeWarning = computed(() => {
  return timeRemaining.value <= 300 && timeRemaining.value > 0
})

const answeredCount = computed(() => {
  return answers.value.filter(a => a.answer.trim() !== '').length
})

onMounted(() => {
  if (isEndlessMode.value) {
    initEndlessMode()
  } else {
    initNormalMode()
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

function initNormalMode() {
  const exam = examApi.getExamById(examId.value)
  if (!exam) {
    ElMessage.error('试卷不存在')
    router.push('/exam/list')
    return
  }

  examTitle.value = exam.title
  questions.value = exam.questions
  totalScore.value = exam.totalScore
  timeRemaining.value = exam.duration * 60

  const session = examSessionApi.createSession(0, examId.value, exam.questions, 'normal')
  sessionId.value = session.id

  startTimer()
}

function initEndlessMode() {
  examTitle.value = '无尽练习模式'
  const allQuestions = questionApi.getAllQuestions()
  questions.value = shuffleArray([...allQuestions]).slice(0, 10)
  timeRemaining.value = 0

  const session = examSessionApi.createSession(0, 0, questions.value, 'endless')
  sessionId.value = session.id
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function startTimer() {
  timer = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
      if (timeRemaining.value === 0) {
        ElMessage.warning('考试时间到，自动提交试卷')
        handleSubmitExam()
      }
    }
  }, 1000)
}

function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index)
}

function getQuestionTypeTag(type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    single: 'primary',
    multiple: 'success',
    judge: 'warning',
    fill: 'info',
    essay: 'danger'
  }
  return map[type] || 'primary'
}

function getQuestionTypeText(type: string): string {
  const map: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    fill: '填空题',
    essay: '问答题'
  }
  return map[type] || '未知'
}

function selectAnswer(answer: string) {
  currentAnswer.value = answer
}

function toggleMultipleAnswer(label: string) {
  const idx = currentMultipleAnswers.value.indexOf(label)
  if (idx === -1) {
    currentMultipleAnswers.value.push(label)
  } else {
    currentMultipleAnswers.value.splice(idx, 1)
  }
  currentMultipleAnswers.value.sort()
  currentAnswer.value = currentMultipleAnswers.value.join('')
}

function isAnswered(questionId: number): boolean {
  return answers.value.some(a => a.questionId === questionId && a.answer.trim() !== '')
}

function isCorrectAnswer(questionId: number): boolean {
  const answer = answers.value.find(a => a.questionId === questionId)
  if (!answer) return false
  const question = questions.value.find(q => q.id === questionId)
  if (!question) return false
  return checkAnswer(question, answer.answer)
}

function isWrongAnswer(questionId: number): boolean {
  const answer = answers.value.find(a => a.questionId === questionId && a.answer.trim() !== '')
  if (!answer) return false
  const question = questions.value.find(q => q.id === questionId)
  if (!question) return false
  return !checkAnswer(question, answer.answer)
}

function checkAnswer(question: Question, userAnswer: string): boolean {
  if (!userAnswer || userAnswer.trim() === '') return false

  switch (question.type) {
    case 'single':
      return userAnswer.trim().toUpperCase() === question.answer.trim().toUpperCase()
    case 'multiple': {
      const userSorted = userAnswer.trim().toUpperCase().split('').sort().join('')
      const correctSorted = question.answer.trim().toUpperCase().split('').sort().join('')
      return userSorted === correctSorted
    }
    case 'judge': {
      const normalize = (a: string) => {
        const n = a.trim().toLowerCase()
        if (['true', '对', '正确', 'yes', '是'].includes(n)) return '正确'
        if (['false', '错', '错误', 'no', '否'].includes(n)) return '错误'
        return n
      }
      return normalize(userAnswer) === normalize(question.answer)
    }
    case 'fill':
      return userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()
    case 'essay': {
      const keywords = question.answer.split(/[,，、\s;；]+/).map(k => k.trim()).filter(k => k.length > 0)
      if (keywords.length === 0) return false
      const matched = keywords.filter(k => userAnswer.toLowerCase().includes(k.toLowerCase()))
      return matched.length / keywords.length >= 0.6
    }
    default:
      return false
  }
}

function saveAndNext() {
  if (!currentQuestion.value) return

  const answer = currentQuestion.value.type === 'multiple'
    ? currentMultipleAnswers.value.join('')
    : currentAnswer.value

  const timeSpent = Math.floor((Date.now() - questionStartTime.value) / 1000)

  // Save answer
  const existingIdx = answers.value.findIndex(a => a.questionId === currentQuestion.value!.id)
  if (existingIdx !== -1) {
    answers.value[existingIdx] = { questionId: currentQuestion.value.id, answer, timeSpent }
  } else {
    answers.value.push({ questionId: currentQuestion.value.id, answer, timeSpent })
  }

  // Update session
  examSessionApi.submitAnswer(sessionId.value, currentQuestion.value.id, answer, timeSpent)

  // Show feedback
  isCurrentCorrect.value = checkAnswer(currentQuestion.value, answer)
  showFeedback.value = true

  // Auto advance after delay
  setTimeout(() => {
    showFeedback.value = false
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++
      loadCurrentAnswer()
      questionStartTime.value = Date.now()
    } else if (isEndlessMode.value) {
      loadMoreQuestions()
    }
  }, 1500)
}

function loadCurrentAnswer() {
  if (!currentQuestion.value) return
  const saved = answers.value.find(a => a.questionId === currentQuestion.value!.id)
  if (saved) {
    currentAnswer.value = saved.answer
    if (currentQuestion.value.type === 'multiple') {
      currentMultipleAnswers.value = saved.answer.split('')
    }
  } else {
    currentAnswer.value = ''
    currentMultipleAnswers.value = []
  }
  showFeedback.value = false
}

function loadMoreQuestions() {
  const allQuestions = questionApi.getAllQuestions()
  const answeredIds = questions.value.map(q => q.id)
  const remaining = allQuestions.filter(q => !answeredIds.includes(q.id))
  if (remaining.length > 0) {
    const newQuestions = shuffleArray([...remaining]).slice(0, 5)
    questions.value.push(...newQuestions)
    currentIndex.value++
    loadCurrentAnswer()
    questionStartTime.value = Date.now()
  } else {
    ElMessage.info('所有题目已答完')
  }
}

function goToQuestion(index: number) {
  if (index < 0 || index >= questions.value.length) return
  currentIndex.value = index
  loadCurrentAnswer()
  questionStartTime.value = Date.now()
}

async function handleSubmitExam() {
  try {
    await ElMessageBox.confirm(
      isEndlessMode.value ? '确定要结束无尽模式练习吗？' : '确定要提交试卷吗？提交后不可修改。',
      '提交确认',
      { confirmButtonText: '确定提交', cancelButtonText: '继续答题', type: 'warning' }
    )

    if (timer) {
      clearInterval(timer)
    }

    // Save current answer if not saved
    if (currentQuestion.value) {
      const answer = currentQuestion.value.type === 'multiple'
        ? currentMultipleAnswers.value.join('')
        : currentAnswer.value
      const timeSpent = Math.floor((Date.now() - questionStartTime.value) / 1000)
      const existingIdx = answers.value.findIndex(a => a.questionId === currentQuestion.value!.id)
      if (existingIdx !== -1) {
        answers.value[existingIdx] = { questionId: currentQuestion.value.id, answer, timeSpent }
      } else {
        answers.value.push({ questionId: currentQuestion.value.id, answer, timeSpent })
      }
    }

    if (isEndlessMode.value) {
      // For endless mode, just navigate back
      ElMessage.success('练习结束')
      router.push('/exam/list')
      return
    }

    // Submit exam and get record
    const record = examApi.submitExam(0, examId.value, answers.value)
    examSessionApi.exitSession(sessionId.value)
    router.push(`/exam/result/${record.id}`)
  } catch {
    // User cancelled
  }
}
</script>

<style scoped>
.take-exam-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* Exam Header */
.exam-header {
  background: #fff;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.exam-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.exam-info {
  font-size: 0.85rem;
  color: #999;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f0f2f5;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.timer-warning {
  background: #fef0f0;
  color: #f56c6c;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.timer-icon {
  font-size: 1.2rem;
}

/* Exam Body */
.exam-body {
  display: flex;
  flex: 1;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Question Navigation */
.question-nav {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.nav-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}

.nav-item {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  background: #f0f2f5;
  color: #666;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #e0e3e8;
}

.nav-current {
  background: #667eea;
  color: #fff;
}

.nav-answered {
  background: #e6f7ff;
  color: #1890ff;
}

.nav-correct {
  background: #f6ffed;
  color: #52c41a;
}

.nav-wrong {
  background: #fff2f0;
  color: #f5222d;
}

/* Question Area */
.question-area {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.question-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.question-score {
  color: #f5a623;
  font-weight: 600;
  font-size: 0.9rem;
}

.question-index {
  color: #999;
  font-size: 0.9rem;
  margin-left: auto;
}

.question-content {
  margin-bottom: 1.5rem;
}

.question-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
}

/* Options */
.options-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.option-selected {
  border-color: #667eea;
  background: #f0f3ff;
}

.option-correct {
  border-color: #52c41a;
  background: #f6ffed;
}

.option-wrong {
  border-color: #f5222d;
  background: #fff2f0;
}

.option-label {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f0f2f5;
  font-weight: 600;
  font-size: 0.9rem;
  color: #555;
  flex-shrink: 0;
}

.option-selected .option-label {
  background: #667eea;
  color: #fff;
}

.option-correct .option-label {
  background: #52c41a;
  color: #fff;
}

.option-wrong .option-label {
  background: #f5222d;
  color: #fff;
}

.option-text {
  font-size: 1rem;
  color: #333;
}

/* Fill & Essay */
.fill-area,
.essay-area {
  margin-bottom: 1.5rem;
}

.fill-correct :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #52c41a inset;
}

.fill-wrong :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #f5222d inset;
}

/* Feedback */
.feedback-area {
  padding: 1.25rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.feedback-correct {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.feedback-wrong {
  background: #fff2f0;
  border: 1px solid #ffccc7;
}

.feedback-header {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.feedback-detail p {
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 0.25rem;
  color: #555;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .exam-body {
    flex-direction: column;
  }
  .question-nav {
    width: 100%;
    position: static;
    max-height: none;
  }
  .exam-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
}
</style>
