<template>
  <div class="endless-page">
    <!-- 顶部信息栏 -->
    <el-card shadow="never" class="top-bar">
      <div class="top-bar-content">
        <div class="top-left">
          <h2>🌀 无尽练习模式</h2>
          <span class="stats">
            已答 <strong>{{ answered }}</strong> 题 · 正确 <strong class="text-success">{{ correct }}</strong> · 正确率 <strong>{{ accuracy }}</strong>%
          </span>
        </div>
        <div class="top-right">
          <el-button type="danger" @click="handleQuit">
            退出练习
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 题目卡片 -->
    <el-card shadow="never" class="question-card" v-if="currentQuestion">
      <div class="question-header">
        <span class="question-index">第 {{ answered + 1 }} 题</span>
        <el-tag :type="typeTagMap[currentQuestion.type]" size="small">
          {{ typeNameMap[currentQuestion.type] }}
        </el-tag>
        <el-tag type="info" size="small">{{ currentQuestion.category }}</el-tag>
        <span class="question-score">{{ currentQuestion.score }} 分</span>
        <el-tag v-if="currentQuestion.difficulty <= 2" type="success" size="small">简单</el-tag>
        <el-tag v-else-if="currentQuestion.difficulty <= 3" type="warning" size="small">中等</el-tag>
        <el-tag v-else type="danger" size="small">困难</el-tag>
      </div>

      <div class="question-content">{{ currentQuestion.content }}</div>

      <!-- 单选 -->
      <el-radio-group
        v-if="currentQuestion.type === 'single'"
        v-model="selectedAnswer"
        class="answer-group"
      >
        <el-radio
          v-for="(opt, oi) in currentQuestion.options"
          :key="oi"
          :value="optionLabels[oi]"
          class="answer-option"
          :class="{ 'option-correct': submitted && optionLabels[oi] === currentQuestion.answer, 'option-wrong': submitted && selectedAnswer === optionLabels[oi] && selectedAnswer !== currentQuestion.answer }"
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
          :value="optionLabels[oi]"
          class="answer-option"
        >
          {{ optionLabels[oi] }}. {{ opt }}
        </el-checkbox>
      </el-checkbox-group>

      <!-- 判断 -->
      <el-radio-group
        v-if="currentQuestion.type === 'judge'"
        v-model="selectedAnswer"
        class="answer-group"
      >
        <el-radio value="正确" class="answer-option">✓ 正确</el-radio>
        <el-radio value="错误" class="answer-option">✗ 错误</el-radio>
      </el-radio-group>

      <!-- 填空 -->
      <el-input
        v-if="currentQuestion.type === 'fill'"
        v-model="selectedAnswer"
        placeholder="请输入答案"
        class="fill-input"
        :disabled="submitted"
      />

      <!-- 问答 -->
      <el-input
        v-if="currentQuestion.type === 'essay'"
        v-model="selectedAnswer"
        type="textarea"
        :rows="4"
        placeholder="请输入您的答案"
        :disabled="submitted"
      />

      <!-- 提交按钮 -->
      <div class="submit-section" v-if="!submitted">
        <el-button type="primary" size="large" @click="submitAnswer" :disabled="!canSubmit">
          提交答案
        </el-button>
      </div>

      <!-- 答案反馈 -->
      <div v-if="submitted" class="feedback-section">
        <el-alert
          :type="isCorrect ? 'success' : 'error'"
          :title="isCorrect ? '✓ 回答正确！' : '✗ 回答错误'"
          :description="isCorrect ? '太棒了！继续下一题吧～' : '没关系，看看解析再接再厉！'"
          show-icon
          :closable="false"
        />
        <div class="feedback-detail">
          <div v-if="!isCorrect" class="feedback-row">
            <span class="feedback-label">正确答案：</span>
            <span class="feedback-value text-success">{{ currentQuestion.answer }}</span>
          </div>
          <div class="feedback-row">
            <span class="feedback-label">解析：</span>
            <span class="feedback-value">{{ currentQuestion.analysis || '暂无解析' }}</span>
          </div>
        </div>
        <div class="next-section">
          <el-button type="primary" size="large" @click="nextQuestion">
            下一题 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 退出确认 -->
    <el-dialog v-model="quitDialogVisible" title="确认退出" width="400px" center>
      <div style="text-align:center;padding:16px 0">
        <el-icon :size="48" color="#E6A23C"><WarningFilled /></el-icon>
        <p style="margin-top:12px;font-size:15px;color:#606266">
          确定要退出练习吗？<br/>
          本次练习：共回答 {{ answered }} 题，正确率 {{ accuracy }}%
        </p>
      </div>
      <template #footer>
        <el-button @click="quitDialogVisible = false">继续练习</el-button>
        <el-button type="primary" @click="confirmQuit">确认退出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowRight, WarningFilled } from '@element-plus/icons-vue'
