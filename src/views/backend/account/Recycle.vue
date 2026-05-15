<template>
  <div class="page-container">
    <div class="page-header">
      <h2>回收站</h2>
      <p class="page-desc">查看已删除的内容，支持恢复或彻底删除</p>
      <el-button type="danger" plain :disabled="selectedIds.length === 0" @click="batchDestroy">
        彻底删除
      </el-button>
    </div>

    <div class="page-content">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索名称..."
          clearable
          class="search-input"
          @clear="loadRecycled"
          @keyup.enter="loadRecycled"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterCategory" placeholder="内容类型" clearable class="filter-select">
          <el-option label="全部" value="" />
          <el-option label="题库" value="question_bank" />
          <el-option label="试卷" value="exam_paper" />
          <el-option label="文章" value="article" />
          <el-option label="视频" value="video" />
        </el-select>
      </div>

      <!-- 回收站列表 -->
      <el-table
        :data="filteredItems"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column prop="name" label="名称" min-width="200" />
        <el-table-column prop="category" label="类型" width="110">
          <template #default="{ row }">
            <el-tag>{{ categoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deletedBy" label="删除人" width="120" />
        <el-table-column prop="deletedAt" label="删除时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="success" link @click="restoreItem(row)">
              <el-icon><RefreshLeft /></el-icon>恢复
            </el-button>
            <el-button size="small" type="danger" link @click="destroyItem(row)">
              <el-icon><Delete /></el-icon>彻底删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="filteredItems.length === 0" description="回收站为空" />

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </div>

    <!-- 彻底删除确认 -->
    <el-dialog v-model="showDestroyDialog" title="彻底删除" width="400px">
      <span>彻底删除后数据将无法恢复，确认继续？</span>
      <template #footer>
        <el-button @click="showDestroyDialog = false">取消</el-button>
        <el-button type="danger" @click="confirmDestroy">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshLeft, Delete } from '@element-plus/icons-vue'

interface RecycleItem {
  id: number
  name: string
  category: 'question_bank' | 'exam_paper' | 'article' | 'video'
  deletedBy: string
  deletedAt: string
}

const searchKeyword = ref('')
const filterCategory = ref('')
const showDestroyDialog = ref(false)
const pendingDestroyIds = ref<number[]>([])
const selectedIds = ref<number[]>([])

const pagination = reactive({ page: 1, size: 10, total: 0 })

const items = ref<RecycleItem[]>([
  { id: 1, name: '数据结构基础题库', category: 'question_bank', deletedBy: '张三', deletedAt: '2026-05-14 10:30:00' },
  { id: 2, name: '2025年秋季期中考试卷', category: 'exam_paper', deletedBy: '李四', deletedAt: '2026-05-13 16:20:00' },
  { id: 3, name: '操作系统知识点总结', category: 'article', deletedBy: '张三', deletedAt: '2026-05-12 09:45:00' },
  { id: 4, name: '计算机网络精讲视频', category: 'video', deletedBy: '王五', deletedAt: '2026-05-11 14:00:00' },
  { id: 5, name: 'Python入门题库', category: 'question_bank', deletedBy: '张三', deletedAt: '2026-05-10 11:10:00' },
  { id: 6, name: '2026年模拟考试卷（一）', category: 'exam_paper', deletedBy: '李四', deletedAt: '2026-05-09 08:30:00' },
])

pagination.total = items.value.length

const filteredItems = computed(() => {
  let result = items.value
  if (searchKeyword.value) {
    result = result.filter(i => i.name.includes(searchKeyword.value))
  }
  if (filterCategory.value) {
    result = result.filter(i => i.category === filterCategory.value)
  }
  return result
})

function categoryLabel(cat: string) {
  return { question_bank: '题库', exam_paper: '试卷', article: '文章', video: '视频' }[cat] || cat
}

function loadRecycled() { /* placeholder for API call */ }

function handleSelectionChange(val: RecycleItem[]) {
  selectedIds.value = val.map(i => i.id)
}

async function restoreItem(item: RecycleItem) {
  await ElMessageBox.confirm(`确认恢复「${item.name}」？`, '提示', { type: 'info' })
  const idx = items.value.findIndex(i => i.id === item.id)
  if (idx !== -1) {
    items.value.splice(idx, 1)
    pagination.total = items.value.length
    ElMessage.success('恢复成功')
  }
}

async function destroyItem(item: RecycleItem) {
  pendingDestroyIds.value = [item.id]
  showDestroyDialog.value = true
}

async function batchDestroy() {
  if (selectedIds.value.length === 0) return
  await ElMessageBox.confirm(`确认彻底删除选中的 ${selectedIds.value.length} 项？此操作不可恢复！`, '警告', { type: 'warning' })
  items.value = items.value.filter(i => !selectedIds.value.includes(i.id))
  selectedIds.value = []
  pagination.total = items.value.length
  ElMessage.success('彻底删除成功')
}

async function confirmDestroy() {
  items.value = items.value.filter(i => !pendingDestroyIds.value.includes(i.id))
  pendingDestroyIds.value = []
  showDestroyDialog.value = false
  pagination.total = items.value.length
  ElMessage.success('彻底删除成功')
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; }
.search-input { max-width: 300px; }
.filter-select { width: 150px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
