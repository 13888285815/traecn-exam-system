<template>
  <div class="dashboard-page">
    <!-- 欢迎信息 -->
    <div class="dashboard-welcome">
      <div class="welcome-left">
        <h2>控制台</h2>
        <p>欢迎回来，<span class="user-name">{{ authStore.userName || '管理员' }}</span>！以下是系统数据概览。</p>
      </div>
      <div class="welcome-right">
        <el-tag :type="authStore.isVip ? 'danger' : 'info'" size="large">
          {{ authStore.isVip ? 'SVIP 会员' : '普通用户' }}
        </el-tag>
        <span class="current-time">{{ currentTime }}</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-card-inner">
            <div class="stat-card-icon" style="backgroundColor: #eef2ff;">
              <el-icon :size="28" color="#4A6CF7"><User /></el-icon>
            </div>
            <div class="stat-card-info">
              <div class="stat-card-value">{{ stats.totalUsers }}</div>
              <div class="stat-card-title">用户总数</div>
            </div>
          </div>
          <div class="stat-card-footer">
            <span class="stat-trend up">
              <el-icon><Top /></el-icon>
              +{{ stats.todayNewUsers }} 今日新增
            </span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-card-inner">
            <div class="stat-card-icon" style="backgroundColor: #f0f9eb;">
              <el-icon :size="28" color="#67C23A"><Collection /></el-icon>
            </div>
            <div class="stat-card-info">
              <div class="stat-card-value">{{ stats.totalQuestionBanks }}</div>
              <div class="stat-card-title">题库总数</div>
            </div>
          </div>
          <div class="stat-card-footer">
            <span class="stat-trend up">
              <el-icon><Top /></el-icon>
              +{{ stats.newQuestionBanks }} 本周新增
            </span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-card-inner">
            <div class="stat-card-icon" style="backgroundColor: #fdf6ec;">
              <el-icon :size="28" color="#E6A23C"><EditPen /></el-icon>
            </div>
            <div class="stat-card-info">
              <div class="stat-card-value">{{ stats.totalExams }}</div>
              <div class="stat-card-title">考试总数</div>
            </div>
          </div>
          <div class="stat-card-footer">
            <span class="stat-trend up">
              <el-icon><Top /></el-icon>
              {{ stats.activeExams }} 进行中
            </span>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-card-inner">
            <div class="stat-card-icon" style="backgroundColor: #fef0f0;">
              <el-icon :size="28" color="#F56C6C"><TrendCharts /></el-icon>
            </div>
            <div class="stat-card-info">
              <div class="stat-card-value">{{ stats.todayActive }}</div>
              <div class="stat-card-title">今日活跃</div>
            </div>
          </div>
          <div class="stat-card-footer">
            <span class="stat-trend down">
              <el-icon><Bottom /></el-icon>
              {{ stats.activeChange }}% 较昨日
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据图表区 -->
    <el-row :gutter="16" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>考试趋势</span>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-placeholder">
            <div class="chart-bars">
              <div v-for="(value, index) in chartData" :key="index" class="chart-bar">
                <div class="bar-fill" :style="{ height: value + '%' }"></div>
                <div class="bar-label">{{ chartLabels[index] }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>考试完成率</span>
            </div>
          </template>
          <div class="completion-stats">
            <div class="completion-item">
              <div class="completion-label">已完成</div>
              <div class="completion-value success">{{ completionStats.completed }}</div>
            </div>
            <div class="completion-item">
              <div class="completion-label">进行中</div>
              <div class="completion-value warning">{{ completionStats.inProgress }}</div>
            </div>
            <div class="completion-item">
              <div class="completion-label">未开始</div>
              <div class="completion-value info">{{ completionStats.notStarted }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作和最近动态 -->
    <el-row :gutter="16" class="actions-row">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <div class="quick-action-item" @click="$router.push('/admin/paper/create')">
              <el-icon :size="24" color="#4A6CF7"><Plus /></el-icon>
              <span>新增试卷</span>
            </div>
            <div class="quick-action-item" @click="$router.push('/admin/question/my')">
              <el-icon :size="24" color="#67C23A"><Collection /></el-icon>
              <span>题库管理</span>
            </div>
            <div class="quick-action-item" @click="$router.push('/admin/paper/online')">
              <el-icon :size="24" color="#E6A23C"><Document /></el-icon>
              <span>在线组卷</span>
            </div>
            <div class="quick-action-item" @click="$router.push('/admin/question/ai-import')">
              <el-icon :size="24" color="#F56C6C"><Upload /></el-icon>
              <span>AI导题</span>
            </div>
            <div class="quick-action-item" @click="$router.push('/admin/enterprise/staff')">
              <el-icon :size="24" color="#909399"><User /></el-icon>
              <span>人员管理</span>
            </div>
            <div class="quick-action-item" @click="$router.push('/admin/settings/backup')">
              <el-icon :size="24" color="#4A6CF7"><Setting /></el-icon>
              <span>系统设置</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近动态</span>
            </div>
          </template>
          <el-scrollbar height="260px">
            <div class="activity-list">
              <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <el-avatar :size="32" class="activity-avatar">
                  {{ activity.user.charAt(0) }}
                </el-avatar>
                <div class="activity-content">
                  <div class="activity-text">
                    <span class="activity-user">{{ activity.user }}</span>
                    {{ activity.action }}
                  </div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>

    <!-- 进行中的考试 -->
    <el-card shadow="hover" class="exams-card">
      <template #header>
        <div class="card-header">
          <span>进行中的考试</span>
          <el-button type="primary" link @click="$router.push('/admin/enterprise/exam')">查看全部</el-button>
        </div>
      </template>
      <el-table :data="ongoingExams" stripe>
        <el-table-column prop="name" label="考试名称" />
        <el-table-column prop="participants" label="参与人数" width="100" />
        <el-table-column prop="progress" label="完成进度" width="180">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止时间" width="120" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="primary" link>查看详情</el-button>
            <el-button size="small" type="danger" link>结束考试</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import {
  User, Collection, EditPen, TrendCharts, Top, Bottom,
  Plus, Document, Upload, Setting
} from '@element-plus/icons-vue'

const authStore = useAuthStore()

const currentTime = ref('')
let timeTimer: ReturnType<typeof setInterval> | null = null

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
})

