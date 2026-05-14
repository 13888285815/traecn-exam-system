<template>
  <div class="page-container">
    <div class="page-header">
      <h2>新增试卷</h2>
      <p class="page-desc">创建新的考试试卷，从题库中选择题目并设置考试参数</p>
    </div>

    <el-steps :active="activeStep" finish-status="success" align-center class="steps-bar">
      <el-step title="基本信息" />
      <el-step title="选择题目" />
      <el-step title="试卷设置" />
      <el-step title="完成" />
    </el-steps>

    <!-- 步骤1：基本信息 -->
    <el-card v-show="activeStep === 0" shadow="hover" class="step-card">
      <template #header><span>试卷基本信息</span></template>
      <el-form ref="basicFormRef" :model="paperForm" :rules="basicRules" label-width="100px" style="max-width: 600px">
        <el-form-item label="试卷名称" prop="name">
          <el-input v-model="paperForm.name" placeholder="请输入试卷名称" maxlength="80" show-word-limit />
        </el-form-item>
        <el-form-item label="试卷描述" prop="description">
          <el-input v-model="paperForm.description" type="textarea" :rows="3" placeholder="请输入试卷描述" maxlength="300" show-word-limit />
        </el-form-item>
        <el-form-item label="考试时长" prop="duration">
          <el-input-number v-model="paperForm.duration" :min="10" :max="300" :step="5" />
          <span class="form-tip">分钟</span>
        </el-form-item>
        <el-form-item label="总分" prop="totalScore">
          <el-input-number v-model="paperForm.totalScore" :min="10" :max="1000" :step="10" />
          <span class="form-tip">分</span>
        </el-form-item>
        <el-form-item label="及格分数" prop="passScore">
          <el-input-number v-model="paperForm.passScore" :min="0" :max="paperForm.totalScore" :step="5" />
          <span class="form-tip">分</span>
        </el-form-item>
        <el-form-item label="试卷分类">
          <el-select v-model="paperForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="期末考试" value="final" />
            <el-option label="随堂测验" value="quiz" />
            <el-option label="模拟考试" value="mock" />
            <el-option label="专项练习" value="practice" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 步骤2：选择题目 -->
    <el-card v-show="activeStep === 1" shadow="hover" class="step-card">
      <template #header>
        <div class="card-header">
          <span>选择题目（已选 {{ selectedQuestions.length }} 题，总分 {{ selectedTotalScore }} 分）</span>
        </div>
      </template>

      <div class="question-selector">
        <!-- 题库筛选 -->
        <div class="selector-filter">
          <el-select v-model="questionFilter.bank" placeholder="选择题库" style="width: 200px">
            <el-option label="计算机基础期末题库" value="1" />
            <el-option label="数据结构练习题" value="2" />
            <el-option label="操作系统原理题库" value="3" />
          </el-select>
          <el-select v-model="questionFilter.type" placeholder="题型筛选" clearable style="width: 140px">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="judge" />
            <el-option label="填空题" value="fill" />
            <el-option label="简答题" value="essay" />
          </el-select>
          <el-select v-model="questionFilter.difficulty" placeholder="难度筛选" clearable style="width: 120px">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
          <el-input v-model="questionFilter.keyword" placeholder="搜索题目..." clearable style="width: 200px" prefix-icon="Search" />
        </div>

        <el-row :gutter="16">
          <!-- 题目列表 -->
          <el-col :span="14">
            <div class="question-pool">
              <div v-for="q in availableQuestions" :key="q.id" class="question-pool-item" :class="{ selected: isSelected(q.id) }">
                <div class="pool-item-header">
                  <el-checkbox :model-value="isSelected(q.id)" @change="toggleQuestion(q)" />
                  <el-tag :type="typeTagType(q.type)" size="small">{{ q.type }}</el-tag>
                  <el-tag :type="difficultyTagType(q.difficulty)" size="small">{{ q.difficulty }}</el-tag>
                  <el-input-number v-if="isSelected(q.id)" v-model="q.score" :min="1" :max="50" size="small" style="width: 100px; margin-left: auto" />
                  <span v-else class="pool-score">{{ q.score }}分</span>
                </div>
                <p class="pool-content">{{ q.content }}</p>
              </div>
            </div>
          </el-col>

          <!-- 已选题目 -->
          <el-col :span="10">
            <div class="selected-panel">
              <h4>已选题目（{{ selectedQuestions.length }}）</h4>
              <div class="selected-list">
                <div v-for="(q, index) in selectedQuestions" :key="q.id" class="selected-item">
                  <span class="selected-index">{{ index + 1 }}</span>
                  <span class="selected-content">{{ q.content.substring(0, 30) }}...</span>
                  <span class="selected-score">{{ q.score }}分</span>
                  <el-icon class="remove-btn" @click="toggleQuestion(q)"><Close /></el-icon>
                </div>
              </div>
              <el-empty v-if="!selectedQuestions.length" description="请从左侧选择题目" :image-size="60" />
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 步骤3：试卷设置 -->
    <el-card v-show="activeStep === 2" shadow="hover" class="step-card">
      <template #header><span>试卷设置</span></template>
      <el-form label-width="160px" style="max-width: 600px">
        <el-form-item label="随机打乱题目顺序">
          <el-switch v-model="paperSettings.shuffleQuestions" />
          <span class="form-tip">开启后每位考生的题目顺序不同</span>
        </el-form-item>
        <el-form-item label="随机打乱选项顺序">
          <el-switch v-model="paperSettings.shuffleOptions" />
          <span class="form-tip">开启后选择题的选项顺序随机</span>
        </el-form-item>
        <el-form-item label="考试结束后显示答案">
          <el-switch v-model="paperSettings.showAnswer" />
          <span class="form-tip">考生交卷后可查看正确答案</span>
        </el-form-item>
        <el-form-item label="显示答案解析">
          <el-switch v-model="paperSettings.showAnalysis" />
          <span class="form-tip">在答案中显示详细解析</span>
        </el-form-item>
        <el-form-item label="防作弊模式">
          <el-switch v-model="paperSettings.antiCheat" />
          <span class="form-tip">开启切屏检测和复制限制</span>
        </el-form-item>
        <el-form-item label="考试时间限制">
          <el-switch v-model="paperSettings.timeLimit" />
          <span class="form-tip">到时自动交卷</span>
        </el-form-item>
        <el-form-item label="允许查看历史成绩">
          <el-switch v-model="paperSettings.viewHistory" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 步骤4：完成 -->
    <el-card v-show="activeStep === 3" shadow="hover" class="step-card">
      <template #header><span>试卷预览</span></template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="试卷名称">{{ paperForm.name }}</el-descriptions-item>
        <el-descriptions-item label="试卷分类">{{ paperForm.category }}</el-descriptions-item>
        <el-descriptions-item label="考试时长">{{ paperForm.duration }} 分钟</el-descriptions-item>
        <el-descriptions-item label="总分">{{ paperForm.totalScore }} 分</el-descriptions-item>
        <el-descriptions-item label="及格分数">{{ paperForm.passScore }} 分</el-descriptions-item>
        <el-descriptions-item label="题目数量">{{ selectedQuestions.length }} 题</el-descriptions-item>
        <el-descriptions-item label="随机题目">{{ paperSettings.shuffleQuestions ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="防作弊">{{ paperSettings.antiCheat ? '是' : '否' }}</el-descriptions-item>
      </el-descriptions>
      <div class="preview-questions">
        <h4>题目列表</h4>
        <div v-for="(q, index) in selectedQuestions" :key="q.id" class="preview-item">
          <span class="preview-index">{{ index + 1 }}.</span>
          <el-tag :type="typeTagType(q.type)" size="small">{{ q.type }}</el-tag>
          <span class="preview-content">{{ q.content }}</span>
          <span class="preview-score">{{ q.score }}分</span>
        </div>
      </div>
    </el-card>

    <!-- 底部按钮 -->
    <div class="step-actions">
      <el-button v-if="activeStep > 0" @click="activeStep--">上一步</el-button>
      <el-button v-if="activeStep < 3" type="primary" @click="handleNext">下一步</el-button>
      <el-button v-if="activeStep === 3" type="success" @click="handleSave">保存试卷</el-button>
      <el-button v-if="activeStep === 3" type="primary" @click="handlePublish">保存并发布</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Close } from '@element-plus/icons-vue'

const activeStep = ref(0)
const basicFormRef = ref<FormInstance>()

const paperForm = reactive({
  name: '',
  description: '',
  duration: 60,
  totalScore: 100,
  passScore: 60,
  category: ''
})

const basicRules: FormRules = {
  name: [{ required: true, message: '请输入试卷名称', trigger: 'blur' }],
  duration: [{ required: true, message: '请设置考试时长', trigger: 'change' }],
  totalScore: [{ required: true, message: '请设置总分', trigger: 'change' }],
  passScore: [{ required: true, message: '请设置及格分数', trigger: 'change' }]
}

const paperSettings = reactive({
  shuffleQuestions: false,
  shuffleOptions: false,
  showAnswer: true,
  showAnalysis: true,
  antiCheat: false,
  timeLimit: true,
  viewHistory: true
})

const questionFilter = reactive({
  bank: '',
  type: '',
  difficulty: '',
  keyword: ''
})

const availableQuestions = ref([
  { id: 1, content: 'TCP协议工作在OSI模型的哪一层？', type: '单选题', difficulty: '简单', score: 5 },
  { id: 2, content: '以下哪些是面向对象编程的特征？', type: '多选题', difficulty: '中等', score: 8 },
  { id: 3, content: '进程是资源分配的基本单位。', type: '判断题', difficulty: '简单', score: 3 },
  { id: 4, content: '快速排序的最坏时间复杂度是？', type: '单选题', difficulty: '中等', score: 5 },
  { id: 5, content: 'HTTP默认端口号是____。', type: '填空题', difficulty: '简单', score: 4 },
  { id: 6, content: '请简述数据库事务的ACID特性。', type: '简答题', difficulty: '困难', score: 15 },
  { id: 7, content: '二叉树的中序遍历结果是？', type: '单选题', difficulty: '中等', score: 5 },
  { id: 8, content: '以下哪些排序算法是稳定的？', type: '多选题', difficulty: '困难', score: 8 }
])

const selectedQuestions = ref<any[]>([])

const selectedTotalScore = computed(() => selectedQuestions.value.reduce((sum, q) => sum + q.score, 0))

function isSelected(id: number) {
  return selectedQuestions.value.some(q => q.id === id)
}

function toggleQuestion(q: any) {
  const idx = selectedQuestions.value.findIndex(item => item.id === q.id)
  if (idx > -1) {
    selectedQuestions.value.splice(idx, 1)
  } else {
    selectedQuestions.value.push({ ...q })
  }
}

function typeTagType(type: string) {
  const map: Record<string, string> = { '单选题': '', '多选题': 'success', '判断题': 'warning', '填空题': 'info', '简答题': 'danger' }
  return map[type] || 'info'
}
function difficultyTagType(diff: string) {
  const map: Record<string, string> = { '简单': 'success', '中等': 'warning', '困难': 'danger' }
  return map[diff] || 'info'
}

function handleNext() {
  if (activeStep.value === 0) {
    basicFormRef.value?.validate((valid) => {
      if (valid) activeStep.value++
    })
  } else if (activeStep.value === 1) {
    if (!selectedQuestions.value.length) {
      ElMessage.warning('请至少选择一道题目')
      return
    }
    activeStep.value++
  } else {
    activeStep.value++
  }
}

function handleSave() {
  ElMessage.success('试卷保存成功')
}

function handlePublish() {
  ElMessage.success('试卷已保存并发布')
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.steps-bar { margin-bottom: 24px; }
.step-card { margin-bottom: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.form-tip { margin-left: 8px; color: #909399; font-size: 13px; }
.selector-filter { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.question-pool { max-height: 400px; overflow-y: auto; }
.question-pool-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.question-pool-item:hover { border-color: #4A6CF7; }
.question-pool-item.selected { border-color: #4A6CF7; background: #f0f4ff; }
.pool-item-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.pool-score { margin-left: auto; font-size: 13px; color: #909399; }
.pool-content { font-size: 14px; color: #303133; margin: 0; }
.selected-panel {
  background: #f8f9fb;
  border-radius: 8px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}
.selected-panel h4 { margin: 0 0 12px; font-size: 14px; color: #303133; }
.selected-list { display: flex; flex-direction: column; gap: 6px; }
.selected-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
}
.selected-index { color: #4A6CF7; font-weight: 600; min-width: 20px; }
.selected-content { flex: 1; color: #606266; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.selected-score { color: #E6A23C; font-weight: 500; }
.remove-btn { cursor: pointer; color: #F56C6C; }
.remove-btn:hover { transform: scale(1.2); }
.preview-questions { margin-top: 20px; }
.preview-questions h4 { margin: 0 0 12px; }
.preview-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f0f2f5; }
.preview-index { font-weight: 600; color: #303133; }
.preview-content { flex: 1; font-size: 14px; color: #606266; }
.preview-score { color: #E6A23C; font-weight: 500; }
.step-actions { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }
</style>
