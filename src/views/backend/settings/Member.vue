<template>
  <div class="page-container">
    <div class="page-header">
      <h2>成员管理</h2>
      <p class="page-desc">管理系统成员和角色分配</p>
    </div>
    <div class="page-content">
      <!-- 搜索栏 -->
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索成员姓名/邮箱"
          clearable
          style="width: 260px"
          @clear="loadData"
          @keyup.enter="loadData"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterRole" placeholder="全部角色" clearable style="width: 140px" @change="loadData">
          <el-option label="全部角色" value="" />
          <el-option label="管理员" value="admin" />
          <el-option label="教师" value="teacher" />
          <el-option label="学生" value="student" />
          <el-option label="访客" value="guest" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="全部状态" clearable style="width: 140px" @change="loadData">
          <el-option label="全部状态" value="" />
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>添加成员
        </el-button>
      </div>

      <el-table :data="filteredMembers" stripe style="margin-top: 20px">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="role" label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="roleTagType(row.role)">{{ roleLabel(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="groupName" label="所属分组" width="120" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="primary" link @click="handleResetPassword(row)">重置密码</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="filteredMembers.length > 0"
        style="margin-top: 16px; display: flex; justify-content: flex-end"
        background
        layout="total, sizes, prev, pager, next"
        :total="filteredMembers.length"
        :page-sizes="[10, 20, 50]"
        :default-page-size="10"
      />

      <!-- 创建/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑成员' : '添加成员'"
        width="560px"
        :close-on-click-modal="false"
      >
        <el-form :model="form" label-width="90px" :rules="formRules" ref="formRef">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" maxlength="30" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="form.role" placeholder="请选择角色">
              <el-option label="管理员" value="admin" />
              <el-option label="教师" value="teacher" />
              <el-option label="学生" value="student" />
              <el-option label="访客" value="guest" />
            </el-select>
          </el-form-item>
          <el-form-item label="分组" prop="groupId">
            <el-select v-model="form.groupId" placeholder="请选择分组" clearable>
              <el-option
                v-for="g in groups"
                :key="g.id"
                :label="g.name"
                :value="g.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="form.status" active-value="active" inactive-value="disabled" />
            <span style="margin-left: 8px; color: #999; font-size: 13px;">
              {{ form.status === 'active' ? '启用' : '禁用' }}
            </span>
          </el-form-item>
          <el-form-item v-if="!isEdit" label="初始密码" prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入初始密码" />
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
import { ref, reactive, computed, nextTick } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface Member {
  id: number
  name: string
  email: string
  role: 'admin' | 'teacher' | 'student' | 'guest'
  groupId: number | null
  groupName: string
  status: 'active' | 'disabled'
  lastLoginAt: string
}

interface GroupOption {
  id: number
  name: string
}

const members = ref<Member[]>([
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin', groupId: 1, groupName: '管理员组', status: 'active', lastLoginAt: '2026-05-15 08:30:00' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: 'teacher', groupId: 2, groupName: '教师组', status: 'active', lastLoginAt: '2026-05-14 16:20:00' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: 'student', groupId: 3, groupName: '学生组', status: 'active', lastLoginAt: '2026-05-15 09:00:00' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: 'guest', groupId: null, groupName: '-', status: 'disabled', lastLoginAt: '2026-05-10 10:00:00' },
  { id: 5, name: '孙七', email: 'sunqi@example.com', role: 'teacher', groupId: 2, groupName: '教师组', status: 'active', lastLoginAt: '2026-05-13 11:45:00' },
])

const groups = ref<GroupOption[]>([
  { id: 1, name: '管理员组' },
  { id: 2, name: '教师组' },
  { id: 3, name: '学生组' },
])

const searchKeyword = ref('')
const filterRole = ref('')
const filterStatus = ref('')

const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  email: '',
  role: 'student' as 'admin' | 'teacher' | 'student' | 'guest',
  groupId: null as number | null,
  status: 'active' as 'active' | 'disabled',
  password: '',
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' },
  ],
}

const filteredMembers = computed(() => {
  return members.value.filter(m => {
    const matchKeyword = !searchKeyword.value ||
      m.name.includes(searchKeyword.value) ||
      m.email.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchRole = !filterRole.value || m.role === filterRole.value
    const matchStatus = !filterStatus.value || m.status === filterStatus.value
    return matchKeyword && matchRole && matchStatus
  })
})

function roleLabel(role: string) {
  const map: Record<string, string> = { admin: '管理员', teacher: '教师', student: '学生', guest: '访客' }
  return map[role] || role
}
function roleTagType(role: string) {
  const map: Record<string, string> = { admin: 'danger', teacher: 'warning', student: '', guest: 'info' }
  return map[role] || ''
}

function loadData() {
  // 模拟刷新
}

function resetForm() {
  form.name = ''
  form.email = ''
  form.role = 'student'
  form.groupId = null
  form.status = 'active'
  form.password = ''
  editingId.value = null
  nextTick(() => formRef.value?.clearValidate())
}

function handleCreate() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: Member) {
  isEdit.value = true
  editingId.value = row.id
  form.name = row.name
  form.email = row.email
  form.role = row.role
  form.groupId = row.groupId
  form.status = row.status
  form.password = ''
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const group = groups.value.find(g => g.id === form.groupId)
  if (isEdit.value && editingId.value) {
    const index = members.value.findIndex(item => item.id === editingId.value)
    if (index !== -1) {
      members.value[index] = {
        ...members.value[index],
        name: form.name,
        email: form.email,
        role: form.role,
        groupId: form.groupId,
        groupName: group?.name || '-',
        status: form.status,
      }
      ElMessage.success('成员信息已更新')
    }
  } else {
    members.value.unshift({
      id: Date.now(),
      name: form.name,
      email: form.email,
      role: form.role,
      groupId: form.groupId,
      groupName: group?.name || '-',
      status: form.status,
      lastLoginAt: '-',
    })
    ElMessage.success('成员已添加')
  }

  dialogVisible.value = false
  resetForm()
}

function handleResetPassword(row: Member) {
  ElMessageBox.prompt('请输入新密码', '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'password',
    inputValidator: (v) => v.length >= 6 || '密码长度不能少于 6 个字符',
  }).then(({ value }) => {
    ElMessage.success(`${row.name} 的密码已重置`)
  }).catch(() => {})
}

function handleDelete(row: Member) {
  ElMessageBox.confirm(`确定要删除成员"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const index = members.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      members.value.splice(index, 1)
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
.filter-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
</style>
