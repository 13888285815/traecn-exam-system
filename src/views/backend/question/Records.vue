<template>
  <div class="page-container">
    <div class="page-header">
      <h2>练习记录</h2>
      <p class="page-desc">查看您的历史练习记录，包括每次练习的题库、正确率和用时</p>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 260px"
        value-format="YYYY-MM-DD"
      />
      <el-select v-model="filterBank" placeholder="全部题库" clearable style="width: 200px">
        <el-option v-for="bank in bankOptions" :key="bank" :label="bank" :value="bank" />
      </el-select>
      <el-button @click="handleExport">
        <el-icon><Download /></el-icon>导出记录
      </el-button>
    </div>

    <!-- 统计概览 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ totalPractices }}</div>
          <div class="stat-label">总练习次数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ totalQuestions }}</div>
          <div class="stat-label">总做题数量</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value highlight">{{ avgAccuracy }}%</div>
          <div class="stat-label">平均正确率</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ totalTime }}</div>
          <div class="stat-label">总用时(分钟)</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 练习记录表格 -->
    <el-table :data="filteredRecords" stripe style="width: 100%">
      <el-table-column prop="bankName" label="题库名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="practiceTime" label="练习时间" width="170" />
      <el-table-column prop="questionCount" label="题目数量" width="100" align="center" />
      <el-table-column prop="correctCount" label="正确数量" width="100" align="center" />
      <el-table-column prop="accuracy" label="正确率" width="100" align="center">
        <template #default="{ row }">
          <span :class="accuracyClass(row.accuracy)">{{ row.accuracy }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="用时" width="100" align="center">
        <template #default="{ row }">{{ row.duration }}分钟</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleViewDetail(row)">查看详情</el-button>
          <el-button size="small" type="success" link @click="handleRetry(row)">重新练习</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="filteredRecords.length"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

const dateRange = ref<[string, string] | null>(null)
const filterBank = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const bankOptions = ['计算机基础期末题库', '数据结构练习题', '操作系统原理题库', '计算机网络模拟试卷']

const mockRecords = ref([
  { id: 1, bankName: '计算机基础期末题库', practiceTime: '2026-05-12 14:30:00', questionCount: 50, correctCount: 42, accuracy: 84, duration: 45 },
  { id: 2, bankName: '数据结构练习题', practiceTime: '2026-05-11 10:15:00', questionCount: 30, correctCount: 25, accuracy: 83, duration: 30 },
  { id: 3, bankName: '操作系统原理题库', practiceTime: '2026-05-10 16:00:00', questionCount: 40, correctCount: 28, accuracy: 70, duration: 55 },
  { id: 4, bankName: '计算机网络模拟试卷', practiceTime: '2026-05-09 09:30:00', questionCount: 45, correctCount: 38, accuracy: 84, duration: 40 },
  { id: 5, bankName: '计算机基础期末题库', practiceTime: '2026-05-08 15:20:00', questionCount: 50, correctCount: 45, accuracy: 90, duration: 42 },
  { id: 6, bankName: '数据结构练习题', practiceTime: '2026-05-07 11:00:00', questionCount: 30, correctCount: 20, accuracy: 67, duration: 35 },
  { id: 7, bankName: '操作系统原理题库', practiceTime: '2026-05-06 14:45:00', questionCount: 40, correctCount: 34, accuracy: 85, duration: 50 },
  { id: 8, bankName: '计算机网络模拟试卷', practiceTime: '2026-05-05 08:30:00', questionCount: 45, correctCount: 40, accuracy: 89, duration: 38 }
])

const filteredRecords = computed(() => {
  let list = mockRecords.value
  if (filterBank.value) {
    list = list.filter(item => item.bankName === filterBank.value)
  }
  return list
})

const totalPractices = computed(() => mockRecords.value.length)
const totalQuestions = computed(() => mockRecords.value.reduce((sum, r) => sum + r.questionCount, 0))
const avgAccuracy = computed(() => {
  if (!mockRecords.value.length) return 0
  return Math.round(mockRecords.value.reduce((sum, r) => sum + r.accuracy, 0) / mockRecords.value.length)
})
const totalTime = computed(() => mockRecords.value.reduce((sum, r) => sum + r.duration, 0))

function accuracyClass(accuracy: number) {
  if (accuracy >= 80) return 'accuracy-high'
  if (accuracy >= 60) return 'accuracy-medium'
  return 'accuracy-low'
}

function handleViewDetail(row: any) {
  ElMessage.info(`查看练习详情：${row.bankName}`)
}

function handleRetry(row: any) {
  ElMessage.success(`重新练习：${row.bankName}`)
}

function handleExport() {
  ElMessage.success('练习记录导出成功')
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.filter-bar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.stats-row { margin-bottom: 16px; }
.stat-card { text-align: center; }
.stat-value { font-size: 28px; font-weight: 700; color: #303133; }
.stat-value.highlight { color: #4A6CF7; }
.stat-label { font-size: 13px; color: #909399; margin-top: 4px; }
.accuracy-high { color: #67C23A; font-weight: 600; }
.accuracy-medium { color: #E6A23C; font-weight: 600; }
.accuracy-low { color: #F56C6C; font-weight: 600; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
