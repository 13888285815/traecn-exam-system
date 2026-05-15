<template>
  <div class="page-container">
    <div class="page-header">
      <h2>数据备份</h2>
      <p class="page-desc">管理数据备份和恢复</p>
    </div>
    <div class="page-content">
      <div class="action-bar">
        <el-button type="primary" @click="handleCreateBackup">
          <el-icon><Plus /></el-icon>创建备份
        </el-button>
      </div>

      <el-table :data="backups" stripe style="margin-top: 20px">
        <el-table-column prop="name" label="备份名称" />
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'auto' ? 'info' : 'success'">
              {{ row.type === 'auto' ? '自动' : '手动' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : row.status === 'failed' ? 'danger' : 'warning'">
              {{ statusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              link
              :disabled="row.status !== 'completed'"
              @click="handleRestore(row)"
            >
              恢复
            </el-button>
            <el-button size="small" type="primary" link @click="handleDownload(row)">下载</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Backup {
  id: number
  name: string
  size: string
  type: 'auto' | 'manual'
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

const statusMap = {
  pending: '进行中',
  completed: '已完成',
  failed: '失败'
}

const backups = ref<Backup[]>([
  { id: 1, name: '自动备份_2026-05-15', size: '256 MB', type: 'auto', status: 'completed', createdAt: '2026-05-15 02:00:00' },
  { id: 2, name: '手动备份_2026-05-14', size: '248 MB', type: 'manual', status: 'completed', createdAt: '2026-05-14 15:30:00' },
  { id: 3, name: '自动备份_2026-05-14', size: '245 MB', type: 'auto', status: 'completed', createdAt: '2026-05-14 02:00:00' },
  { id: 4, name: '手动备份_2026-05-13', size: '240 MB', type: 'manual', status: 'failed', createdAt: '2026-05-13 10:00:00' }
])

function handleCreateBackup() {
  const newBackup: Backup = {
    id: Date.now(),
    name: `手动备份_${new Date().toISOString().split('T')[0]}`,
    size: '0 MB',
    type: 'manual',
    status: 'pending',
    createdAt: new Date().toLocaleString('zh-CN')
  }
  backups.value.unshift(newBackup)
  ElMessage.info('正在创建备份...')

  // 模拟备份过程
  setTimeout(() => {
    const index = backups.value.findIndex(item => item.id === newBackup.id)
    if (index !== -1) {
      backups.value[index].status = 'completed'
      backups.value[index].size = `${Math.floor(Math.random() * 100 + 200)} MB`
      ElMessage.success('备份创建成功')
    }
  }, 2000)
}

function handleRestore(row: Backup) {
  ElMessageBox.confirm(`确定要恢复备份"${row.name}"吗？当前数据将被覆盖。`, '警告', {
    confirmButtonText: '确定恢复',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.info('正在恢复数据...')
    setTimeout(() => {
      ElMessage.success('数据恢复成功')
    }, 2000)
  }).catch(() => {})
}

function handleDownload(row: Backup) {
  if (row.status !== 'completed') {
    ElMessage.warning('只有已完成的备份才能下载')
    return
  }
  ElMessage.success(`开始下载: ${row.name}`)
}

function handleDelete(row: Backup) {
  ElMessageBox.confirm('确定要删除该备份吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = backups.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      backups.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.action-bar { display: flex; justify-content: flex-start; margin-bottom: 16px; }
</style>
