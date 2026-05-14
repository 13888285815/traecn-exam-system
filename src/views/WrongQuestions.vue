<template>
  <div class="wrong-questions-page">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">
          <span class="logo-icon">&#x1F4DD;</span>
          <span class="logo-text">在线考试系统</span>
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/exam/list" class="nav-link">考试列表</router-link>
          <router-link v-if="user && user.role === 'admin'" to="/admin/users" class="nav-link">管理后台</router-link>
          <div v-if="user" class="nav-user">
            <span class="user-name">{{ user.name }}</span>
            <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
          </div>
          <router-link v-else to="/login" class="nav-link login-btn">登录</router-link>
        </div>
      </div>
    </nav>

    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">错题库</h1>
        <div class="header-actions">
          <el-select v-model="selectedCategory" placeholder="按分类筛选" clearable @change="filterQuestions">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.name" />
          </el-select>
          <el-button type="primary" @click="startPractice" :disabled="filteredQuestions.length === 0">
            开始错题练习
          </el-button>
          <el-button type="danger" @click="handleClearAll" :disabled="wrongQuestions.length === 0">
            清空错题库
          </el-button>
          <router-link to="/wrong-question-recycle">
            <el-button>回收站</el-button>
          </router-link>
        </div>
      </div>

      <!-- Wrong Questions List -->
      <div v-if="filteredQuestions.length > 0" class="wrong-list">
        <div v-for="wq in filteredQuestions" :key="wq.id" class="wrong-card">
          <div class="wrong-header">
            <div class="wrong-meta">
              <el-tag :type="getTypeTag(wq.question.type)" size="small">
                {{ getTypeText(wq.question.type) }}
              </el-tag>
              <el-tag type="info" size="small">{{ wq.question.category }}</el-tag>
              <span class="wrong-count">错误 {{ wq.wrongCount }} 次</span>
            </div>
            <el-button type="primary" size="small" text @click="removeWrongQuestion(wq.questionId)">
              移除
            </el-button>
          </div>

          <p class="wrong-content">{{ wq.question.content }}</p>

          <!-- Show options for choice questions -->
          <div v-if="wq.question.options" class="wrong-options">
            <div
              v-for="(option, idx) in wq.question.options"
              :key="idx"
              class="wrong-option"
              :class="{
                'option-correct': getOptionLabel(idx) === wq.question.answer,
                'option-wrong': getOptionLabel(idx) === wq.userAnswer && getOptionLabel(idx) !== wq.question.answer
              }"
            >
              <span class="option-label">{{ getOptionLabel(idx) }}. {{ option }}</span>
            </div>
          </div>

          <div class="wrong-answers">
            <p>
              <span class="answer-label">你的答案：</span>
              <span class="text-wrong">{{ wq.userAnswer || '未作答' }}</span>
            </p>
            <p>
              <span class="answer-label">正确答案：</span>
              <span class="text-correct">{{ wq.question.answer }}</span>
            </p>
          </div>

          <div v-if="wq.question.analysis" class="wrong-analysis">
            <strong>解析：</strong>{{ wq.question.analysis }}
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">&#x2705;</div>
        <p>{{ wrongQuestions.length === 0 ? '错题库为空' : '该分类下没有错题' }}</p>
      </div>
    </div>

    <!-- Practice Dialog -->
    <el-dialog v-model="practiceVisible" :title="`错题练习 (${practiceIndex + 1}/${practiceQuestions.length})`" width="700px" :close-on-click-modal="false">
      <div v-if="currentPracticeQuestion" class="practice-area">
        <div class="practice-header">
          <el-tag :type="getTypeTag(currentPracticeQuestion.type)" size="small">
            {{ getTypeText(currentPracticeQuestion.type) }}
          </el-tag>
          <span class="practice-score">{{ currentPracticeQuestion.score }}分</span>
        </div>

        <p class="practice-question">{{ currentPracticeQuestion.content }}</p>

        <!-- Single Choice -->
        <div v-if="currentPracticeQuestion.type === 'single'" class="practice-options">
          <div
            v-for="(option, idx) in currentPracticeQuestion.options"
            :key="idx"
            class="practice-option"
            :class="{
              'option-selected': practiceAnswer === getOptionLabel(idx),
              'option-correct': showPracticeFeedback && getOptionLabel(idx) === currentPracticeQuestion.answer,
              'option-wrong': showPracticeFeedback && practiceAnswer === getOptionLabel(idx) && practiceAnswer !== currentPracticeQuestion.answer
            }"
            @click="practiceAnswer = getOptionLabel(idx)"
          >
            <span class="option-label">{{ getOptionLabel(idx) }}. {{ option }}</span>
          </div>
        </div>

        <!-- Multiple Choice -->
        <div v-if="currentPracticeQuestion.type === 'multiple'" class="practice-options">
          <div
            v-for="(option, idx) in currentPracticeQuestion.options"
            :key="idx"
            class="practice-option"
            :class="{
              'option-selected': practiceMultipleAnswers.includes(getOptionLabel(idx)),
              'option-correct': showPracticeFeedback && currentPracticeQuestion.answer.includes(getOptionLabel(idx)),
              'option-wrong': showPracticeFeedback && practiceMultipleAnswers.includes(getOptionLabel(idx)) && !currentPracticeQuestion.answer.includes(getOptionLabel(idx))
            }"
            @click="togglePracticeMultiple(getOptionLabel(idx))"
          >
            <span class="option-label">{{ getOptionLabel(idx) }}. {{ option }}</span>
          </div>
        </div>

        <!-- Judge -->
        <div v-if="currentPracticeQuestion.type === 'judge'" class="practice-options">
          <div
            class="practice-option"
            :class="{
              'option-selected': practiceAnswer === '正确',
              'option-correct': showPracticeFeedback && currentPracticeQuestion.answer === '正确',
              'option-wrong': showPracticeFeedback && practiceAnswer === '正确' && currentPracticeQuestion.answer !== '正确'
            }"
            @click="practiceAnswer = '正确'"
          >
            正确
          </div>
          <div
            class="practice-option"
            :class="{
              'option-selected': practiceAnswer === '错误',
              'option-correct': showPracticeFeedback && currentPracticeQuestion.answer === '错误',
              'option-wrong': showPracticeFeedback && practiceAnswer === '错误' && currentPracticeQuestion.answer !== '错误'
            }"
            @click="practiceAnswer = '错误'"
          >
            错误
          </div>
        </div>

        <!-- Fill -->
        <div v-if="currentPracticeQuestion.type === 'fill'">
          <el-input v-model="practiceAnswer" placeholder="请输入答案" size="large" />
        </div>

        <!-- Essay -->
        <div v-if="currentPracticeQuestion.type === 'essay'">
          <el-input v-model="practiceAnswer" type="textarea" :rows="4" placeholder="请输入答案" />
        </div>

        <!-- Practice Feedback -->
        <div v-if="showPracticeFeedback" class="practice-feedback" :class="isPracticeCorrect ? 'feedback-correct' : 'feedback-wrong'">
          <span v-if="isPracticeCorrect">&#x2705; 正确！</span>
          <span v-else>&#x274C; 错误！正确答案：{{ currentPracticeQuestion.answer }}</span>
          <p v-if="currentPracticeQuestion.analysis">{{ currentPracticeQuestion.analysis }}</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="practiceVisible = false">关闭</el-button>
        <el-button v-if="!showPracticeFeedback" type="primary" @click="submitPracticeAnswer" :disabled="!practiceAnswer">
          确认答案
        </el-button>
        <el-button v-else type="primary" @click="nextPracticeQuestion">
          {{ practiceIndex < practiceQuestions.length - 1 ? '下一题' : '完成练习' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Clear Password Dialog -->
    <el-dialog v-model="clearDialogVisible" title="清空错题库" width="400px">
      <p>此操作将清空所有错题记录，请输入密码确认：</p>
      <el-input v-model="clearPassword" type="password" placeholder="请输入密码" show-password />
      <template #footer>
        <el-button @click="clearDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmClearAll" :loading="clearLoading">确认清空</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { secureStorage } from '../utils/security'
import { wrongQuestionApi, categoryApi, userApi } from '../api'
import type { User, WrongQuestion, Question } from '../types'

const router = useRouter()
const user = ref<User | null>(null)
const wrongQuestions = ref<WrongQuestion[]>([])
const categories = ref<{ id: number; name: string }[]>([])
const selectedCategory = ref('')

const filteredQuestions = computed(() => {
  if (!selectedCategory.value) return wrongQuestions.value
  return wrongQuestions.value.filter(wq => wq.question.category === selectedCategory.value)
})

// Practice mode
const practiceVisible = ref(false)
const practiceQuestions = ref<Question[]>([])
const practiceIndex = ref(0)
const practiceAnswer = ref('')
const practiceMultipleAnswers = ref<string[]>([])
const showPracticeFeedback = ref(false)
const isPracticeCorrect = ref(false)

const currentPracticeQuestion = computed(() => practiceQuestions.value[practiceIndex.value] || null)

// Clear dialog
const clearDialogVisible = ref(false)
const clearPassword = ref('')
const clearLoading = ref(false)

onMounted(() => {
  user.value = secureStorage.getItem<User>('user')
  if (user.value) {
    wrongQuestions.value = wrongQuestionApi.getWrongQuestionsByUserId(user.value.id)
  }
  categories.value = categoryApi.getAllCategories()
})

function filterQuestions() {
  // Computed property handles filtering
}

function getTypeTag(type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    single: 'primary', multiple: 'success', judge: 'warning', fill: 'info', essay: 'danger'
  }
  return map[type] || 'primary'
}

function getTypeText(type: string): string {
  const map: Record<string, string> = {
    single: '单选题', multiple: '多选题', judge: '判断题', fill: '填空题', essay: '问答题'
  }
  return map[type] || '未知'
}

function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index)
}

