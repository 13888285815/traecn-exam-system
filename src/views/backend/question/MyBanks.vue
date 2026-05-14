<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的题库</h2>
      <p class="page-desc">管理您创建的所有题库，支持新建、编辑、发布和删除操作</p>
    </div>

    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索题库名称..."
          prefix-icon="Search"
          clearable
          style="width: 280px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filterCategory" placeholder="全部分类" clearable style="width: 160px" @change="handleSearch">
          <el-option v-for="cat in categories" :key="cat.value" :label="cat.label" :value="cat.value" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="全部状态" clearable style="width: 140px" @change="handleSearch">
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="已下架" value="unpublished" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>新建题库
        </el-button>
        <el-dropdown trigger="click" @command="handleBatchCommand">
          <el-button :disabled="!selectedRows.length">
            批量操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="publish">批量发布</el-dropdown-item>
              <el-dropdown-item command="unpublish">批量下架</el-dropdown-item>
              <el-dropdown-item command="delete" divided>批量删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 题库表格 -->
    <el-table
      :data="filteredBanks"
      stripe
      style="width: 100%"
      @selection-change="handleSelectionChange"
      v-loading="loading"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="题库名称" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="bank-name" @click="handleView(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="questionCount" label="题目数量" width="100" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="tags" label="标签" min-width="160">
        <template #default="{ row }">
          <el-tag v-for="tag in row.tags" :key="tag" size="small" type="info" style="margin-right: 4px">
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button
            v-if="row.status === 'draft'"
            size="small"
            type="success"
            link
            @click="handlePublish(row)"
          >发布</el-button>
          <el-button
            v-if="row.status === 'published'"
            size="small"
            type="warning"
            link
            @click="handleUnpublish(row)"
          >下架</el-button>
          <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="filteredBanks.length"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </div>

    <!-- 新建/编辑题库对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingBank ? '编辑题库' : '新建题库'"
      width="560px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="bankForm"
        :rules="formRules"
        label-width="80px"
        label-position="right"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="bankForm.name" placeholder="请输入题库名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="bankForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入题库描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="bankForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.value" :label="cat.label" :value="cat.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select v-model="bankForm.tags" multiple filterable allow-create default-first-option placeholder="输入标签后回车" style="width: 100%">
            <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, ArrowDown } from '@element-plus/icons-vue'

// ---- 搜索与筛选 ----
const searchKeyword = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const loading = ref(false)

const categories = [
  { label: '计算机基础', value: '计算机基础' },
  { label: '数据结构', value: '数据结构' },
  { label: '操作系统', value: '操作系统' },
  { label: '计算机网络', value: '计算机网络' },
  { label: '数据库原理', value: '数据库原理' },
  { label: '英语', value: '英语' },
  { label: '数学', value: '数学' }
]

const availableTags = ['重点', '期末', '模拟', '真题', '易错', '高频']

// ---- Mock 数据 ----
const mockQuestionBanks = ref([
  { id: 1, name: '2026年计算机基础期末题库', category: '计算机基础', questionCount: 120, status: 'published', tags: ['期末', '重点'], createdAt: '2026-04-15 10:30:00' },
  { id: 2, name: '数据结构与算法练习题', category: '数据结构', questionCount: 85, status: 'published', tags: ['真题', '高频'], createdAt: '2026-04-10 14:20:00' },
  { id: 3, name: '操作系统原理题库', category: '操作系统', questionCount: 60, status: 'draft', tags: ['重点'], createdAt: '2026-04-08 09:15:00' },
  { id: 4, name: '计算机网络模拟试卷', category: '计算机网络', questionCount: 45, status: 'published', tags: ['模拟'], createdAt: '2026-03-28 16:45:00' },
  { id: 5, name: '数据库原理历年真题', category: '数据库原理', questionCount: 200, status: 'unpublished', tags: ['真题', '易错'], createdAt: '2026-03-20 11:00:00' },
  { id: 6, name: '大学英语四级词汇题库', category: '英语', questionCount: 500, status: 'published', tags: ['高频'], createdAt: '2026-03-15 08:30:00' },
  { id: 7, name: '高等数学练习题集', category: '数学', questionCount: 150, status: 'draft', tags: ['重点', '易错'], createdAt: '2026-03-10 13:20:00' },
  { id: 8, name: 'Python编程基础题库', category: '计算机基础', questionCount: 90, status: 'published', tags: ['模拟'], createdAt: '2026-02-28 10:00:00' }
])

