<template>
  <div class="question-detail-page" v-if="bank">
    <!-- ==================== 题库信息头部 ==================== -->
    <el-card shadow="never" class="bank-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="bank-name">{{ bank.name }}</h1>
          <p class="bank-desc">{{ bank.description }}</p>
          <div class="bank-tags">
            <el-tag type="primary">{{ bank.name }}</el-tag>
            <el-tag type="info">题库</el-tag>
          </div>
          <div class="bank-meta">
            <span><el-icon><Document /></el-icon> {{ bank.questionCount }} 道题目</span>
            <span>
              <el-icon color="#E6A23C"><Star /></el-icon>
              {{ rating }}
            </span>
            <span class="price-free">免费</span>
          </div>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="large" @click="startPractice">
            <el-icon><EditPen /></el-icon> 开始练习
          </el-button>
          <el-button size="large" @click="handleFavorite">
            <el-icon><StarFilled v-if="isFavorited" /><Star v-else /></el-icon>
            {{ isFavorited ? '已收藏' : '收藏' }}
          </el-button>
          <el-button size="large" type="success" plain>
            <el-icon><ShoppingCart /></el-icon> 购买
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- ==================== 题目列表 ==================== -->
    <el-card shadow="never" class="questions-card">
      <template #header>
        <div class="card-header">
          <h2>题目列表</h2>
          <el-tag>共 {{ questions.length }} 题</el-tag>
        </div>
      </template>
      <div class="question-list">
        <div v-for="(q, index) in questions" :key="q.id" class="question-item">
          <div class="question-top">
            <span class="question-index">第 {{ index + 1 }} 题</span>
            <el-tag :type="typeTagMap[q.type]" size="small">{{ typeNameMap[q.type] }}</el-tag>
            <el-tag
              :type="q.difficulty <= 2 ? 'success' : q.difficulty <= 3 ? 'warning' : 'danger'"
              size="small"
            >
              {{ difficultyMap[q.difficulty] }}
            </el-tag>
            <span class="question-score">{{ q.score }} 分</span>
          </div>
          <div class="question-content">{{ q.content }}</div>
          <div v-if="q.options && q.options.length" class="question-options">
            <div v-for="(opt, oi) in q.options" :key="oi" class="option-item">
              <span class="option-label">{{ optionLabels[oi] }}.</span>
              <span>{{ opt }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-if="questions.length === 0" description="暂无题目" />
    </el-card>
  </div>

  <!-- ==================== 加载中 ==================== -->
  <div v-else class="loading-wrap">
    <el-empty description="题库不存在" />
    <el-button type="primary" @click="$router.push('/question')">返回题库列表</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, Star, StarFilled, EditPen, ShoppingCart } from '@element-plus/icons-vue'
import { mockQuestionBanks, mockQuestions } from '../../data/mockData'

const route = useRoute()
const router = useRouter()

// ---- 题库信息 ----
const bank = computed(() => {
  const id = Number(route.params.id)
  return mockQuestionBanks.find(b => b.id === id)
})

const rating = computed(() => {
  if (!bank.value) return 0
  return parseFloat((4 + bank.value.id * 0.1).toFixed(1))
})

const isFavorited = ref(false)

// ---- 题目列表 ----
const questions = computed(() => {
  if (!bank.value) return []
  return mockQuestions.filter(q => q.category === bank.value!.name)
})

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

// ---- 操作 ----
function startPractice() {
  if (!bank.value) return
  router.push({ path: '/question/practice', query: { bankId: String(bank.value.id) } })
}

function handleFavorite() {
  isFavorited.value = !isFavorited.value
  ElMessage.success(isFavorited.value ? '已收藏' : '已取消收藏')
}
</script>

<style scoped>
.question-detail-page {
  max-width: 100%;
}

/* ==================== 头部 ==================== */
.bank-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
}

.bank-name {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 12px;
}

.bank-desc {
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
  margin-bottom: 16px;
}

.bank-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.bank-meta {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 14px;
  color: #606266;
}

.bank-meta > span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-free {
  font-size: 20px;
  font-weight: 700;
  color: #67C23A !important;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

/* ==================== 题目列表 ==================== */
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

.question-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-item {
  padding: 16px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.question-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.question-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.question-index {
  font-size: 14px;
  font-weight: 600;
  color: #4A6CF7;
}

.question-score {
  margin-left: auto;
  font-size: 13px;
  color: #909399;
}

.question-content {
  font-size: 15px;
  color: #303133;
  line-height: 1.6;
  margin-bottom: 12px;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 8px;
}

.option-item {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.option-label {
  font-weight: 600;
  color: #303133;
  margin-right: 8px;
}

/* ==================== 加载 ==================== */
.loading-wrap {
  text-align: center;
  padding: 80px 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }

  .header-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