function removeWrongQuestion(questionId: number) {
  if (!user.value) return
  wrongQuestionApi.removeWrongQuestion(user.value.id, questionId)
  wrongQuestions.value = wrongQuestionApi.getWrongQuestionsByUserId(user.value.id)
  ElMessage.success('已移至回收站')
}

function handleClearAll() {
  clearPassword.value = ''
  clearDialogVisible.value = true
}

async function confirmClearAll() {
  if (!user.value) return
  clearLoading.value = true
  try {
    const isValid = await wrongQuestionApi.verifyUserPassword(user.value.id, clearPassword.value)
    if (!isValid) {
      ElMessage.error('密码错误')
      return
    }
    wrongQuestionApi.clearAllWrongQuestions(user.value.id)
    wrongQuestions.value = []
    clearDialogVisible.value = false
    ElMessage.success('错题库已清空')
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    clearLoading.value = false
  }
}

function startPractice() {
  practiceQuestions.value = [...filteredQuestions.value].map(wq => wq.question)
  practiceIndex.value = 0
  practiceAnswer.value = ''
  practiceMultipleAnswers.value = []
  showPracticeFeedback.value = false
  practiceVisible.value = true
}

function togglePracticeMultiple(label: string) {
  const idx = practiceMultipleAnswers.value.indexOf(label)
  if (idx === -1) {
    practiceMultipleAnswers.value.push(label)
  } else {
    practiceMultipleAnswers.value.splice(idx, 1)
  }
  practiceMultipleAnswers.value.sort()
  practiceAnswer.value = practiceMultipleAnswers.value.join('')
}

