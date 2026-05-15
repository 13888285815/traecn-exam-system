<template>
  <div class="page-container">
    <div class="page-header">
      <h2>缓存管理</h2>
      <p class="page-desc">查看缓存状态和管理缓存数据</p>
    </div>
    <div class="page-content">
      <!-- 缓存状态卡片 -->
      <el-row :gutter="16" class="cache-stats">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover">
            <div class="cache-stat">
              <div class="cache-stat-label">缓存总量</div>
              <div class="cache-stat-value">{{ cacheStats.totalSize }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover">
            <div class="cache-stat">
              <div class="cache-stat-label">缓存条目</div>
              <div class="cache-stat-value">{{ cacheStats.totalItems }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover">
            <div class="cache-stat">
              <div class="cache-stat-label">命中率</div>
              <div class="cache-stat-value success">{{ cacheStats.hitRate }}%</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover">
            <div class="cache-stat">
              <div class="cache-stat-label">内存使用</div>
              <div class="cache-stat-value warning">{{ cacheStats.memoryUsage }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 缓存列表 -->
      <div class="action-bar">
        <el-button type="primary" @click="handleClearAll">
          <el-icon><Delete /></el-icon>清理全部缓存
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>刷新状态
        </el-button>
      </div>

      <el-table :data="cacheItems" stripe style="margin-top: 20px">
        <el-table-column prop="key" label="缓存键" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column prop="ttl" label="剩余时间" width="120" />
        <el-table-column prop="hits" label="命中次数" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleClearItem(row)">清理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Delete, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface CacheItem {
  id: number
  key: string
  type: string
  size: string
  ttl: string
  hits: number
  createdAt: string
}

const cacheStats = reactive({
  totalSize: '128 MB',
  totalItems: 1568,
  hitRate: 85.6,
  memoryUsage: '32%'
})

const cacheItems = ref<CacheItem[]>([
  { id: 1, key: 'user:profile:1001', type: '用户', size: '2 KB', ttl: '23h 45m', hits: 156, createdAt: '2026-05-15 08:00:00' },
  { id: 2, key: 'exam:config:2001', type: '考试', size: '5 KB', ttl: '11h 20m', hits: 89, createdAt: '2026-05-15 09:30:00' },
  { id: 3, key: 'question:bank:3001', type: '题库', size: '12 KB', ttl: '5h 10m', hits: 234, createdAt: '2026-05-15 10:00:00' },
  { id: 4, key: 'system:config', type: '系统', size: '1 KB', ttl: '永久', hits: 1024, createdAt: '2026-05-14 20:00:00' },
  { id: 5, key: 'api:rate:limit:192.168.1.1', type: 'API', size: '0.5 KB', ttl: '45m', hits: 45, createdAt: '2026-05-15 11:00:00' }
])

function handleClearItem(row: CacheItem) {
  ElMessageBox.confirm(`确定要清理缓存"${row.key}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = cacheItems.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      cacheItems.value.splice(index, 1)
      cacheStats.totalItems -= 1
      ElMessage.success('缓存已清理')
    }
  }).catch(() => {})
}

function handleClearAll() {
  ElMessageBox.confirm('确定要清理全部缓存吗？这可能会影响系统性能。', '警告', {
    confirmButtonText: '确定清理',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cacheItems.value = []
    cacheStats.totalItems = 0
    cacheStats.totalSize = '0 MB'
    ElMessage.success('全部缓存已清理')
  }).catch(() => {})
}

function handleRefresh() {
  ElMessage.info('正在刷新缓存状态...')
  setTimeout(() => {
    ElMessage.success('缓存状态已刷新')
  }, 1000)
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.action-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.cache-stats { margin-bottom: 20px; }
.cache-stat { text-align: center; }
.cache-stat-label { font-size: 13px; color: #909399; margin-bottom: 8px; }
.cache-stat-value { font-size: 24px; font-weight: 700; color: #303133; }
.cache-stat-value.success { color: #67C23A; }
.cache-stat-value.warning { color: #E6A23C; }
</style>