// ---- 表格筛选 ----
const filteredBanks = computed(() => {
  let list = mockQuestionBanks.value
  if (searchKeyword.value) {
    list = list.filter(item => item.name.includes(searchKeyword.value))
  }
  if (filterCategory.value) {
    list = list.filter(item => item.category === filterCategory.value)
  }
  if (filterStatus.value) {
    list = list.filter(item => item.status === filterStatus.value)
  }
  return list
})

// ---- 分页 ----
const currentPage = ref(1)
const pageSize = ref(10)

// ---- 选择行 ----
const selectedRows = ref<any[]>([])
function handleSelectionChange(rows: any[]) {
  selectedRows.value = rows
}

// ---- 状态相关 ----
function statusText(status: string) {
  const map: Record<string, string> = { draft: '草稿', published: '已发布', unpublished: '已下架' }
  return map[status] || status
}
function statusTagType(status: string) {
  const map: Record<string, string> = { draft: 'info', published: 'success', unpublished: 'warning' }
  return map[status] || 'info'
}

// ---- 新建/编辑对话框 ----
const showCreateDialog = ref(false)
const editingBank = ref<any>(null)
const formRef = ref<FormInstance>()

const bankForm = reactive({
  name: '',
  description: '',
  category: '',
  tags: [] as string[]
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入题库名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

function resetForm() {
  bankForm.name = ''
  bankForm.description = ''
  bankForm.category = ''
  bankForm.tags = []
  editingBank.value = null
}

function handleEdit(row: any) {
  editingBank.value = row
  bankForm.name = row.name
  bankForm.description = row.description || ''
  bankForm.category = row.category
  bankForm.tags = [...row.tags]
  showCreateDialog.value = true
}

function handleSubmitForm() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    if (editingBank.value) {
      Object.assign(editingBank.value, {
        name: bankForm.name,
        description: bankForm.description,
        category: bankForm.category,
        tags: bankForm.tags
      })
      ElMessage.success('题库更新成功')
    } else {
      mockQuestionBanks.value.unshift({
        id: Date.now(),
        name: bankForm.name,
        category: bankForm.category,
        questionCount: 0,
        status: 'draft',
        tags: bankForm.tags,
        createdAt: new Date().toLocaleString('zh-CN')
      })
      ElMessage.success('题库创建成功')
    }
    showCreateDialog.value = false
    resetForm()
  })
}

// ---- 操作 ----
function handleSearch() {
  currentPage.value = 1
}

function handleView(row: any) {
  ElMessage.info(`查看题库：${row.name}`)
}

function handlePublish(row: any) {
  ElMessageBox.confirm(`确定发布题库「${row.name}」吗？`, '确认发布', { type: 'warning' })
    .then(() => { row.status = 'published'; ElMessage.success('发布成功') })
    .catch(() => {})
}

function handleUnpublish(row: any) {
  ElMessageBox.confirm(`确定下架题库「${row.name}」吗？`, '确认下架', { type: 'warning' })
    .then(() => { row.status = 'unpublished'; ElMessage.success('下架成功') })
    .catch(() => {})
}

function handleDelete(row: any) {
  ElMessageBox.confirm(`确定删除题库「${row.name}」吗？此操作不可恢复。`, '确认删除', { type: 'error' })
    .then(() => {
      const idx = mockQuestionBanks.value.findIndex(item => item.id === row.id)
      if (idx > -1) mockQuestionBanks.value.splice(idx, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

function handleBatchCommand(command: string) {
  const count = selectedRows.value.length
  if (command === 'publish') {
    selectedRows.value.forEach(row => { row.status = 'published' })
    ElMessage.success(`已批量发布 ${count} 个题库`)
  } else if (command === 'unpublish') {
    selectedRows.value.forEach(row => { row.status = 'unpublished' })
    ElMessage.success(`已批量下架 ${count} 个题库`)
  } else if (command === 'delete') {
    ElMessageBox.confirm(`确定删除选中的 ${count} 个题库吗？`, '批量删除', { type: 'error' })
      .then(() => {
        const ids = selectedRows.value.map(r => r.id)
        mockQuestionBanks.value = mockQuestionBanks.value.filter(item => !ids.includes(item.id))
        ElMessage.success(`已批量删除 ${count} 个题库`)
      })
      .catch(() => {})
  }
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.toolbar-left { display: flex; gap: 12px; flex-wrap: wrap; }
.toolbar-right { display: flex; gap: 8px; }
.bank-name {
  color: #4A6CF7;
  cursor: pointer;
}
.bank-name:hover { text-decoration: underline; }
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