function submitPracticeAnswer() {
  if (!currentPracticeQuestion.value) return
  const answer = currentPracticeQuestion.value.type === 'multiple'
    ? practiceMultipleAnswers.value.join('')
    : practiceAnswer.value

  isPracticeCorrect.value = checkPracticeAnswer(currentPracticeQuestion.value, answer)
  showPracticeFeedback.value = true
}

function checkPracticeAnswer(question: Question, userAnswer: string): boolean {
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

function nextPracticeQuestion() {
  if (practiceIndex.value < practiceQuestions.value.length - 1) {
    practiceIndex.value++
    practiceAnswer.value = ''
    practiceMultipleAnswers.value = []
    showPracticeFeedback.value = false
  } else {
    practiceVisible.value = false
    ElMessage.success('练习完成！')
    if (user.value) {
      wrongQuestions.value = wrongQuestionApi.getWrongQuestionsByUserId(user.value.id)
    }
  }
}

function handleLogout() {
  userApi.logout()
  user.value = null
  router.push('/')
}
</script>

<style scoped>
.wrong-questions-page {
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

.logo-icon { font-size: 1.5rem; }

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
}

.nav-link:hover { color: #667eea; }

.login-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff !important;
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-weight: 500;
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

/* Page Content */
.page-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 5rem 1.5rem 2rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Wrong List */
.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wrong-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #f5222d;
}

.wrong-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.wrong-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wrong-count {
  font-size: 0.85rem;
  color: #f5222d;
  font-weight: 500;
}

.wrong-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 0.75rem;
}

.wrong-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.wrong-option {
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

.option-wrong {
  background: #fff2f0;
  color: #f5222d;
  text-decoration: line-through;
}

.wrong-answers {
  margin-bottom: 0.5rem;
}

.wrong-answers p {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.answer-label {
  color: #999;
}

.text-correct { color: #52c41a; font-weight: 500; }
.text-wrong { color: #f5222d; font-weight: 500; }

.wrong-analysis {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 1.5rem;
  color: #999;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Practice Dialog */
.practice-area {
  padding: 0.5rem 0;
}

.practice-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.practice-score {
  color: #f5a623;
  font-weight: 600;
  font-size: 0.9rem;
}

.practice-question {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 1.25rem;
}

.practice-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.practice-option {
  padding: 0.85rem 1rem;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.practice-option:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.option-selected {
  border-color: #667eea;
  background: #f0f3ff;
}

.practice-feedback {
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  font-size: 0.95rem;
}

.feedback-correct {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
}

.feedback-wrong {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #f5222d;
}

.practice-feedback p {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
