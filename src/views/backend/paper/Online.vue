<template>
  <div class="page-container">
    <div class="page-header">
      <h2>在线组卷</h2>
      <p class="page-desc">通过拖拽方式从题库中选择题目，快速组卷</p>
    </div>

    <el-row :gutter="16" class="main-layout">
      <!-- 左侧：题库树 -->
      <el-col :span="5">
        <el-card shadow="hover" class="bank-tree-card">
          <template #header><span>题库</span></template>
          <el-input v-model="treeFilter" placeholder="搜索题库..." prefix-icon="Search" size="small" clearable style="margin-bottom: 12px" />
          <el-tree
            :data="bankTreeData"
            :props="{ label: 'label', children: 'children' }"
            :filter-node-method="filterNode"
            ref="treeRef"
            node-key="id"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <el-icon v-if="data.icon"><component :is="data.icon" /></el-icon>
                <span>{{ node.label }}</span>
                <el-badge v-if="data.count" :value="data.count" :max="99" type="info" />
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 中间：题目选择 -->
      <el-col :span="12">
        <el-card shadow="hover" class="question-pool-card">
          <template #header>
            <div class="card-header">
              <span>{{ currentBankName }} - 题目列表</span>
              <div class="pool-filter">
                <el-select v-model="qFilter.type" placeholder="题型" clearable size="small" style="width: 100px">
                  <el-option label="单选" value="single" />
                  <el-option label="多选" value="multiple" />
                  <el-option label="判断" value="judge" />
                  <el-option label="填空" value="fill" />
                </el-select>
                <el-select v-model="qFilter.difficulty" placeholder="难度" clearable size="small" style="width: 90px">
                  <el-option label="简单" value="easy" />
                  <el-option label="中等" value="medium" />
                  <el-option label="困难" value="hard" />
                </el-select>
              </div>
            </div>
          </template>

          <div class="question-list">
            <div v-for="q in poolQuestions" :key="q.id" class="pool-question-item" draggable="true" @dragstart="handleDragStart(q)">
              <div class="pq-header">
                <el-tag :type="typeTagType(q.type)" size="small">{{ q.type }}</el-tag>
                <el-tag :type="diffTagType(q.difficulty)" size="small">{{ q.difficulty }}</el-tag>
                <el-button size="small" type="primary" circle @click="addToPaper(q)">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </div>
              <p class="pq-content">{{ q.content }}</p>
              <div v-if="q.options" class="pq-options">
                <span v-for="opt in q.options" :key="opt" class="pq-option">{{ opt }}</span>
              </div>
            </div>
          </div>
          <el-empty v-if="!poolQuestions.length" description="请从左侧选择题库" :image-size="60" />
        </el-card>
      </el-col>

      <!-- 右侧：组卷区域 -->
      <el-col :span="7">
        <el-card shadow="hover" class="paper-panel-card">
          <template #header>
            <div class="card-header">
              <span>试卷题目（{{ paperQuestions.length }}）</span>
              <el-button size="small" type="danger" @click="paperQuestions = []">清空</el-button>
            </div>
          </template>

          <!-- 试卷基本信息 -->
          <el-form size="small" label-position="top" class="paper-form">
            <el-form-item label="试卷名称">
              <el-input v-model="paperName" placeholder="请输入试卷名称" />
            </el-form-item>
            <el-form-item label="考试时长">
              <el-input-number v-model="paperDuration" :min="10" :max="300" style="width: 100%" />
            </el-form-item>
          </el-form>

          <!-- 已选题目列表 -->
          <div
            class="paper-drop-zone"
            @dragover.prevent
            @drop="handleDrop"
          >
            <div v-for="(q, index) in paperQuestions" :key="q.id" class="paper-question-item">
              <div class="pq-item-header">
                <span class="pq-index">{{ index + 1 }}</span>
                <el-tag :type="typeTagType(q.type)" size="small">{{ q.type }}</el-tag>
                <el-input-number v-model="q.score" :min="1" :max="50" size="small" style="width: 80px" />
                <el-icon class="pq-remove" @click="removeFromPaper(index)"><Close /></el-icon>
              </div>
              <p class="pq-item-content">{{ q.content.substring(0, 40) }}...</p>
            </div>
            <div v-if="!paperQuestions.length" class="drop-placeholder">
              <el-icon :size="32" color="#c0c4cc"><Upload /></el-icon>
              <p>拖拽题目到此处或点击添加</p>
            </div>
          </div>

          <!-- 试卷统计 -->
          <div class="paper-stats">
            <div class="ps-item">
              <span>题目数量</span>
              <strong>{{ paperQuestions.length }}</strong>
            </div>
            <div class="ps-item">
              <span>总分</span>
              <strong>{{ paperTotalScore }}</strong>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="paper-actions">
            <el-button type="primary" @click="handlePreview" :disabled="!paperQuestions.length">预览试卷</el-button>
            <el-button type="success" @click="handleSave" :disabled="!paperQuestions.length">保存试卷</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 试卷预览对话框 -->
    <el-dialog v-model="showPreview" title="试卷预览" width="700px" destroy-on-close>
      <div class="preview-paper">
        <h3>{{ paperName || '未命名试卷' }}</h3>
        <p class="preview-meta">考试时长：{{ paperDuration }}分钟 | 总分：{{ paperTotalScore }}分 | 题目数：{{ paperQuestions.length }}</p>
        <el-divider />
        <div v-for="(q, index) in paperQuestions" :key="q.id" class="preview-question">
          <p><strong>{{ index + 1 }}.</strong> {{ q.content }}（{{ q.score }}分）</p>
          <div v-if="q.options" class="preview-options">
            <p v-for="opt in q.options" :key="opt" style="margin: 4px 0; padding-left: 20px; color: #606266">{{ opt }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Close, Upload, Collection, Document } from '@element-plus/icons-vue'
