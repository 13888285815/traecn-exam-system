<template>
  <div class="page-container">
    <div class="page-header">
      <h2>自定义页面</h2>
      <p class="page-desc">创建和管理企业自定义页面，如关于我们、联系我们等</p>
    </div>
    <div class="page-content">
      <div class="search-bar">
        <el-input v-model="searchKeyword" placeholder="搜索页面标题..." clearable style="width: 240px" @input="handleSearch">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>新建页面
        </el-button>
      </div>

      <el-table :data="filteredList" stripe style="margin-top: 16px" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="页面标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="path" label="访问路径" width="180">
          <template #default="{ row }">
            <code style="font-size: 12px; color: #409EFF;">/{{ row.path }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览量" width="100" align="center" />
        <el-table-column prop="updatedAt" label="更新时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 'published' ? 'warning' : 'success'" link @click="handleToggleStatus(row)">
              {{ row.status === 'published' ? '下线' : '发布' }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑页面' : '新建页面'" width="760px" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="页面标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入页面标题" />
        </el-form-item>
        <el-form-item label="访问路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入路径，如 about-us">
            <template #prepend>/</template>
          </el-input>
        </el-form-item>
        <el-form-item label="页面状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="published">发布</el-radio>
            <el-radio value="draft">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="页面内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="12" placeholder="请输入页面内容（支持富文本格式）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button @click="handlePreview">预览</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">保存</el-button>
      </template>
    </el-dialog>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" title="页面预览" width="760px">
      <div class="preview-content">
        <h1 style="margin-top: 0; color: #303133;">{{ form.title }}</h1>
        <div style="color: #606266; line-height: 1.8; white-space: pre-wrap;">{{ form.content }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

interface Page {
  id: number
  title: string
  path: string
  content: string
  status: 'published' | 'draft'
  views: number
  createdAt: string
  updatedAt: string
}

const loading = ref(false)
const searchKeyword = ref('')
const dialogVisible = ref(false)
const previewVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const list = ref<Page[]>([])
const filteredList = computed(() => {
  return list.value.filter(item => !searchKeyword.value || item.title.includes(searchKeyword.value))
})

const form = reactive({ title: '', path: '', content: '', status: 'draft' as const })

const formRules: FormRules = {
  title: [{ required: true, message: '请输入页面标题', trigger: 'blur' }],
  path: [{ required: true, message: '请输入访问路径', trigger: 'blur' }]
}

const handleSearch = () => {}
const handleCreate = () => { isEdit.value = false; dialogVisible.value = true }
const handleEdit = (row: Page) => {
  isEdit.value = true; editingId.value = row.id
  Object.assign(form, { title: row.title, path: row.path, content: row.content, status: row.status })
  dialogVisible.value = true
}
const handleToggleStatus = (row: Page) => {
  row.status = row.status === 'published' ? 'draft' : 'published'
  row.updatedAt = new Date().toLocaleString('zh-CN')
  ElMessage.success(row.status === 'published' ? '已发布' : '已下线')
}
const handleDelete = (row: Page) => {
  list.value = list.value.filter(i => i.id !== row.id)
  ElMessage.success('删除成功')
}
const handlePreview = () => { previewVisible.value = true }
const resetForm = () => { formRef.value?.resetFields() }

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (!valid) return
    submitLoading.value = true
    setTimeout(() => {
      const now = new Date().toLocaleString('zh-CN')
      if (isEdit.value && editingId.value !== null) {
        const idx = list.value.findIndex(i => i.id === editingId.value)
        if (idx > -1) list.value[idx] = { ...list.value[idx], ...form, updatedAt: now }
        ElMessage.success('更新成功')
      } else {
        list.value.unshift({ id: Date.now(), ...form, views: 0, createdAt: now, updatedAt: now })
        ElMessage.success('创建成功')
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
      { id: 1, title: '关于我们', path: 'about-us', content: '北京科技有限公司成立于2015年，是国内领先的在线教育解决方案提供商。公司专注于企业培训和人才发展领域，致力于为企业提供一站式数字化培训平台。\n\n公司拥有完善的产品体系和专业的服务团队，已服务超过500家中大型企业客户。', status: 'published', views: 2340, createdAt: '2025-06-01 10:00:00', updatedAt: '2026-01-10 14:00:00' },
      { id: 2, title: '联系我们', path: 'contact', content: '地址：北京市海淀区中关村大街1号科技大厦\n电话：010-82345678\n邮箱：contact@corp.com\n商务合作：business@corp.com', status: 'published', views: 1560, createdAt: '2025-06-01 10:00:00', updatedAt: '2026-02-15 09:00:00' },
      { id: 3, title: '隐私政策', path: 'privacy', content: '我们承诺保护您的个人信息和隐私权益...', status: 'draft', views: 0, createdAt: '2026-03-01 11:00:00', updatedAt: '2026-03-01 11:00:00' },
      { id: 4, title: '用户协议', path: 'terms', content: '使用本平台服务前，请仔细阅读以下条款...', status: 'draft', views: 0, createdAt: '2026-03-01 11:30:00', updatedAt: '2026-03-01 11:30:00' }
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
.preview-content { padding: 20px; background: #FAFAFA; border-radius: 4px; min-height: 300px; }
</style>
