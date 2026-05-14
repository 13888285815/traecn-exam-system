<template>
  <div class="question-list-page">
    <!-- ==================== 筛选栏 ==================== -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="学科分类">
          <el-select v-model="filters.category" placeholder="全部分类" clearable style="width: 160px">
            <el-option
              v-for="cat in categories"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="filters.difficulty" placeholder="全部难度" clearable style="width: 140px">
            <el-option label="简单" :value="1" />
            <el-option label="较易" :value="2" />
            <el-option label="中等" :value="3" />
            <el-option label="较难" :value="4" />
            <el-option label="困难" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-select v-model="filters.sort" placeholder="默认排序" style="width: 140px">
            <el-option label="最新" value="newest" />
            <el-option label="最热" value="popular" />
            <el-option label="评分最高" value="rating" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ==================== 搜索结果统计 ==================== -->
    <div class="result-stats">
      <span>共 <strong>{{ filteredBanks.length }}</strong> 个题库</span>
    </div>

    <!-- ==================== 题库卡片网格 ==================== -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" v-for="bank in pagedBanks" :key="bank.id">
        <el-card shadow="hover" class="bank-card" @click="$router.push(`/question/${bank.id}`)">
          <div class="bank-cover">
            <el-icon :size="48" color="#4A6CF7"><Collection /></el-icon>
          </div>
          <div class="bank-info">
            <h3 class="bank-name">{{ bank.name }}</h3>
            <p class="bank-desc">{{ bank.description }}</p>
            <div class="bank-tags">
              <el-tag size="small" type="primary">{{ bank.name }}</el-tag>
            </div>
            <div class="bank-meta">
              <span><el-icon><Document /></el-icon> {{ bank.questionCount }} 题</span>
              <span class="bank-rating">
                <el-rate
                  :model-value="getRating(bank.id)"
                  disabled
                  show-score
                  text-color="#E6A23C"
                  score-template="{value}"
                />
              </span>
            </div>
            <div class="bank-bottom">
              <span class="price-free">免费</span>
              <el-button type="primary" size="small" @click.stop="$router.push(`/question/${bank.id}`)">
                查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ==================== 空状态 ==================== -->
    <el-empty v-if="filteredBanks.length === 0" description="暂无匹配的题库" />

    <!-- ==================== 分页 ==================== -->
    <div class="pagination-wrap" v-if="filteredBanks.length > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredBanks.length"
        layout="prev, pager, next, jumper"
        background
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Collection, Document } from '@element-plus/icons-vue'
import { mockQuestionBanks } from '../../data/mockData'

// ---- 学科分类（14个） ----
const categories = [
  { label: '计算机', value: '计算机基础' },
  { label: '数学', value: '数学题库' },
  { label: '英语', value: '英语题库' },
  { label: '物理', value: '物理题库' },
  { label: '化学', value: '化学' },
  { label: '生物', value: '生物' },
  { label: '历史', value: '历史' },
  { label: '地理', value: '地理' },
  { label: '政治', value: '政治' },
  { label: '法律', value: '法律' },
  { label: '医学', value: '医学' },
  { label: '经济', value: '经济' },
  { label: '管理', value: '管理' },
  { label: '综合', value: '综合知识' }
]

// ---- 筛选条件 ----
const filters = ref({
  category: '',
  difficulty: '' as number | string,
  sort: 'newest'
})

const currentPage = ref(1)
const pageSize = 9

// ---- 筛选与排序 ----
const filteredBanks = computed(() => {
  let list = [...mockQuestionBanks]

  if (filters.value.category) {
    list = list.filter(b => b.name === filters.value.category)
  }

  switch (filters.value.sort) {
    case 'newest':
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'popular':
      list.sort((a, b) => b.questionCount - a.questionCount)
      break
    case 'rating':
      list.sort((a, b) => getRating(b.id) - getRating(a.id))
      break
  }

  return list
})

// ---- 分页 ----
const pagedBanks = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredBanks.value.slice(start, start + pageSize)
})

// ---- 评分 ----
function getRating(id: number): number {
  return parseFloat((4 + id * 0.1).toFixed(1))
}

// ---- 操作 ----
function handleFilter() {
  currentPage.value = 1
}

function resetFilter() {
  filters.value = { category: '', difficulty: '', sort: 'newest' }
  currentPage.value = 1
}
</script>

<style scoped>
.question-list-page {
  max-width: 100%;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.result-stats {
  margin-bottom: 20px;
  font-size: 14px;
  color: #606266;
}

.result-stats strong {
  color: #4A6CF7;
  font-size: 16px;
}

/* ==================== 题库卡片 ==================== */
.bank-card {
  cursor: pointer;
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.bank-card:hover {
  transform: translateY(-4px);
}

.bank-cover {
  height: 140px;
  background: linear-gradient(135deg, #EEF2FF, #E8ECFF);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.bank-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.bank-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bank-tags {
  margin-bottom: 12px;
}

.bank-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
}

.bank-meta > span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bank-rating :deep(.el-rate) {
  height: 20px;
}

.bank-rating :deep(.el-rate__icon) {
  font-size: 14px;
  margin-right: 2px;
}

.bank-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-free {
  font-size: 18px;
  font-weight: 700;
  color: #67C23A;
}

/* ==================== 分页 ==================== */
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