const chartTimeRange = ref('week')

const chartLabels = computed(() => {
  if (chartTimeRange.value === 'week') {
    return ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  } else if (chartTimeRange.value === 'month') {
    return ['第1周', '第2周', '第3周', '第4周']
  } else {
    return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  }
})

const chartData = computed(() => {
  if (chartTimeRange.value === 'week') {
    return [65, 78, 52, 88, 73, 45, 92]
  } else if (chartTimeRange.value === 'month') {
    return [72, 85, 68, 91]
  } else {
    return [60, 75, 68, 82, 78, 88, 72, 85, 90, 78, 85, 92]
  }
})

const stats = ref({
  totalUsers: 1256,
  todayNewUsers: 15,
  totalQuestionBanks: 386,
  newQuestionBanks: 12,
  totalExams: 128,
  activeExams: 8,
  todayActive: 328,
  activeChange: 5
})

const completionStats = ref({
  completed: 856,
  inProgress: 234,
  notStarted: 166
})

const recentActivities = ref([
  { id: 1, user: '张同学', action: '完成了"计算机基础测试"', time: '2分钟前' },
  { id: 2, user: '李老师', action: '新增了30道题目到题库', time: '15分钟前' },
  { id: 3, user: '王同学', action: '加入了"数学练习群"', time: '30分钟前' },
  { id: 4, user: '系统', action: '自动批改了12份试卷', time: '1小时前' },
  { id: 5, user: '赵老师', action: '发布了新考试"期末模拟"', time: '2小时前' },
  { id: 6, user: '孙同学', action: '购买了"英语题库"', time: '3小时前' }
])

const ongoingExams = ref([
  { name: '2026年计算机基础期末考试', participants: 156, progress: 78, deadline: '2026-05-20' },
  { name: '数据结构随堂测验', participants: 42, progress: 45, deadline: '2026-05-18' },
  { name: '英语四级模拟考试', participants: 89, progress: 62, deadline: '2026-05-25' },
  { name: '数学能力测验', participants: 67, progress: 88, deadline: '2026-05-15' }
])
</script>

<style scoped>
.dashboard-page {
  max-width: 100%;
}

.dashboard-welcome {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.welcome-left h2 {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.welcome-left p {
  font-size: 14px;
  color: #909399;
}

.welcome-left .user-name {
  color: #4A6CF7;
  font-weight: 600;
}

.welcome-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-time {
  font-size: 14px;
  color: #909399;
}

.stats-row {
  margin-bottom: 16px;
}

.charts-row {
  margin-bottom: 16px;
}

.actions-row {
  margin-bottom: 16px;
}

.stat-card {
  border-radius: 8px;
  margin-bottom: 0;
  height: 100%;
}

.stat-card-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card-info {
  flex: 1;
}

.stat-card-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-card-title {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.stat-card-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
  font-size: 12px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-weight: 600;
}

.stat-trend.up {
  color: #67C23A;
}

.stat-trend.down {
  color: #F56C6C;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.chart-placeholder {
  height: 250px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
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

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 60px;
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

.completion-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.completion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fb;
  border-radius: 8px;
}

.completion-label {
  font-size: 14px;
  color: #606266;
}

.completion-value {
  font-size: 18px;
  font-weight: 700;
}

.completion-value.success {
  color: #67C23A;
}

.completion-value.warning {
  color: #E6A23C;
}

.completion-value.info {
  color: #909399;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  background: #f8f9fb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-action-item:hover {
  background: #eef2ff;
  transform: translateY(-2px);
}

.quick-action-item span {
  font-size: 13px;
  color: #606266;
  text-align: center;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 8px;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.activity-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.activity-avatar {
  flex-shrink: 0;
  background-color: #4A6CF7;
  color: #fff;
  font-size: 13px;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 4px;
}

.activity-user {
  color: #4A6CF7;
  font-weight: 600;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}

.exams-card {
  margin-top: 0;
}

@media (max-width: 768px) {
  .dashboard-welcome {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-placeholder {
    height: 200px;
  }

  .chart-bars {
    height: 150px;
  }
}
</style>
