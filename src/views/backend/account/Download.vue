<template>
  <div class="page-container">
    <div class="page-header">
      <h2>文档下载</h2>
      <p class="page-desc">管理可下载的文档资源</p>
      <el-button type="primary" @click="showUploadDialog = true">
        <el-icon><Upload /></el-icon>上传文档
      </el-button>
    </div>

    <div class="page-content">
      <!-- 搜索栏 -->
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文档名称..."
          clearable
          class="search-input"
          @clear="loadDocuments"
          @keyup.enter="loadDocuments"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterType" placeholder="文档类型" clearable class="filter-select">
          <el-option label="全部" value="" />
          <el-option label="PDF" value="pdf" />
          <el-option label="Word" value="doc" />
          <el-option label="Excel" value="xls" />
          <el-option label="PPT" value="ppt" />
          <el-option label="其他" value="other" />
        </el-select>
      </div>

      <!-- 文档列表 -->
      <el-table :data="filteredDocuments" stripe style="width: 100%">
        <el-table-column prop="name" label="文档名称" min-width="200">
          <template #default="{ row }">
            <div class="doc-name">
              <el-icon :size="20" :color="getFileColor(row.type)">
                <Document />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.type.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column prop="downloadCount" label="下载次数" width="120" />
        <el-table-column prop="createdAt" label="上传时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="downloadDocument(row)">
              <el-icon><Download /></el-icon>下载
            </el-button>
            <el-button size="small" type="primary" link @click="editDocument(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="deleteDocument(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="filteredDocuments.length === 0" description="暂无文档" />
    </div>

    <!-- 上传/编辑对话框 -->
    <el-dialog v-model="showUploadDialog" :title="isEditing ? '编辑文档' : '上传文档'" width="500px">
      <el-form :model="docForm" label-width="80px">
        <el-form-item label="文档名称">
          <el-input v-model="docForm.name" placeholder="请输入文档名称" />
        </el-form-item>
        <el-form-item label="文档类型">
          <el-select v-model="docForm.type" placeholder="请选择类型">
            <el-option label="PDF" value="pdf" />
            <el-option label="Word" value="doc" />
            <el-option label="Excel" value="xls" />
            <el-option label="PPT" value="ppt" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="文档描述">
          <el-input v-model="docForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item v-if="!isEditing" label="上传文件">
          <el-upload
            :auto-upload="false"
            :limit="1"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            @change="handleFileChange"
          >
            <el-button type="primary" plain>选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="saveDocument">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Upload, Download, Document } from '@element-plus/icons-vue'

interface Document {
  id: number
  name: string
  type: string
  size: string
  description: string
  downloadCount: number
  createdAt: string
  file?: File
}

const searchKeyword = ref('')
const filterType = ref('')
const showUploadDialog = ref(false)
const isEditing = ref(false)
const documents = ref<Document[]>([])

const docForm = ref<Partial<Document>>({
  name: '',
  type: 'pdf',
  description: '',
  size: '',
  downloadCount: 0
})

const filteredDocuments = computed(() => {
  let result = documents.value
  if (searchKeyword.value) {
    result = result.filter(d => d.name.includes(searchKeyword.value))
  }
  if (filterType.value) {
    result = result.filter(d => d.type === filterType.value)
  }
  return result
})

function loadDocuments() {
  // Mock data
  documents.value = [
    { id: 1, name: '考试系统使用手册', type: 'pdf', size: '2.5 MB', description: '系统完整使用手册', downloadCount: 128, createdAt: '2026-05-10 10:00:00' },
    { id: 2, name: '题库导入模板', type: 'xls', size: '156 KB', description: 'Excel格式题库导入模板', downloadCount: 89, createdAt: '2026-05-08 14:30:00' },
    { id: 3, name: '学生操作指南', type: 'doc', size: '1.2 MB', description: '学生端操作指南文档', downloadCount: 256, createdAt: '2026-05-05 09:15:00' },
    { id: 4, name: '教师培训PPT', type: 'ppt', size: '5.8 MB', description: '教师端功能培训材料', downloadCount: 67, createdAt: '2026-05-01 16:45:00' },
    { id: 5, name: 'API接口文档', type: 'pdf', size: '3.1 MB', description: '后端API接口完整文档', downloadCount: 45, createdAt: '2026-04-28 11:20:00' }
  ]
}

function getFileColor(type: string) {
  const colors: Record<string, string> = {
    pdf: '#F56C6C',
    doc: '#409EFF',
    xls: '#67C23A',
    ppt: '#E6A23C',
    other: '#909399'
  }
  return colors[type] || '#909399'
}

function handleFileChange(file: any) {
  docForm.value.file = file.raw
  if (!docForm.value.name) {
    docForm.value.name = file.name
  }
}

function downloadDocument(doc: Document) {
  doc.downloadCount++
  ElMessage.success(`开始下载：${doc.name}`)
  // Mock download - in real app would trigger file download
}

function editDocument(doc: Document) {
  isEditing.value = true
  docForm.value = { ...doc }
  showUploadDialog.value = true
}

async function deleteDocument(doc: Document) {
  await ElMessageBox.confirm('确定删除该文档吗？', '提示', { type: 'warning' })
  const idx = documents.value.findIndex(d => d.id === doc.id)
  if (idx !== -1) {
    documents.value.splice(idx, 1)
    ElMessage.success('删除成功')
  }
}

function saveDocument() {
  if (!docForm.value.name) {
    ElMessage.warning('请输入文档名称')
    return
  }

  if (isEditing.value) {
    // Update existing
    const idx = documents.value.findIndex(d => d.id === docForm.value.id)
    if (idx !== -1) {
      documents.value[idx] = { ...documents.value[idx], ...docForm.value }
    }
    ElMessage.success('更新成功')
  } else {
    // Add new
    const newDoc: Document = {
      id: Date.now(),
      name: docForm.value.name || '',
      type: docForm.value.type || 'pdf',
      size: docForm.value.file ? (docForm.value.file.size / 1024 / 1024).toFixed(1) + ' MB' : '0 MB',
      description: docForm.value.description || '',
      downloadCount: 0,
      createdAt: new Date().toLocaleString('zh-CN')
    }
    documents.value.unshift(newDoc)
    ElMessage.success('上传成功')
  }

  showUploadDialog.value = false
  isEditing.value = false
  docForm.value = { name: '', type: 'pdf', description: '', size: '', downloadCount: 0 }
}

onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; }
.search-input { max-width: 300px; }
.filter-select { width: 150px; }
.doc-name { display: flex; align-items: center; gap: 8px; }
</style>
