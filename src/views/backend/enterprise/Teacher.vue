<template>
  <div class="page-container">
    <div class="page-header">
      <h2>老师管理</h2>
      <p class="page-desc">管理企业授课老师信息，包括老师的增删改查和状态管理</p>
    </div>
    <div class="page-content">
      <div class="search-bar">
        <el-input v-model="searchKeyword" placeholder="搜索老师姓名或科目..." clearable style="width: 240px" @input="handleSearch">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterSubject" placeholder="选择科目" clearable style="width: 160px" @change="handleSearch">
          <el-option v-for="s in subjects" :key="s" :label="s" :value="s" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="选择状态" clearable style="width: 140px" @change="handleSearch">
          <el-option label="在职" value="active" />
          <el-option label="离职" value="inactive" />
        </el-select>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>新增老师
        </el-button>
      </div>

      <el-table :data="filteredList" stripe style="margin-top: 16px" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="头像" width="70">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">{{ row.name.slice(0, 1) }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="subject" label="科目" width="120" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="courseCount" label="课程数" width="90" align="center" />
        <el-table-column prop="studentCount" label="学员数" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 'active' ? 'warning' : 'success'" link @click="handleToggleStatus(row)">
              {{ row.status === 'active' ? '离职' : '在职' }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑老师' : '新增老师'" width="620px" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入老师姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="科目" prop="subject">
              <el-select v-model="form.subject" placeholder="请选择科目" style="width: 100%">
                <el-option v-for="s in subjects" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="简介" prop="bio">
          <el-input v-model="form.bio" type="textarea" :rows="3" placeholder="请输入老师简介" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

interface Teacher {
  id: number
  name: string
  subject: string
  phone: string
  email: string
  bio: string
  avatar: string
  courseCount: number
  studentCount: number
  status: 'active' | 'inactive'
  createdAt: string
}

const subjects = ['安全生产', '管理培训', '技术培训', '职业素养', '合规风控', '通用技能']

const loading = ref(false)
const searchKeyword = ref('')
const filterSubject = ref('')
const filterStatus = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const list = ref<Teacher[]>([])
const filteredList = computed(() => {
  return list.value.filter(item => {
    const matchKeyword = !searchKeyword.value || item.name.includes(searchKeyword.value) || item.subject.includes(searchKeyword.value)
    const matchSubject = !filterSubject.value || item.subject === filterSubject.value
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchKeyword && matchSubject && matchStatus
  })
})

const form = reactive({ name: '', subject: '', phone: '', email: '', bio: '' })

const formRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  subject: [{ required: true, message: '请选择科目', trigger: 'change' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

const handleSearch = () => {}
const handleCreate = () => { isEdit.value = false; dialogVisible.value = true }
const handleEdit = (row: Teacher) => {
  isEdit.value = true; editingId.value = row.id
  Object.assign(form, { name: row.name, subject: row.subject, phone: row.phone, email: row.email, bio: row.bio })
  dialogVisible.value = true
}
const handleToggleStatus = (row: Teacher) => {
  row.status = row.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(row.status === 'active' ? '已启用' : '已停用')
}
const handleDelete = (row: Teacher) => {
  list.value = list.value.filter(i => i.id !== row.id)
  ElMessage.success('删除成功')
}
const resetForm = () => { formRef.value?.resetFields() }

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (!valid) return
    submitLoading.value = true
    setTimeout(() => {
      if (isEdit.value && editingId.value !== null) {
        const idx = list.value.findIndex(i => i.id === editingId.value)
        if (idx > -1) list.value[idx] = { ...list.value[idx], ...form }
        ElMessage.success('更新成功')
      } else {
        list.value.unshift({ id: Date.now(), ...form, avatar: '', courseCount: 0, studentCount: 0, status: 'active' as const, createdAt: new Date().toLocaleString('zh-CN') })
        ElMessage.success('新增成功')
      }
      submitLoading.value = false
      dialogVisible.value = false
    }, 600)
  })
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    list.value = [
      { id: 1, name: '李明远', subject: '安全生产', phone: '13812340001', email: 'limingyuan@corp.com', bio: '15年安全生产管理经验，国家注册安全工程师', avatar: '', courseCount: 4, studentCount: 320, status: 'active', createdAt: '2025-05-01 08:00:00' },
      { id: 2, name: '王晓燕', subject: '管理培训', phone: '13812340002', email: 'wangxiaoyan@corp.com', bio: 'MBA，从事企业管理和领导力培训10年', avatar: '', courseCount: 3, studentCount: 180, status: 'active', createdAt: '2025-05-15 09:00:00' },
      { id: 3, name: '张海涛', subject: '技术培训', phone: '13812340003', email: 'zhanghaitao@corp.com', bio: '全栈工程师，专注企业内部技术人才培养', avatar: '', courseCount: 5, studentCount: 250, status: 'active', createdAt: '2025-06-20 10:00:00' },
      { id: 4, name: '陈雅文', subject: '职业素养', phone: '13812340004', email: 'chenyawen@corp.com', bio: '资深HR，擅长职业规划和职场沟通培训', avatar: '', courseCount: 2, studentCount: 400, status: 'active', createdAt: '2025-07-01 11:00:00' },
      { id: 5, name: '周志刚', subject: '合规风控', phone: '13812340005', email: 'zhouzhigang@corp.com', bio: '律师背景，企业合规和风控领域专家', avatar: '', courseCount: 3, studentCount: 200, status: 'inactive', createdAt: '2025-08-10 14:00:00' }
    ]
    loading.value = false
  }, 400)
})
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; color: #303133; }
.page-desc { color: #909399; margin: 0; font-size: 14px; }
.search-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
</style>
