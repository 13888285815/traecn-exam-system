<template>
  <div class="page-container">
    <div class="page-header">
      <h2>API 接口管理</h2>
      <p class="page-desc">管理 API 密钥和访问权限</p>
    </div>
    <div class="page-content">
      <div class="action-bar">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>创建密钥
        </el-button>
      </div>

      <el-table :data="apiKeys" stripe style="margin-top: 20px">
        <el-table-column prop="name" label="密钥名称" />
        <el-table-column prop="key" label="API 密钥">
          <template #default="{ row }">
            <el-input v-if="row.showKey" :model-value="row.key" readonly style="max-width: 300px">
              <template #append>
                <el-button @click="row.showKey = false">
                  <el-icon><Hide /></el-icon>
                </el-button>
              </template>
            </el-input>
            <el-input v-else model-value="••••••••••••••••" readonly style="max-width: 200px">
              <template #append>
                <el-button @click="row.showKey = true">
                  <el-icon><View /></el-icon>
                </el-button>
              </template>
            </el-input>
          </template>
        </el-table-column>
        <el-table-column prop="permissions" label="权限">
          <template #default="{ row }">
            <el-tag v-for="perm in row.permissions" :key="perm" style="margin-right: 4px">
              {{ perm }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑权限</el-button>
            <el-button size="small" type="primary" link @click="handleToggleStatus(row)">
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 创建/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑 API 密钥' : '创建 API 密钥'"
        width="500px"
      >
        <el-form :model="form" label-width="100px">
          <el-form-item label="密钥名称" required>
            <el-input v-model="form.name" placeholder="请输入密钥名称" />
          </el-form-item>
          <el-form-item label="权限设置" required>
            <el-checkbox-group v-model="form.permissions">
              <el-checkbox label="read">读取权限</el-checkbox>
              <el-checkbox label="write">写入权限</el-checkbox>
              <el-checkbox label="delete">删除权限</el-checkbox>
              <el-checkbox label="admin">管理员权限</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="form.status" active-value="active" inactive-value="disabled" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, View, Hide } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface ApiKey {
  id: number
  name: string
  key: string
  permissions: string[]
  status: 'active' | 'disabled'
  createdAt: string
  showKey?: boolean
}

const apiKeys = ref<ApiKey[]>([
  { id: 1, name: '生产环境密钥', key: 'sk_live_1234567890abcdef', permissions: ['read', 'write'], status: 'active', createdAt: '2026-05-10 10:00:00', showKey: false },
  { id: 2, name: '测试环境密钥', key: 'sk_test_abcdef1234567890', permissions: ['read'], status: 'active', createdAt: '2026-05-12 14:30:00', showKey: false },
  { id: 3, name: '备用密钥', key: 'sk_backup_567890abcdef12', permissions: ['read', 'write', 'delete'], status: 'disabled', createdAt: '2026-05-14 09:00:00', showKey: false }
])

const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
  name: '',
  permissions: [] as string[],
  status: 'active' as 'active' | 'disabled'
})

function resetForm() {
  form.name = ''
  form.permissions = []
  form.status = 'active'
  editingId.value = null
}

function handleCreate() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: ApiKey) {
  isEdit.value = true
  editingId.value = row.id
  form.name = row.name
  form.permissions = [...row.permissions]
  form.status = row.status
  dialogVisible.value = true
}

function handleSubmit() {
  if (!form.name) {
    ElMessage.warning('请输入密钥名称')
    return
  }
  if (form.permissions.length === 0) {
    ElMessage.warning('请至少选择一个权限')
    return
  }

  if (isEdit.value && editingId.value) {
    const index = apiKeys.value.findIndex(item => item.id === editingId.value)
    if (index !== -1) {
      apiKeys.value[index] = {
        ...apiKeys.value[index],
        name: form.name,
        permissions: [...form.permissions],
        status: form.status
      }
      ElMessage.success('更新成功')
    }
  } else {
    const newKey: ApiKey = {
      id: Date.now(),
      name: form.name,
      key: `sk_${Math.random().toString(36).substring(2, 18)}`,
      permissions: [...form.permissions],
      status: form.status,
      createdAt: new Date().toLocaleString('zh-CN'),
      showKey: false
    }
    apiKeys.value.unshift(newKey)
    ElMessage.success('创建成功')
  }

  dialogVisible.value = false
  resetForm()
}

function handleToggleStatus(row: ApiKey) {
  row.status = row.status === 'active' ? 'disabled' : 'active'
  ElMessage.success('状态已更新')
}

function handleDelete(row: ApiKey) {
  ElMessageBox.confirm('确定要删除该 API 密钥吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = apiKeys.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      apiKeys.value.splice(index, 1)
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
