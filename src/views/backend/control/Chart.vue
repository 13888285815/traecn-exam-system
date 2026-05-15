<template>
  <div class="chart-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>数据图表</h2>
      <p class="page-desc">可视化数据统计分析</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon" style="background: #eef2ff;">
              <el-icon :size="24" color="#4A6CF7"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalVisits }}</div>
              <div class="stat-label">总访问量</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon" style="background: #f0f9eb;">
              <el-icon :size="24" color="#67C23A"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalExams }}</div>
              <div class="stat-label">总考试数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon" style="background: #fdf6ec;">
              <el-icon :size="24" color="#E6A23C"><EditPen /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalQuestions }}</div>
              <div class="stat-label">总题量</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon" style="background: #fef0f0;">
              <el-icon :size="24" color="#F56C6C"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.avgScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>访问趋势</span>
              <el-radio-group v-model="visitTimeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-bars">
              <div v-for="(value, index) in visitChartData" :key="index" class="chart-bar-item">
                <div class="bar-tooltip">{{ value }}次</div>
                <div class="bar-fill" :style="{ height: value + '%' }"></div>
                <div class="bar-label">{{ visitChartLabels[index] }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>考试分布</span>
            </div>
          </template>
          <div class="pie-chart-placeholder">
            <div class="pie-item" v-for="item in examDistribution" :key="item.name">
              <div class="pie-color" :style="{ background: item.color }"></div>
              <div class="pie-label">{{ item.name }}</div>
              <div class="pie-value">{{ item.value }}%</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card shadow="hover" class="data-table-card">
      <template #header>
        <div class="card-header">
          <span>数据明细</span>
          <el-button type="primary" size="small" @click="handleExport">导出数据</el-button>
        </div>
      </template>
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="visits" label="访问量" width="100" sortable />
        <el-table-column prop="exams" label="考试数" width="100" sortable />
        <el-table-column prop="users" label="用户数" width="100" sortable />
        <el-table-column prop="avgScore" label="平均分" width="100" sortable />
        <el-table-column prop="completionRate" label="完成率" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.completionRate" :stroke-width="6" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { User, Document, EditPen, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface TableData {
  date: string
  visits: number
  exams: number
  users: number
  avgScore: number
  completionRate: number
}

const visitTimeRange = ref('week')

const stats = ref({
  totalVisits: 45678,
  totalExams: 128,
  totalQuestions: 5430,
  avgScore: 76.5
})

const visitChartLabels = computed(() => {
  if (visitTimeRange.value === 'week') {
    return ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  } else if (visitTimeRange.value === 'month') {
    return ['第1周', '第2周', '第3周', '第4周']
  } else {
    return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  }
})

const visitChartData = computed(() => {
  if (visitTimeRange.value === 'week') {
    return [65, 78, 52, 88, 73, 45, 92]
  } else if (visitTimeRange.value === 'month') {
    return [72, 85, 68, 91]
  } else {
    return [60, 75, 68, 82, 78, 88, 72, 85, 90, 78, 85, 92]
  }
})

const examDistribution = ref([
  { name: '计算机', value: 35, color: '#4A6CF7' },
  { name: '数学', value: 25, color: '#67C23A' },
  { name: '英语', value: 20, color: '#E6A23C' },
  { name: '其他', value: 20, color: '#F56C6C' }
])

const tableData = ref<TableData[]>([
  { date: '2026-05-15', visits: 1234, exams: 12, users: 456, avgScore: 78.5, completionRate: 85 },
  { date: '2026-05-14', visits: 1156, exams: 10, users: 423, avgScore: 76.2, completionRate: 82 },
  { date: '2026-05-13', visits: 1089, exams: 15, users: 398, avgScore: 74.8, completionRate: 79 },
  { date: '2026-05-12', visits: 1324, exams: 11, users: 489, avgScore: 77.3, completionRate: 88 },
  { date: '2026-05-11', visits: 987, exams: 8, users: 356, avgScore: 75.1, completionRate: 76 }
])

const handleExport = () => {
  ElMessage.success('数据导出功能开发中')
}
</script>

<style scoped>
.chart-page {
  max-width: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.page-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  border-radius: 8px;
  margin-bottom: 16px;
}

.stat-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.charts-row {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.chart-container {
  height: 250px;
  display: flex;
  align-items: flex-end;
  padding: 20px 0;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 100%;
  height: 200px;
  border-bottom: 2px solid #f0f0f0;
}

.chart-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 60px;
  height: 100%;
  justify-content: flex-end;
}

.bar-tooltip {
  font-size: 11px;
  color: #909399;
  margin-bottom: 4px;
}

.bar-fill {
  width: 30px;
  background: linear-gradient(180deg, #4A6CF7 0%, #6B8AFF 100%);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  min-height: 10px;
}

.bar-label {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.pie-chart-placeholder {
  padding: 20px 0;
}

.pie-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fb;
  border-radius: 8px;
  margin-bottom: 12px;
}

.pie-item:last-child {
  margin-bottom: 0;
}

.pie-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.pie-label {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.pie-value {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
}

.data-table-card {
  margin-top: 0;
}

@media (max-width: 768px) {
  .chart-bars {
    height: 150px;
  }

  .stat-value {
    font-size: 20px;
  }
}
</style>
