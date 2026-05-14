<template>
  <div class="question-practice-page" v-if="bank && questions.length">
    <!-- ==================== 顶部信息 ==================== -->
    <el-card shadow="never" class="progress-card">
      <div class="progress-header">
        <div class="progress-left">
          <el-button link @click="$router.push(`/question/${bank.id}`)">
            <el-icon><ArrowLeft /></el-icon> 返回题库
          </el-button>
          <h2>{{ bank.name }}</h2>
        </div>
        <div class="progress-right">
          <span class="progress-text">
            已答 <strong>{{ answeredCount }}</strong> / 共 <strong>{{ questions.length }}</strong> 题
          </span>
          <el-progress
            :percentage="progressPercent"
            :stroke-width="12"
            color="#4A6CF7"
            style="width: 200px"
          />
        </div>
      </div>
    </el-card>

    <!-- ==================== 题目显示区 ==================== -->
    <el-card shadow="never" class="question-card">
      <div class="question-header">
        <span class="question-index">第 {{ currentIndex + 1 }} 题</span>
        <el-tag :type="typeTagMap[currentQuestion.type]" size="small">
          {{ typeNameMap[currentQuestion.type] }}
        </el-tag>
        <el-tag
          :type="currentQuestion.difficulty <= 2 ? 'success' : currentQuestion.difficulty <= 3 ? 'warning' : 'danger'"
          size="small"
        >
          {{ difficultyMap[currentQuestion.difficulty] }}
        </el-tag>
        <span class="question-score">{{ currentQuestion.score }} 分</span>
      </div>

      <div class="question-content">{{ currentQuestion.content }}</div>

      <!-- 单选 -->
      <el-radio-group
        v-if="currentQuestion.type === 'single'"
        v-model="userAnswer"
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
        v-model="multiAnswer"
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
        v-model="userAnswer"
        class="answer-group"
      >
        <el-radio value="正确" class="answer-option">正确</el-radio>
        <el-radio value="错误" class="answer-option">错误</el-radio>
      </el-radio-group>

      <!-- 填空 -->
      <el-input
        v-if="currentQuestion.type === 'fill'"
        v-model="userAnswer"
        placeholder="请输入答案"
        class="fill-input"
      />

      <!-- 问答 -->
      <el-input
        v-if="currentQuestion.type === 'essay'"
        v-model="userAnswer"
        type="textarea"
        :rows="4"
        placeholder="请输入您的答案"
        class="essay-input"
      />

      <!-- 答题反馈 -->
      <div v-if="showFeedback" class="feedback-section">
        <el-alert
          :type="isCorrect ? 'success' : 'error'"
          :title="isCorrect ? '回答正确！' : '回答错误'"
          show-icon
          :closable="false"
        />
        <div class="feedback-detail">
          <p><strong>正确答案：</strong>{{ currentQuestion.answer }}</p>
          <p v-if="!isCorrect"><strong>你的答案：</strong>{{ submittedAnswer }}</p>
          <p class="analysis"><strong>解析：</strong>{{ currentQuestion.analysis }}</p>
        </div>
      </div>
    </el-card>

    <!-- ==================== 底部操作 ==================== -->
    <div class="action-bar">
      <el-button @click="prevQuestion" :disabled="currentIndex === 0">
        <el-icon><ArrowLeft /></el-icon> 上一题
      </el-button>
      <el-button type="primary" @click="submitAnswer" v-if="!showFeedback">
        提交答案
      </el-button>
      <el-button @click="nextQuestion" :disabled="currentIndex === questions.length - 1">
        下一题 <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>

  <div v-else class="loading-wrap">
    <el-empty description="题库不存在或暂无题目" />
    <el-button type="primary" @click="$router.push('/question')">返回题库列表</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { mockQuestionBanks, mockQuestions } from '../../data/mockData'

const route = useRoute()

// ---- 题库与题目 ----
const bankId = Number(route.query.bankId)
const bank = computed(() => mockQuestionBanks.find(b => b.id === bankId))
const questions = computed(() => {
  if (!bank.value) return []
  return mockQuestions.filter(q => q.category === bank.value!.name)
})

const currentIndex = ref(0)
const currentQuestion = computed(() => questions.value[currentIndex.value])

// ---- 答题状态 ----
const userAnswer = ref('')
const multiAnswer = ref<string[]>([])
const showFeedback = ref(false)
const isCorrect = ref(false)
const submittedAnswer = ref('')

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

const difficultyMap: Record<number, string> = {
  1: '简单',
  2: '较易',
  3: '中等',
  4: '较难',
  5: '困难'
}

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

// ---- 进度 ----
const answeredCount = computed(() => {
  // 简单统计：基于当前索引
  return currentIndex.value + (showFeedback.value ? 1 : 0)
})

const progressPercent = computed(() => {
  return Math.round((answeredCount.value / questions.value.length) * 100)
})

// ---- 操作 ----
function submitAnswer() {
  const q = currentQuestion.value
  let answer = ''

  if (q.type === 'multiple') {
    answer = multiAnswer.value.sort().join('')
  } else {
    answer = userAnswer.value.trim()
  }

  if (!answer) {
    return
  }

  submittedAnswer.value = answer
  isCorrect.value = answer === q.answer
  showFeedback.value = true
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetAnswerState()
  }
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    resetAnswerState()
  }
}

function resetAnswerState() {
  userAnswer.value = ''
  multiAnswer.value = []
  showFeedback.value = false
  isCorrect.value = false
  submittedAnswer.value = ''
}
</script>

<style scoped>
.question-practice-page {
  max-width: 100%;
}

/* ==================== 进度 ==================== */
.progress-card {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-left h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.progress-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-text {
  font-size: 14px;
  color: #606266;
}

.progress-text strong {
  color: #4A6CF7;
}

/* ==================== 题目 ==================== */
.question-card {
  margin-bottom: 20px;
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

/* ==================== 反馈 ==================== */
.feedback-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.feedback-detail {
  margin-top: 16px;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.feedback-detail strong {
  color: #303133;
}

.feedback-detail .analysis {
  margin-top: 8px;
  padding: 12px;
  background: #F5F7FA;
  border-radius: 6px;
}

/* ==================== 操作栏 ==================== */
.action-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.loading-wrap {
  text-align: center;
  padding: 80px 0;
}
</style>
