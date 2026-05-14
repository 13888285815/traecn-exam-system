<template>
  <div class="page-container">
    <div class="page-header">
      <h2>智能解析</h2>
      <p class="page-desc">上传试卷图片或文档，AI自动识别并解析为结构化题目</p>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：上传区域 -->
      <el-col :span="10">
        <el-card shadow="hover">
          <template #header>
            <span>上传文件</span>
          </template>

          <el-upload
            class="upload-area"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="true"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            multiple
          >
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">将试卷图片或文档拖拽到此处，或<em>点击上传</em></div>
            <div class="upload-tip">
              支持 JPG、PNG、PDF、DOC、DOCX 格式，单文件不超过 10MB
            </div>
          </el-upload>

          <div class="upload-settings">
            <h4>解析设置</h4>
            <el-form label-position="top">
              <el-form-item label="试卷类型">
                <el-select v-model="parseType" style="width: 100%">
                  <el-option label="自动识别" value="auto" />
                  <el-option label="选择题试卷" value="choice" />
                  <el-option label="综合试卷" value="mixed" />
                  <el-option label="填空题试卷" value="fill" />
                </el-select>
              </el-form-item>
              <el-form-item label="目标题库">
                <el-select v-model="targetBank" style="width: 100%">
                  <el-option label="计算机基础期末题库" value="1" />
                  <el-option label="数据结构练习题" value="2" />
                  <el-option label="新建题库" value="new" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="autoImport">解析完成后自动导入</el-checkbox>
              </el-form-item>
            </el-form>
          </div>

          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="analyzing"
            :disabled="!uploadedFiles.length"
            @click="handleAnalyze"
          >
            <el-icon><MagicStick /></el-icon>开始智能解析
          </el-button>
        </el-card>
      </el-col>

      <!-- 右侧：解析结果 -->
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>解析结果</span>
              <el-tag v-if="parsedResults.length" type="success" size="small">
                共识别 {{ parsedResults.length }} 道题目
              </el-tag>
            </div>
          </template>

          <!-- 解析进度 -->
          <div v-if="analyzing" class="analyze-progress">
            <el-progress :percentage="analyzeProgress" :stroke-width="12" :format="progressFormat" />
            <div class="progress-steps">
              <div class="step" :class="{ active: analyzeProgress >= 20 }">
                <el-icon><Check /></el-icon>文件上传
              </div>
              <div class="step" :class="{ active: analyzeProgress >= 50 }">
                <el-icon><Check /></el-icon>OCR识别
              </div>
              <div class="step" :class="{ active: analyzeProgress >= 80 }">
                <el-icon><Check /></el-icon>题目解析
              </div>
              <div class="step" :class="{ active: analyzeProgress >= 100 }">
                <el-icon><Check /></el-icon>完成
              </div>
            </div>
          </div>

          <!-- 解析结果列表 -->
          <div v-if="parsedResults.length && !analyzing" class="result-list">
            <div v-for="(item, index) in parsedResults" :key="index" class="result-item">
              <div class="result-header">
                <el-tag :type="typeTagType(item.type)" size="small">{{ item.type }}</el-tag>
                <span class="result-index">第 {{ index + 1 }} 题</span>
                <el-rate v-model="item.confidence" disabled :max="3" size="small" />
              </div>
              <p class="result-content">{{ item.content }}</p>
              <div v-if="item.options" class="result-options">
                <div v-for="(opt, oi) in item.options" :key="oi" class="result-option">{{ opt }}</div>
              </div>
              <div class="result-answer">
                <span class="answer-label">答案：</span>
                <span class="answer-value">{{ item.answer }}</span>
              </div>
              <div class="result-actions">
                <el-button size="small" type="primary" link>编辑</el-button>
                <el-button size="small" type="danger" link @click="handleRemoveResult(index)">移除</el-button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty v-if="!parsedResults.length && !analyzing" description="上传试卷文件后开始智能解析" />

          <!-- 底部操作 -->
          <div v-if="parsedResults.length && !analyzing" class="result-footer">
            <el-button type="success" @click="handleImportAll">
              <el-icon><Upload /></el-icon>导入全部题目
            </el-button>
            <el-button @click="parsedResults = []">清空结果</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { UploadFilled, MagicStick, Upload, Check } from '@element-plus/icons-vue'

