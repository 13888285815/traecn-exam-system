<template>
  <div class="page-container">
    <div class="page-header">
      <h2>分组管理</h2>
      <p class="page-desc">管理系统分组和成员分配</p>
    </div>
    <div class="page-content">
      <div class="action-bar">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>创建分组
        </el-button>
      </div>

      <el-table :data="groups" stripe style="margin-top: 20px">
        <el-table-column prop="name" label="分组名称" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="160" />
        <el-table-column prop="memberCount" label="成员数量" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
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
        :title="isEdit ? '编辑分组' : '创建分组'"
        width="520px"
        :close-on-click-modal="false"
      >
        <el-form :model="form" label-width="100px" :rules="formRules" ref="formRef">
          <el-form-item label="分组名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入分组名称" maxlength="50" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入分组描述"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="form.status" active-value="active" inactive-value="disabled" />
            <span style="margin-left: 8px; color: #999; font-size: 13px;">
              {{ form.status === 'active' ? '启用' : '禁用' }}
            </span>
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
import { ref, reactive, nextTick } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface GroupItem {
  id: number
  name: string
  description: string
  memberCount: number
  status: 'active' | 'disabled'
  createdAt: string
}

const groups = ref<GroupItem[]>([
  { id: 1, name: '管理员组', description: '系统管理员', memberCount: 5, status: 'active', createdAt: '2026-04-01 10:00:00' },
  { id: 2, name: '教师组', description: '阅卷和题库管理', memberCount: 20, status: 'active', createdAt: '2026-04-02 14:30:00' },
  { id: 3, name: '学生组', description: '普通学生用户', memberCount: 150, status: 'active', createdAt: '2026-04-03 09:00:00' },
  { id: 4, name: '访客组', description: '临时访问权限', memberCount: 0, status: 'disabled', createdAt: '2026-05-10 16:00:00' },
])

const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  description: '',
  status: 'active' as 'active' | 'disabled',
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入分组名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  description: [
    { max: 200, message: '最多 200 个字符', trigger: 'blur' },
  ],
}

function resetForm() {
  form.name = ''
  form.description = ''
  form.status = 'active'
  editingId.value = null
  nextTick(() => formRef.value?.clearValidate())
}

function handleCreate() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: GroupItem) {
  isEdit.value = true
  editingId.value = row.id
  form.name = row.name
  form.description = row.description
  form.status = row.status
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (isEdit.value && editingId.value) {
    const index = groups.value.findIndex(item => item.id === editingId.value)
    if (index !== -1) {
      groups.value[index] = {
        ...groups.value[index],
        name: form.name,
        description: form.description,
        status: form.status,
      }
      ElMessage.success('分组已更新')
    }
  } else {
    groups.value.unshift({
      id: Date.now(),
      name: form.name,
      description: form.description,
      memberCount: 0,
      status: form.status,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    })
    ElMessage.success('分组已创建')
  }

  dialogVisible.value = false
  resetForm()
}

function handleToggleStatus(row: GroupItem) {
  row.status = row.status === 'active' ? 'disabled' : 'active'
  ElMessage.success(`已${row.status === 'active' ? '启用' : '禁用'}${row.name}`)
}

function handleDelete(row: GroupItem) {
  if (row.memberCount > 0) {
    ElMessage.warning('该分组下还有成员，请先移除成员后再删除')
    return
  }
  ElMessageBox.confirm(`确定要删除分组"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const index = groups.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      groups.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.page-container { padding: 24px; background: #f5f7fa; min-height: 100%; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 6px; font-size: 20px; font-weight: 600; color: #1a1a1a; }
.page-desc { color: #909399; margin: 0; font-size: 13px; }
.action-bar { display: flex; justify-content: flex-start; margin-bottom: 16px; }
</style>