import { mockQuestions } from '../../data/mockData'

const router = useRouter()

// ---- 状态 ----
const allQuestions = mockQuestions
const answered = ref(0)
const correct = ref(0)
const usedIds = ref<Set<number>>(new Set())
const currentQuestion = ref<any>(null)
const selectedAnswer = ref('')
const multiAnswer = ref<string[]>([])
const submitted = ref(false)
const isCorrect = ref(false)
const quitDialogVisible = ref(false)

// ---- 类型映射 ----
const typeNameMap: Record<string, string> = {
  single: '单选题', multiple: '多选题', judge: '判断题', fill: '填空题', essay: '问答题'
}
const typeTagMap: Record<string, string> = {
  single: '', multiple: 'success', judge: 'warning', fill: 'info', essay: 'danger'
}
const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

// ---- 计算 ----
const canSubmit = computed(() => {
  if (!currentQuestion.value) return false
  if (currentQuestion.value.type === 'multiple') {
    return multiAnswer.value.length > 0
  }
  return !!selectedAnswer.value.trim()
})

const accuracy = computed(() => {
  if (answered.value === 0) return 0
  return Math.round((correct.value / answered.value) * 100)
})

// ---- 抽题 ----
function pickRandomQuestion() {
  const available = allQuestions.filter(q => !usedIds.value.has(q.id))
  if (available.length === 0) {
    // 全部做完了，重置
    usedIds.value.clear()
    return allQuestions[Math.floor(Math.random() * allQuestions.length)]
  }
  return available[Math.floor(Math.random() * available.length)]
}

function loadQuestion() {
  const q = pickRandomQuestion()
  currentQuestion.value = q
  usedIds.value.add(q.id)
  selectedAnswer.value = ''
  multiAnswer.value = []
  submitted.value = false
  isCorrect.value = false
}

function submitAnswer() {
  if (!canSubmit.value) {
    ElMessage.warning('请先选择或输入答案')
    return
  }

  let userAns = ''
  if (currentQuestion.value.type === 'multiple') {
    userAns = [...multiAnswer.value].sort().join('')
  } else {
    userAns = selectedAnswer.value.trim()
  }

  answered.value++
  isCorrect.value = userAns === currentQuestion.value.answer
  if (isCorrect.value) correct.value++
  submitted.value = true
}

function nextQuestion() {
  loadQuestion()
}

function handleQuit() {
  quitDialogVisible.value = true
}

function confirmQuit() {
  quitDialogVisible.value = false
  router.push('/exam')
}

// ---- 初始化 ----
onMounted(() => {
  loadQuestion()
})
</script>

<style scoped>
.endless-page {
  max-width: 860px;
  margin: 0 auto;
}

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
  margin-bottom: 4px;
}

.stats {
  font-size: 14px;
  color: #606266;
}

.text-success {
  color: #67C23A;
}

.question-card {
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
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

.option-correct {
  background: #EAF3DE !important;
  border-color: #67C23A !important;
  color: #67C23A !important;
  border-radius: 8px;
}

.option-wrong {
  background: #FCEBEB !important;
  border-color: #F56C6C !important;
  color: #F56C6C !important;
  border-radius: 8px;
}

.fill-input {
  max-width: 400px;
}

.submit-section {
  margin-top: 24px;
  text-align: center;
}

.feedback-section {
  margin-top: 24px;
}

.feedback-detail {
  margin-top: 16px;
  padding: 16px;
  background: #F5F7FA;
  border-radius: 8px;
}

.feedback-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.feedback-row:last-child {
  margin-bottom: 0;
}

.feedback-label {
  color: #909399;
  flex-shrink: 0;
  font-weight: 500;
}

.feedback-value {
  color: #303133;
}

.text-success {
  color: #67C23A;
  font-weight: 600;
}

.next-section {
  margin-top: 20px;
  text-align: center;
}
</style>