<template>
  <div class="page-container">
    <div class="page-header">
      <h2>AI导题</h2>
      <p class="page-desc">通过AI智能解析，将文本格式的题目批量导入到题库中</p>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：输入区域 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>粘贴题目文本</span>
              <el-button size="small" type="info" @click="loadExample">加载示例</el-button>
            </div>
          </template>

          <el-input
            v-model="inputText"
            type="textarea"
            :rows="16"
            placeholder="请粘贴题目文本，支持以下格式：&#10;&#10;1. 题目内容&#10;A. 选项A&#10;B. 选项B&#10;C. 选项C&#10;D. 选项D&#10;答案：A&#10;&#10;2. 题目内容&#10;答案：正确/错误&#10;&#10;支持单选题、多选题、判断题、填空题等题型"
          />

          <div class="action-bar">
            <el-select v-model="targetBank" placeholder="选择目标题库" style="width: 200px">
              <el-option label="计算机基础期末题库" value="1" />
              <el-option label="数据结构练习题" value="2" />
              <el-option label="新建题库" value="new" />
            </el-select>
            <el-button type="primary" :loading="parsing" @click="handleParse" :disabled="!inputText.trim()">
              <el-icon><MagicStick /></el-icon>AI智能解析
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：解析结果 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>解析结果预览</span>
              <el-tag v-if="parsedQuestions.length" type="success" size="small">
                成功解析 {{ parsedQuestions.length }} 道题目
              </el-tag>
            </div>
          </template>

          <!-- 解析进度 -->
          <div v-if="parsing" class="parse-progress">
            <el-progress :percentage="parseProgress" :stroke-width="10" status="success" />
            <p class="progress-text">AI正在解析中，请稍候...</p>
          </div>

          <!-- 解析结果列表 -->
          <div v-if="parsedQuestions.length && !parsing" class="parsed-list">
            <div v-for="(q, index) in parsedQuestions" :key="index" class="parsed-item">
              <div class="parsed-item-header">
                <el-tag :type="typeTagType(q.type)" size="small">{{ q.type }}</el-tag>
                <span class="parsed-index">第 {{ index + 1 }} 题</span>
                <el-tag :type="q.confidence >= 90 ? 'success' : q.confidence >= 70 ? 'warning' : 'danger'" size="small">
                  置信度 {{ q.confidence }}%
                </el-tag>
              </div>
              <p class="parsed-content">{{ q.content }}</p>
              <div v-if="q.options" class="parsed-options">
                <div v-for="(opt, oi) in q.options" :key="oi" class="parsed-option">
                  {{ opt }}
                </div>
              </div>
              <div class="parsed-answer">
                <span class="answer-label">答案：</span>
                <span class="answer-value">{{ q.answer }}</span>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty v-if="!parsedQuestions.length && !parsing" description="粘贴题目文本后点击AI智能解析" />

          <!-- 导入按钮 -->
          <div v-if="parsedQuestions.length && !parsing" class="import-bar">
            <el-button type="success" @click="handleImport" :loading="importing">
              <el-icon><Upload /></el-icon>导入到题库
            </el-button>
            <el-button @click="handleClear">清空结果</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MagicStick, Upload } from '@element-plus/icons-vue'

const inputText = ref('')
const targetBank = ref('')
const parsing = ref(false)
const parseProgress = ref(0)
const importing = ref(false)
const parsedQuestions = ref<any[]>([])

const exampleText = `1. TCP协议工作在OSI模型的哪一层？
A. 应用层
B. 数据链路层
C. 传输层
D. 网络层
答案：C

2. 快速排序的平均时间复杂度是O(n log n)。
答案：正确

3. 二叉树的前序遍历顺序是？
A. 根-左-右
B. 左-根-右
C. 左-右-根
D. 右-根-左
答案：A

4. HTTP协议默认使用的端口号是____。
答案：80

5. 以下哪些是面向对象编程的特征？
A. 封装
B. 继承
C. 多态
D. 抽象
答案：ABCD`

function loadExample() {
  inputText.value = exampleText
  ElMessage.info('已加载示例文本')
}

function typeTagType(type: string) {
  const map: Record<string, string> = { '单选题': '', '多选题': 'success', '判断题': 'warning', '填空题': 'info' }
  return map[type] || 'info'
}

function handleParse() {
  parsing.value = true
  parseProgress.value = 0
  parsedQuestions.value = []

  const interval = setInterval(() => {
    parseProgress.value += Math.random() * 15 + 5
    if (parseProgress.value >= 100) {
      parseProgress.value = 100
      clearInterval(interval)
      setTimeout(() => {
        parsing.value = false
        parsedQuestions.value = [
          { type: '单选题', content: 'TCP协议工作在OSI模型的哪一层？', options: ['A. 应用层', 'B. 数据链路层', 'C. 传输层', 'D. 网络层'], answer: 'C', confidence: 98 },
          { type: '判断题', content: '快速排序的平均时间复杂度是O(n log n)。', options: null, answer: '正确', confidence: 95 },
          { type: '单选题', content: '二叉树的前序遍历顺序是？', options: ['A. 根-左-右', 'B. 左-根-右', 'C. 左-右-根', 'D. 右-根-左'], answer: 'A', confidence: 97 },
          { type: '填空题', content: 'HTTP协议默认使用的端口号是____。', options: null, answer: '80', confidence: 92 },
          { type: '多选题', content: '以下哪些是面向对象编程的特征？', options: ['A. 封装', 'B. 继承', 'C. 多态', 'D. 抽象'], answer: 'ABCD', confidence: 96 }
        ]
        ElMessage.success(`成功解析 ${parsedQuestions.value.length} 道题目`)
      }, 300)
    }
  }, 200)
}

function handleImport() {
  if (!targetBank.value) {
    ElMessage.warning('请先选择目标题库')
    return
  }
  ElMessageBox.confirm(
    `确定将 ${parsedQuestions.value.length} 道题目导入到题库中吗？`,
    '确认导入',
    { type: 'success' }
  ).then(() => {
    importing.value = true
    setTimeout(() => {
      importing.value = false
      ElMessage.success(`成功导入 ${parsedQuestions.value.length} 道题目`)
      parsedQuestions.value = []
      inputText.value = ''
    }, 1000)
  }).catch(() => {})
}

function handleClear() {
  parsedQuestions.value = []
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.action-bar { display: flex; gap: 12px; margin-top: 16px; align-items: center; }
.parse-progress { padding: 20px 0; text-align: center; }
.progress-text { color: #909399; font-size: 13px; margin-top: 8px; }
.parsed-list { max-height: 500px; overflow-y: auto; }
.parsed-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 10px;
}
.parsed-item-header { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.parsed-index { font-size: 12px; color: #909399; }
.parsed-content { font-size: 14px; color: #303133; margin: 0 0 8px; }
.parsed-options { margin-bottom: 8px; }
.parsed-option { font-size: 13px; color: #606266; padding: 2px 0; }
.parsed-answer { display: flex; gap: 6px; align-items: center; }
.answer-label { color: #909399; font-size: 13px; }
.answer-value { color: #67C23A; font-weight: 600; font-size: 14px; }
.import-bar { display: flex; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #ebeef5; }
</style>