const uploadedFiles = ref<UploadFile[]>([])
const parseType = ref('auto')
const targetBank = ref('')
const autoImport = ref(false)
const analyzing = ref(false)
const analyzeProgress = ref(0)
const parsedResults = ref<any[]>([])

function handleFileChange(file: UploadFile) {
  uploadedFiles.value.push(file)
}

function typeTagType(type: string) {
  const map: Record<string, string> = { '单选题': '', '多选题': 'success', '判断题': 'warning', '填空题': 'info', '简答题': 'danger' }
  return map[type] || 'info'
}

function progressFormat(percentage: number) {
  return percentage === 100 ? '完成' : `${percentage}%`
}

function handleAnalyze() {
  analyzing.value = true
  analyzeProgress.value = 0
  parsedResults.value = []

  const interval = setInterval(() => {
    analyzeProgress.value += Math.random() * 8 + 2
    if (analyzeProgress.value >= 100) {
      analyzeProgress.value = 100
      clearInterval(interval)
      setTimeout(() => {
        analyzing.value = false
        parsedResults.value = [
          { type: '单选题', content: '在OSI参考模型中，负责数据传输的层是？', options: ['A. 网络层', 'B. 传输层', 'C. 会话层', 'D. 表示层'], answer: 'B', confidence: 3 },
          { type: '单选题', content: '下列排序算法中，最坏情况下时间复杂度为O(n log n)的是？', options: ['A. 冒泡排序', 'B. 快速排序', 'C. 归并排序', 'D. 选择排序'], answer: 'C', confidence: 3 },
          { type: '判断题', content: '进程是资源分配的基本单位，线程是CPU调度的基本单位。', options: null, answer: '正确', confidence: 3 },
          { type: '填空题', content: 'SQL中用于查询数据的关键字是____。', options: null, answer: 'SELECT', confidence: 2 },
          { type: '多选题', content: '以下哪些属于TCP/IP协议栈的层次？', options: ['A. 应用层', 'B. 传输层', 'C. 网络层', 'D. 数据链路层'], answer: 'ABCD', confidence: 3 },
          { type: '简答题', content: '请简述数据库事务的ACID特性。', options: null, answer: '原子性、一致性、隔离性、持久性', confidence: 2 }
        ]
        ElMessage.success(`解析完成，共识别 ${parsedResults.value.length} 道题目`)
        if (autoImport.value) {
          handleImportAll()
        }
      }, 500)
    }
  }, 150)
}

function handleRemoveResult(index: number) {
  parsedResults.value.splice(index, 1)
}

function handleImportAll() {
  ElMessageBox.confirm(
    `确定将 ${parsedResults.value.length} 道题目导入到题库吗？`,
    '确认导入',
    { type: 'success' }
  ).then(() => {
    ElMessage.success(`成功导入 ${parsedResults.value.length} 道题目`)
    parsedResults.value = []
    uploadedFiles.value = []
  }).catch(() => {})
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.upload-area { margin-bottom: 16px; }
.upload-area :deep(.el-upload-dragger) { padding: 30px; }
.upload-icon { font-size: 48px; color: #c0c4cc; margin-bottom: 8px; }
.upload-text { font-size: 14px; color: #606266; }
.upload-text em { color: #4A6CF7; font-style: normal; }
.upload-tip { font-size: 12px; color: #909399; margin-top: 8px; }
.upload-settings { margin: 16px 0; }
.upload-settings h4 { font-size: 14px; color: #303133; margin: 0 0 12px; }
.analyze-progress { padding: 20px 0; }
.progress-steps { display: flex; justify-content: space-between; margin-top: 20px; }
.step { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #c0c4cc; transition: color 0.3s; }
.step.active { color: #67C23A; }
.result-list { max-height: 520px; overflow-y: auto; }
.result-item { padding: 12px; border: 1px solid #ebeef5; border-radius: 6px; margin-bottom: 10px; }
.result-header { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.result-index { font-size: 12px; color: #909399; }
.result-content { font-size: 14px; color: #303133; margin: 0 0 8px; }
.result-options { margin-bottom: 8px; }
.result-option { font-size: 13px; color: #606266; padding: 2px 0; }
.result-answer { display: flex; gap: 6px; align-items: center; margin-bottom: 8px; }
.answer-label { color: #909399; font-size: 13px; }
.answer-value { color: #67C23A; font-weight: 600; }
.result-actions { display: flex; gap: 8px; }
.result-footer { display: flex; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #ebeef5; }
</style>