import type { ElTree } from 'element-plus'

const treeRef = ref<InstanceType<typeof ElTree>>()
const treeFilter = ref('')
const currentBankName = ref('全部题目')
const paperName = ref('')
const paperDuration = ref(60)
const showPreview = ref(false)

const qFilter = ref({ type: '', difficulty: '' })

const bankTreeData = [
  { id: 1, label: '计算机基础', icon: 'Collection', count: 120, children: [
    { id: 11, label: '单选题', count: 50 },
    { id: 12, label: '多选题', count: 30 },
    { id: 13, label: '判断题', count: 25 },
    { id: 14, label: '填空题', count: 15 }
  ]},
  { id: 2, label: '数据结构', icon: 'Collection', count: 85, children: [
    { id: 21, label: '单选题', count: 35 },
    { id: 22, label: '多选题', count: 20 },
    { id: 23, label: '简答题', count: 30 }
  ]},
  { id: 3, label: '操作系统', icon: 'Collection', count: 60 },
  { id: 4, label: '计算机网络', icon: 'Collection', count: 45 },
  { id: 5, label: '数据库原理', icon: 'Collection', count: 75 }
]

const poolQuestions = ref([
  { id: 1, content: 'TCP协议工作在OSI模型的哪一层？', type: '单选题', difficulty: '简单', score: 5, options: ['A. 应用层', 'B. 传输层', 'C. 网络层', 'D. 数据链路层'] },
  { id: 2, content: '以下哪些是面向对象编程的特征？', type: '多选题', difficulty: '中等', score: 8, options: ['A. 封装', 'B. 继承', 'C. 多态', 'D. 抽象'] },
  { id: 3, content: '进程是资源分配的基本单位。', type: '判断题', difficulty: '简单', score: 3, options: null },
  { id: 4, content: '快速排序的最坏时间复杂度是？', type: '单选题', difficulty: '中等', score: 5, options: ['A. O(n)', 'B. O(n log n)', 'C. O(n^2)', 'D. O(log n)'] },
  { id: 5, content: 'HTTP默认端口号是____。', type: '填空题', difficulty: '简单', score: 4, options: null },
  { id: 6, content: '请简述数据库事务的ACID特性。', type: '简答题', difficulty: '困难', score: 15, options: null }
])

