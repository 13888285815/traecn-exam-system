<template>
  <div class="page-container">
    <div class="page-header">
      <h2>课程管理</h2>
      <p class="page-desc">管理企业课程，包括课程创建、编辑、发布和学员管理</p>
    </div>
    <div class="page-content">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索课程名称..."
          clearable
          style="width: 240px"
          @input="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterCategory" placeholder="选择分类" clearable style="width: 160px" @change="handleSearch">
          <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="选择状态" clearable style="width: 140px" @change="handleSearch">
          <el-option label="已上架" value="published" />
          <el-option label="已下架" value="draft" />
        </el-select>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>新增课程
        </el-button>
      </div>

      <!-- 课程列表 -->
      <el-table :data="filteredList" stripe style="margin-top: 16px" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="课程名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="teacher" label="授课老师" width="120" />
        <el-table-column prop="duration" label="时长(分钟)" width="110" align="center" />
        <el-table-column prop="studentCount" label="学员数" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
              {{ row.status === 'published' ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 'published' ? 'warning' : 'success'" link @click="handleToggleStatus(row)">
              {{ row.status === 'published' ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑课程' : '新增课程'" width="680px" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="课程分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
                <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="授课老师" prop="teacher">
              <el-input v-model="form.teacher" placeholder="请输入老师姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="课程时长" prop="duration">
              <el-input-number v-model="form.duration" :min="1" :max="9999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="上架" value="published" />
                <el-option label="下架" value="draft" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="课程描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入课程描述" />
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

interface Course {
  id: number
  name: string
  category: string
  teacher: string
  duration: number
  description: string
  studentCount: number
  status: 'published' | 'draft'
  createdAt: string
}

const categories = ['职业技能', '管理培训', '安全教育', '入职培训', '技术进阶']

const loading = ref(false)
const searchKeyword = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const list = ref<Course[]>([])
const filteredList = computed(() => {
  return list.value.filter(item => {
    const matchKeyword = !searchKeyword.value || item.name.includes(searchKeyword.value) || item.teacher.includes(searchKeyword.value)
    const matchCategory = !filterCategory.value || item.category === filterCategory.value
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchKeyword && matchCategory && matchStatus
  })
})

const form = reactive({
  name: '',
  category: '',
  teacher: '',
  duration: 60,
  description: '',
  status: 'draft' as const
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  teacher: [{ required: true, message: '请输入授课老师', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入课程时长', trigger: 'blur' }]
}

const handleSearch = () => {}
const handleCreate = () => { isEdit.value = false; dialogVisible.value = true }
const handleEdit = (row: Course) => {
  isEdit.value = true
  editingId.value = row.id
  Object.assign(form, { name: row.name, category: row.category, teacher: row.teacher, duration: row.duration, description: row.description, status: row.status })
  dialogVisible.value = true
}
const handleToggleStatus = (row: Course) => {
  row.status = row.status === 'published' ? 'draft' : 'published'
  ElMessage.success(row.status === 'published' ? '已上架' : '已下架')
}
const handleDelete = (row: Course) => {
  list.value = list.value.filter(item => item.id !== row.id)
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
        list.value.unshift({ id: Date.now(), ...form, studentCount: 0, createdAt: new Date().toLocaleString('zh-CN') })
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
      { id: 1, name: '安全生产基础知识', category: '安全教育', teacher: '李老师', duration: 120, description: '涵盖安全生产法律法规和基本操作规范', studentCount: 45, status: 'published', createdAt: '2026-01-15 09:30:00' },
      { id: 2, name: '新员工入职培训', category: '入职培训', teacher: '王老师', duration: 240, description: '帮助新员工快速融入公司文化和工作流程', studentCount: 120, status: 'published', createdAt: '2026-01-10 14:00:00' },
      { id: 3, name: '中层管理能力提升', category: '管理培训', teacher: '张老师', duration: 180, description: '提升中层管理者的领导力和团队建设能力', studentCount: 30, status: 'draft', createdAt: '2026-02-01 10:00:00' },
      { id: 4, name: 'Python 编程进阶', category: '技术进阶', teacher: '陈老师', duration: 300, description: '深入学习 Python 高级特性和项目实战', studentCount: 0, status: 'draft', createdAt: '2026-02-05 16:00:00' },
      { id: 5, name: '职业礼仪与沟通', category: '职业技能', teacher: '赵老师', duration: 90, description: '职场礼仪、电话沟通和商务谈判技巧', studentCount: 80, status: 'published', createdAt: '2026-01-20 11:00:00' }
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
