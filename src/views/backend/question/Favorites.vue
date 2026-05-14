<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的收藏</h2>
      <p class="page-desc">查看您收藏的题目，方便后续复习和练习</p>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filterCategory" placeholder="全部分类" clearable style="width: 160px">
        <el-option v-for="cat in categories" :key="cat.value" :label="cat.label" :value="cat.value" />
      </el-select>
      <el-select v-model="filterType" placeholder="全部题型" clearable style="width: 140px">
        <el-option label="单选题" value="single" />
        <el-option label="多选题" value="multiple" />
        <el-option label="判断题" value="judge" />
        <el-option label="填空题" value="fill" />
        <el-option label="简答题" value="essay" />
      </el-select>
      <el-input v-model="searchKeyword" placeholder="搜索题目内容..." clearable style="width: 260px" prefix-icon="Search" />
    </div>

    <!-- 收藏统计 -->
    <div class="stats-bar">
      <el-tag type="primary" size="large">共 {{ filteredFavorites.length }} 道收藏题目</el-tag>
    </div>

    <!-- 收藏列表 -->
    <div class="favorite-list">
      <div v-for="item in filteredFavorites" :key="item.id" class="favorite-item">
        <div class="favorite-item-header">
          <el-tag :type="typeTagType(item.type)" size="small">{{ typeText(item.type) }}</el-tag>
          <el-tag size="small" type="info">{{ item.category }}</el-tag>
          <span class="favorite-time">收藏于 {{ item.favoritedAt }}</span>
        </div>
        <div class="favorite-content">
          <p class="question-text">{{ item.content }}</p>
          <div class="correct-answer">
            <span class="answer-label">正确答案：</span>
            <span class="answer-value">{{ item.answer }}</span>
          </div>
          <div class="favorite-item-actions">
            <el-button size="small" type="primary" @click="handlePractice(item)">
              <el-icon><EditPen /></el-icon>去练习
            </el-button>
            <el-button size="small" type="danger" @click="handleUnfavorite(item)">
              <el-icon><StarFilled /></el-icon>取消收藏
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-if="!filteredFavorites.length" description="暂无收藏题目" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, StarFilled } from '@element-plus/icons-vue'

const filterCategory = ref('')
const filterType = ref('')
const searchKeyword = ref('')

const categories = [
  { label: '计算机基础', value: '计算机基础' },
  { label: '数据结构', value: '数据结构' },
  { label: '操作系统', value: '操作系统' },
  { label: '计算机网络', value: '计算机网络' },
  { label: '数据库原理', value: '数据库原理' }
]

const mockFavorites = ref([
  { id: 1, content: 'TCP三次握手的过程是什么？', type: 'essay', category: '计算机网络', answer: 'SYN -> SYN+ACK -> ACK', favoritedAt: '2026-05-12 10:30' },
  { id: 2, content: '快速排序的平均时间复杂度是？', type: 'single', category: '数据结构', answer: 'O(n log n)', favoritedAt: '2026-05-11 15:20' },
  { id: 3, content: '以下哪些属于非易失性存储器？（多选）', type: 'multiple', category: '操作系统', answer: 'A, C, D（硬盘、SSD、光盘）', favoritedAt: '2026-05-10 09:00' },
  { id: 4, content: '数据库事务的ACID特性包括原子性、一致性、隔离性和持久性。', type: 'judge', category: '数据库原理', answer: '正确', favoritedAt: '2026-05-09 14:15' },
  { id: 5, content: 'IPv4地址由____位二进制数组成。', type: 'fill', category: '计算机网络', answer: '32', favoritedAt: '2026-05-08 11:40' }
])

const filteredFavorites = computed(() => {
  let list = mockFavorites.value
  if (filterCategory.value) list = list.filter(item => item.category === filterCategory.value)
  if (filterType.value) list = list.filter(item => item.type === filterType.value)
  if (searchKeyword.value) list = list.filter(item => item.content.includes(searchKeyword.value))
  return list
})

function typeText(type: string) {
  const map: Record<string, string> = { single: '单选题', multiple: '多选题', judge: '判断题', fill: '填空题', essay: '简答题' }
  return map[type] || type
}
function typeTagType(type: string) {
  const map: Record<string, string> = { single: '', multiple: 'success', judge: 'warning', fill: 'info', essay: 'danger' }
  return map[type] || ''
}

function handlePractice(item: any) {
  ElMessage.success(`开始练习：${item.content.substring(0, 20)}...`)
}

function handleUnfavorite(item: any) {
  ElMessageBox.confirm('确定取消收藏该题目吗？', '确认取消', { type: 'warning' })
    .then(() => {
      const idx = mockFavorites.value.findIndex(q => q.id === item.id)
      if (idx > -1) mockFavorites.value.splice(idx, 1)
      ElMessage.success('已取消收藏')
    })
    .catch(() => {})
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.filter-bar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.stats-bar { display: flex; gap: 8px; margin-bottom: 16px; }
.favorite-list { display: flex; flex-direction: column; gap: 12px; }
.favorite-item {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;
}
.favorite-item:hover { box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }
.favorite-item-header { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
.favorite-time { margin-left: auto; color: #c0c4cc; font-size: 12px; }
.question-text { font-size: 15px; color: #303133; margin: 0 0 12px; line-height: 1.6; }
.correct-answer { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.answer-label { color: #909399; font-size: 13px; }
.answer-value { font-size: 14px; font-weight: 500; color: #67C23A; }
.favorite-item-actions { display: flex; gap: 8px; }
</style>