const paperQuestions = ref<any[]>([])
const dragQuestion = ref<any>(null)

const paperTotalScore = computed(() => paperQuestions.value.reduce((sum, q) => sum + q.score, 0))

function filterNode(value: string, data: any) {
  if (!value) return true
  return data.label.includes(value)
}

function handleNodeClick(data: any) {
  currentBankName.value = data.label
}

function typeTagType(type: string) {
  const map: Record<string, string> = { '单选题': '', '多选题': 'success', '判断题': 'warning', '填空题': 'info', '简答题': 'danger' }
  return map[type] || 'info'
}
function diffTagType(diff: string) {
  const map: Record<string, string> = { '简单': 'success', '中等': 'warning', '困难': 'danger' }
  return map[diff] || 'info'
}

function handleDragStart(q: any) {
  dragQuestion.value = q
}

function handleDrop() {
  if (dragQuestion.value) {
    addToPaper(dragQuestion.value)
    dragQuestion.value = null
  }
}

function addToPaper(q: any) {
  if (paperQuestions.value.some(pq => pq.id === q.id)) {
    ElMessage.warning('该题目已在试卷中')
    return
  }
  paperQuestions.value.push({ ...q })
  ElMessage.success('已添加到试卷')
}

function removeFromPaper(index: number) {
  paperQuestions.value.splice(index, 1)
}

function handlePreview() {
  showPreview.value = true
}

function handleSave() {
  if (!paperName.value) {
    ElMessage.warning('请输入试卷名称')
    return
  }
  ElMessage.success('试卷保存成功')
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.main-layout { min-height: calc(100vh - 200px); }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.pool-filter { display: flex; gap: 8px; }
.tree-node { display: flex; align-items: center; gap: 6px; flex: 1; font-size: 13px; }
.bank-tree-card { height: 100%; }
.question-list { max-height: calc(100vh - 340px); overflow-y: auto; }
.pool-question-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: grab;
  transition: all 0.2s;
}
.pool-question-item:hover { border-color: #4A6CF7; box-shadow: 0 2px 8px rgba(74, 108, 247, 0.15); }
.pq-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.pq-content { font-size: 14px; color: #303133; margin: 0 0 6px; }
.pq-options { display: flex; flex-wrap: wrap; gap: 6px; }
.pq-option { font-size: 12px; color: #909399; background: #f5f7fa; padding: 2px 8px; border-radius: 4px; }
.paper-form { margin-bottom: 16px; }
.paper-drop-zone {
  min-height: 200px;
  max-height: 350px;
  overflow-y: auto;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 8px;
  transition: border-color 0.2s;
}
.paper-drop-zone:active { border-color: #4A6CF7; }
.paper-question-item { padding: 8px; border: 1px solid #ebeef5; border-radius: 4px; margin-bottom: 6px; }
.pq-item-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.pq-index { font-weight: 600; color: #4A6CF7; font-size: 13px; }
.pq-remove { cursor: pointer; color: #F56C6C; margin-left: auto; }
.pq-item-content { font-size: 13px; color: #606266; margin: 0; }
.drop-placeholder { text-align: center; padding: 30px; color: #c0c4cc; }
.drop-placeholder p { margin: 8px 0 0; font-size: 13px; }
.paper-stats { display: flex; gap: 16px; margin-top: 12px; padding: 12px; background: #f8f9fb; border-radius: 6px; }
.ps-item { display: flex; justify-content: space-between; flex: 1; font-size: 13px; color: #606266; }
.ps-item strong { color: #4A6CF7; }
.paper-actions { display: flex; gap: 8px; margin-top: 12px; }
.paper-actions .el-button { flex: 1; }
.preview-paper h3 { margin: 0 0 8px; }
.preview-meta { color: #909399; font-size: 13px; margin: 0 0 16px; }
.preview-question { margin-bottom: 16px; }
.preview-question p { margin: 4px 0; line-height: 1.6; }
</style>
