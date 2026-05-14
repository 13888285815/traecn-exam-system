<template>
  <div class="dashboard-page">
    <!-- 欢迎信息 -->
    <div class="dashboard-welcome">
      <h2>控制台</h2>
      <p>欢迎回来，{{ authStore.userName || '管理员' }}！以下是系统数据概览。</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6" v-for="stat in stats" :key="stat.title">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-card-inner">
            <div class="stat-card-icon" :style="{ backgroundColor: stat.bgColor }">
              <el-icon :size="28" :color="stat.color">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-card-info">
              <div class="stat-card-value">{{ stat.value }}</div>
              <div class="stat-card-title">{{ stat.title }}</div>
            </div>
          </div>
          <div class="stat-card-footer">
            <span class="stat-trend" :class="stat.trendUp ? 'up' : 'down'">
              <el-icon><Top v-if="stat.trendUp" /><Bottom v-else /></el-icon>
              {{ stat.trend }}
            </span>
            <span class="stat-compare">较昨日</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 占位提示 -->
    <div class="dashboard-placeholder">
      <el-empty description="控制台详细内容正在建设中，敬请期待..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { User, Collection, EditPen, TrendCharts, Top, Bottom } from '@element-plus/icons-vue'

const authStore = useAuthStore()

const stats = computed(() => [
  {
    title: '用户总数',
    value: '1,256',
    icon: User,
    color: '#4A6CF7',
    bgColor: '#eef2ff',
    trend: '+12',
    trendUp: true
  },
  {
    title: '题库总数',
    value: '386',
    icon: Collection,
    color: '#67C23A',
    bgColor: '#f0f9eb',
    trend: '+5',
    trendUp: true
  },
  {
    title: '考试总数',
    value: '128',
    icon: EditPen,
    color: '#E6A23C',
    bgColor: '#fdf6ec',
    trend: '+3',
    trendUp: true
  },
  {
    title: '今日活跃',
    value: '328',
    icon: TrendCharts,
    color: '#F56C6C',
    bgColor: '#fef0f0',
    trend: '-8',
    trendUp: false
  }
])
</script>

<style scoped>
.dashboard-page {
  max-width: 100%;
}

.dashboard-welcome {
  margin-bottom: 24px;
}

.dashboard-welcome h2 {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.dashboard-welcome p {
  font-size: 14px;
  color: #909399;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  margin-bottom: 0;
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

.stat-compare {
  color: #c0c4cc;
}

.dashboard-placeholder {
  padding: 40px 0;
}
</style>
