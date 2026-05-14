<template>
  <div class="page-container">
    <div class="page-header">
      <h2>考试历史</h2>
      <p class="page-desc">查看所有考试的记录和成绩，支持按试卷、考生和状态筛选</p>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input v-model="searchKeyword" placeholder="搜索试卷名称或考生..." clearable style="width: 260px" prefix-icon="Search" />
      <el-select v-model="filterStatus" placeholder="全部状态" clearable style="width: 140px">
        <el-option label="已完成" value="completed" />
        <el-option label="进行中" value="ongoing" />
        <el-option label="已超时" value="timeout" />
        <el-option label="已批改" value="graded" />
      </el-select>
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px" value-format="YYYY-MM-DD" />
      <el-button @click="handleExport"><el-icon><Download /></el-icon>导出</el-button>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6" v-for="stat in stats" :key="stat.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.title }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 考试记录表格 -->
    <el-table :data="filteredRecords" stripe style="width: 100%">
      <el-table-column prop="paperName" label="试卷名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="studentName" label="考生" width="120" />
      <el-table-column prop="score" label="得分" width="80" align="center">
        <template #default="{ row }">
          <span :class="scoreClass(row.score, row.totalScore)">{{ row.score }}</span>
          <span class="score-total">/{{ row.totalScore }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="accuracy" label="正确率" width="100" align="center">
        <template #default="{ row }">
          <el-progress :percentage="row.accuracy" :stroke-width="8" :color="progressColor(row.accuracy)" style="width: 80px" />
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="用时" width="100" align="center">
        <template #default="{ row }">{{ row.duration }}分钟</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submittedAt" label="提交时间" width="170" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleView(row)">查看详情</el-button>
          <el-button v-if="row.status === 'completed'" size="small" type="success" link @click="handleGrade(row)">批改</el-button>
          <el-button size="small" type="warning" link @click="handleAnalysis(row)">分析</el-button>
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

const searchKeyword = ref('')
const filterStatus = ref('')
const dateRange = ref<[string, string] | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

const stats = [
  { title: '考试总次数', value: '156', color: '#4A6CF7' },
  { title: '平均分', value: '76.8', color: '#67C23A' },
  { title: '及格率', value: '82%', color: '#E6A23C' },
  { title: '最高分', value: '98', color: '#F56C6C' }
]

const mockRecords = ref([
  { id: 1, paperName: '2026年计算机基础期末考试', studentName: '张三', score: 85, totalScore: 100, accuracy: 85, duration: 52, status: 'graded', submittedAt: '2026-05-12 11:30:00' },
  { id: 2, paperName: '2026年计算机基础期末考试', studentName: '李四', score: 72, totalScore: 100, accuracy: 72, duration: 58, status: 'graded', submittedAt: '2026-05-12 11:28:00' },
  { id: 3, paperName: '数据结构随堂测验', studentName: '王五', score: 45, totalScore: 50, accuracy: 90, duration: 28, status: 'completed', submittedAt: '2026-05-11 16:00:00' },
  { id: 4, paperName: '英语四级模拟考试', studentName: '赵六', score: 88, totalScore: 100, accuracy: 88, duration: 90, status: 'graded', submittedAt: '2026-05-11 10:30:00' },
  { id: 5, paperName: '操作系统期中考试', studentName: '孙七', score: 56, totalScore: 100, accuracy: 56, duration: 60, status: 'timeout', submittedAt: '2026-05-10 09:00:00' },
  { id: 6, paperName: '计算机网络测试', studentName: '周八', score: 0, totalScore: 100, accuracy: 0, duration: 0, status: 'ongoing', submittedAt: '-' },
  { id: 7, paperName: '数据库原理考试', studentName: '吴九', score: 92, totalScore: 100, accuracy: 92, duration: 48, status: 'graded', submittedAt: '2026-05-09 14:20:00' },
  { id: 8, paperName: 'Python编程考试', studentName: '郑十', score: 78, totalScore: 100, accuracy: 78, duration: 55, status: 'completed', submittedAt: '2026-05-08 16:45:00' }
])

const filteredRecords = computed(() => {
  let list = mockRecords.value
  if (searchKeyword.value) {
    list = list.filter(item => item.paperName.includes(searchKeyword.value) || item.studentName.includes(searchKeyword.value))
  }
  if (filterStatus.value) {
    list = list.filter(item => item.status === filterStatus.value)
  }
  return list
})

function statusText(status: string) {
  const map: Record<string, string> = { completed: '已完成', ongoing: '进行中', timeout: '已超时', graded: '已批改' }
  return map[status] || status
}
function statusTagType(status: string) {
  const map: Record<string, string> = { completed: 'info', ongoing: 'warning', timeout: 'danger', graded: 'success' }
  return map[status] || 'info'
}

function scoreClass(score: number, total: number) {
  const pct = score / total * 100
  if (pct >= 80) return 'score-high'
  if (pct >= 60) return 'score-medium'
  return 'score-low'
}

function progressColor(accuracy: number) {
  if (accuracy >= 80) return '#67C23A'
  if (accuracy >= 60) return '#E6A23C'
  return '#F56C6C'
}

function handleView(row: any) { ElMessage.info(`查看考试详情：${row.paperName} - ${row.studentName}`) }
function handleGrade(row: any) { ElMessage.info(`批改试卷：${row.paperName} - ${row.studentName}`) }
function handleAnalysis(row: any) { ElMessage.info(`查看分析：${row.paperName}`) }
function handleExport() { ElMessage.success('考试记录导出成功') }
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.filter-bar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.stats-row { margin-bottom: 16px; }
.stat-card { text-align: center; }
.stat-value { font-size: 28px; font-weight: 700; }
.stat-label { font-size: 13px; color: #909399; margin-top: 4px; }
.score-high { color: #67C23A; font-weight: 600; }
.score-medium { color: #E6A23C; font-weight: 600; }
.score-low { color: #F56C6C; font-weight: 600; }
.score-total { color: #c0c4cc; font-size: 12px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
