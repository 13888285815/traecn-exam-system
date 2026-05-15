<template>
  <div class="page-container">
    <div class="page-header">
      <h2>相册管理</h2>
      <p class="page-desc">管理企业相册，上传、查看和删除企业活动照片</p>
    </div>
    <div class="page-content">
      <div class="search-bar">
        <el-input v-model="searchKeyword" placeholder="搜索相册名称..." clearable style="width: 240px" @input="handleSearch">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterTag" placeholder="选择标签" clearable style="width: 160px" @change="handleSearch">
          <el-option v-for="t in tags" :key="t" :label="t" :value="t" />
        </el-select>
        <el-button type="primary" @click="handleUploadDialog">
          <el-icon><Plus /></el-icon>上传图片
        </el-button>
      </div>

      <!-- 图片网格 -->
      <div v-loading="loading" class="album-grid">
        <div v-for="item in filteredList" :key="item.id" class="album-item" @click="handlePreview(item)">
          <div class="album-img">
            <el-image :src="item.url" fit="cover" class="album-image" :preview-src-list="[item.url]" />
            <div class="album-overlay">
              <el-icon @click.stop="handleDelete(item)"><Delete /></el-icon>
            </div>
          </div>
          <div class="album-info">
            <p class="album-name">{{ item.name }}</p>
            <p class="album-meta">{{ item.tag }} · {{ item.createdAt }}</p>
          </div>
        </div>
        <div v-if="filteredList.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无图片，请上传" />
        </div>
      </div>
    </div>

    <!-- 上传弹窗 -->
    <el-dialog v-model="uploadVisible" title="上传图片" width="480px">
      <el-form :model="uploadForm" label-width="90px">
        <el-form-item label="图片名称">
          <el-input v-model="uploadForm.name" placeholder="请输入图片名称" />
        </el-form-item>
        <el-form-item label="所属标签">
          <el-select v-model="uploadForm.tag" placeholder="请选择标签" style="width: 100%">
            <el-option v-for="t in tags" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="uploadForm.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="上传图片">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            :on-change="handleFileChange"
            class="upload-trigger"
          >
            <div v-if="!uploadForm.url" class="upload-placeholder">
              <el-icon :size="40" color="#C0C4CC"><UploadFilled /></el-icon>
              <p>点击选择图片</p>
            </div>
            <el-image v-else :src="uploadForm.url" fit="cover" class="upload-preview" />
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitUpload" :loading="uploading">确定上传</el-button>
      </template>
    </el-dialog>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="700px">
      <el-image :src="previewItem?.url" fit="contain" style="width: 100%; height: 400px" />
      <div style="padding: 12px 0; color: #606266;">
        <p><strong>名称：</strong>{{ previewItem?.name }}</p>
        <p><strong>标签：</strong>{{ previewItem?.tag }}</p>
        <p><strong>描述：</strong>{{ previewItem?.description || '无' }}</p>
        <p><strong>上传时间：</strong>{{ previewItem?.createdAt }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Delete, UploadFilled } from '@element-plus/icons-vue'

interface AlbumItem {
  id: number
  name: string
  tag: string
  url: string
  description: string
  createdAt: string
}

const tags = ['企业活动', '团队建设', '培训现场', '会议', '其他']
const loading = ref(false)
const uploading = ref(false)
const searchKeyword = ref('')
const filterTag = ref('')
const uploadVisible = ref(false)
const previewVisible = ref(false)
const previewItem = ref<AlbumItem | null>(null)

const list = ref<AlbumItem[]>([])
const filteredList = computed(() => {
  return list.value.filter(item => {
    const matchKeyword = !searchKeyword.value || item.name.includes(searchKeyword.value)
    const matchTag = !filterTag.value || item.tag === filterTag.value
    return matchKeyword && matchTag
  })
})

const uploadForm = reactive({ name: '', tag: '', description: '', url: '' })
const uploadRef = ref()

const handleSearch = () => {}
const handleUploadDialog = () => {
  Object.assign(uploadForm, { name: '', tag: '', description: '', url: '' })
  uploadVisible.value = true
}
const handleFileChange = (file: any) => {
  const url = URL.createObjectURL(file.raw)
  uploadForm.url = url
  if (!uploadForm.name) uploadForm.name = file.name.replace(/\.[^.]+$/, '')
}
const handleSubmitUpload = () => {
  if (!uploadForm.name) { ElMessage.warning('请输入图片名称'); return }
  if (!uploadForm.url) { ElMessage.warning('请选择图片'); return }
  uploading.value = true
  setTimeout(() => {
    list.value.unshift({ id: Date.now(), ...uploadForm, createdAt: new Date().toLocaleString('zh-CN') })
    uploading.value = false
    uploadVisible.value = false
    ElMessage.success('上传成功')
  }, 600)
}
const handleDelete = (item: AlbumItem) => {
  list.value = list.value.filter(i => i.id !== item.id)
  ElMessage.success('删除成功')
}
const handlePreview = (item: AlbumItem) => {
  previewItem.value = item
  previewVisible.value = true
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    list.value = [
      { id: 1, name: '2026年度年会盛典', tag: '企业活动', url: 'https://picsum.photos/seed/album1/400/300', description: '公司2026年度总结大会暨年会庆典', createdAt: '2026-01-20 18:00:00' },
      { id: 2, name: '户外拓展训练', tag: '团队建设', url: 'https://picsum.photos/seed/album2/400/300', description: '春季户外拓展，增强团队凝聚力', createdAt: '2026-03-15 09:00:00' },
      { id: 3, name: '安全生产培训现场', tag: '培训现场', url: 'https://picsum.photos/seed/album3/400/300', description: '安全生产知识培训实操现场', createdAt: '2026-02-10 14:00:00' },
      { id: 4, name: 'Q1战略会议', tag: '会议', url: 'https://picsum.photos/seed/album4/400/300', description: '第一季度战略规划会议', createdAt: '2026-03-01 10:00:00' },
      { id: 5, name: '新员工欢迎会', tag: '企业活动', url: 'https://picsum.photos/seed/album5/400/300', description: '欢迎新入职员工', createdAt: '2026-02-20 15:00:00' },
      { id: 6, name: '端午节团建', tag: '团队建设', url: 'https://picsum.photos/seed/album6/400/300', description: '端午节主题团队建设活动', createdAt: '2026-05-05 09:00:00' }
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
.album-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 20px; }
.album-item { background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #EBEEF5; cursor: pointer; transition: box-shadow 0.2s; }
.album-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
.album-img { position: relative; height: 160px; overflow: hidden; }
.album-image { width: 100%; height: 100%; display: block; }
.album-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
.album-img:hover .album-overlay { opacity: 1; }
.album-overlay .el-icon { color: #fff; font-size: 24px; cursor: pointer; }
.album-info { padding: 10px 12px; }
.album-name { margin: 0 0 4px; font-size: 14px; font-weight: 500; color: #303133; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.album-meta { margin: 0; font-size: 12px; color: #909399; }
.empty-state { grid-column: 1 / -1; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 120px; border: 1px dashed #DCDFE6; border-radius: 6px; cursor: pointer; color: #909399; }
.upload-placeholder p { margin: 8px 0 0; font-size: 13px; }
.upload-preview { width: 100%; height: 120px; border-radius: 6px; }
</style>
