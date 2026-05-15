<template>
  <div class="schedule-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>定时任务</h2>
      <p class="page-desc">管理系统定时任务和调度配置</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        创建任务
      </el-button>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索任务名称"
        prefix-icon="Search"
        style="width: 300px"
        clearable
      />
    </div>

    <!-- 任务列表 -->
    <el-card shadow="hover">
      <el-table :data="filteredTasks" stripe style="width: 100%">
        <el-table-column prop="name" label="任务名称" min-width="150" />
        <el-table-column prop="type" label="任务类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTaskTypeTag(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cron" label="Cron表达式" width="150" />
        <el-table-column prop="nextRunTime" label="下次执行时间" width="160" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'info'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastRunTime" label="上次执行" width="160" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleViewLog(row)">日志</el-button>
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              size="small"
              :type="row.status === '启用' ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === '启用' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '创建任务' : '编辑任务'"
      width="600px"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="任务名称" required>
          <el-input v-model="formData.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务类型" required>
          <el-select v-model="formData.type" placeholder="请选择任务类型">
            <el-option label="数据备份" value="数据备份" />
            <el-option label="数据统计" value="数据统计" />
            <el-option label="邮件通知" value="邮件通知" />
            <el-option label="缓存清理" value="缓存清理" />
          </el-select>
        </el-form-item>
        <el-form-item label="Cron表达式" required>
          <el-input v-model="formData.cron" placeholder="如: 0 0 * * *">
            <template #append>
              <el-button @click="handleCronHelper">生成</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入任务描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.enabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 执行日志抽屉 -->
    <el-drawer v-model="logDrawerVisible" title="执行日志" size="50%">
      <el-timeline>
        <el-timeline-item
          v-for="log in currentLogs"
          :key="log.id"
          :timestamp="log.time"
          placement="top"
          :type="log.status === '成功' ? 'success' : 'danger'"
        >
          <el-card shadow="hover">
            <h4>{{ log.taskName }}</h4>
            <p>执行状态: <el-tag :type="log.status === '成功' ? 'success' : 'danger'" size="small">{{ log.status }}</el-tag></p>
            <p>执行时长: {{ log.duration }}ms</p>
            <p>执行结果: {{ log.result }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Task {
  id: number
  name: string
  type: string
  cron: string
  nextRunTime: string
  status: string
  lastRunTime: string
  description: string
  enabled: boolean
}

interface Log {
  id: number
  taskName: string
  time: string
  status: string
  duration: number
  result: string
}

const searchKeyword = ref('')
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const logDrawerVisible = ref(false)
const currentLogs = ref<Log[]>([])

const formData = ref<Partial<Task>>({
  name: '',
  type: '',
  cron: '',
  description: '',
  enabled: true
})

const tasks = ref<Task[]>([
  {
    id: 1,
    name: '每日数据备份',
    type: '数据备份',
    cron: '0 2 * * *',
    nextRunTime: '2026-05-16 02:00:00',
    status: '启用',
    lastRunTime: '2026-05-15 02:00:00',
    description: '每天凌晨2点自动备份数据库',
    enabled: true
  },
  {
    id: 2,
    name: '每周统计报告',
    type: '数据统计',
    cron: '0 9 * * 1',
    nextRunTime: '2026-05-19 09:00:00',
    status: '启用',
    lastRunTime: '2026-05-12 09:00:00',
    description: '每周一上午9点生成统计报告',
    enabled: true
  },
  {
    id: 3,
    name: '过期邮件提醒',
    type: '邮件通知',
    cron: '0 10 * * *',
    nextRunTime: '2026-05-16 10:00:00',
    status: '禁用',
    lastRunTime: '2026-05-10 10:00:00',
    description: '每天上午10点发送过期提醒邮件',
    enabled: false
  }
])

const filteredTasks = computed(() => {
  if (!searchKeyword.value) return tasks.value
  return tasks.value.filter(task =>
    task.name.includes(searchKeyword.value) ||
    task.type.includes(searchKeyword.value)
  )
})

const getTaskTypeTag = (type: string) => {
  const map: Record<string, string> = {
    '数据备份': 'primary',
    '数据统计': 'success',
    '邮件通知': 'warning',
    '缓存清理': 'info'
  }
  return map[type] || 'info'
}

const handleCreate = () => {
  dialogType.value = 'create'
  formData.value = { name: '', type: '', cron: '', description: '', enabled: true }
  dialogVisible.value = true
}

const handleEdit = (row: Task) => {
  dialogType.value = 'edit'
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (dialogType.value === 'create') {
    const newTask: Task = {
      id: Date.now(),
      name: formData.value.name || '',
      type: formData.value.type || '',
      cron: formData.value.cron || '',
      nextRunTime: '2026-05-16 00:00:00',
      status: formData.value.enabled ? '启用' : '禁用',
      lastRunTime: '-',
      description: formData.value.description || '',
      enabled: formData.value.enabled || false
    }
    tasks.value.unshift(newTask)
    ElMessage.success('创建成功')
  } else {
    const index = tasks.value.findIndex(t => t.id === formData.value.id)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...formData.value }
      ElMessage.success('更新成功')
    }
  }
  dialogVisible.value = false
}

const handleToggleStatus = (row: Task) => {
  row.status = row.status === '启用' ? '禁用' : '启用'
  row.enabled = row.status === '启用'
  ElMessage.success(`已${row.status}该任务`)
}

const handleDelete = (row: Task) => {
  ElMessageBox.confirm('确定要删除该任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = tasks.value.findIndex(t => t.id === row.id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleViewLog = (row: Task) => {
  currentLogs.value = [
    { id: 1, taskName: row.name, time: '2026-05-15 02:00:00', status: '成功', duration: 1234, result: '备份完成，文件大小: 256MB' },
    { id: 2, taskName: row.name, time: '2026-05-14 02:00:00', status: '成功', duration: 1156, result: '备份完成，文件大小: 248MB' },
    { id: 3, taskName: row.name, time: '2026-05-13 02:00:00', status: '失败', duration: 0, result: '数据库连接失败' }
  ]
  logDrawerVisible.value = true
}

const handleCronHelper = () => {
  ElMessage.info('Cron表达式生成器开发中')
}
</script>

<style scoped>
.schedule-page {
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

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
