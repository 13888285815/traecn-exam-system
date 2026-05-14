<template>
  <div class="course-list-page">
    <!-- ==================== 课程卡片网格 ==================== -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" v-for="course in pagedCourses" :key="course.id">
        <el-card shadow="hover" class="course-card" @click="$router.push(`/course/${course.id}`)">
          <div class="course-cover">
            <el-icon :size="48" color="#4A6CF7"><VideoPlay /></el-icon>
          </div>
          <div class="course-info">
            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-desc">{{ course.description }}</p>
            <div class="course-meta">
              <span><el-icon><User /></el-icon> {{ course.teacherName }}</span>
              <span><el-icon><Collection /></el-icon> {{ course.chapterCount }} 章节</span>
            </div>
            <div class="course-bottom">
              <div class="course-price">
                <span class="price-current">&yen;{{ course.price }}</span>
                <span class="price-original">&yen;{{ course.originalPrice }}</span>
              </div>
              <el-button type="primary" size="small" @click.stop="$router.push(`/course/${course.id}`)">
                查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ==================== 空状态 ==================== -->
    <el-empty v-if="mockCourses.length === 0" description="暂无课程" />

    <!-- ==================== 分页 ==================== -->
    <div class="pagination-wrap" v-if="mockCourses.length > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="mockCourses.length"
        layout="prev, pager, next, jumper"
        background
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VideoPlay, User, Collection } from '@element-plus/icons-vue'
import { mockCourses } from '../../data/mockData'

const currentPage = ref(1)
const pageSize = 9

const pagedCourses = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return mockCourses.slice(start, start + pageSize)
})
</script>

<style scoped>
.course-list-page {
  max-width: 100%;
}

/* ==================== 课程卡片 ==================== */
.course-card {
  cursor: pointer;
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.course-card:hover {
  transform: translateY(-4px);
}

.course-cover {
  height: 160px;
  background: linear-gradient(135deg, #EEF2FF, #E8ECFF);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.course-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
}

.course-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.course-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-current {
  font-size: 20px;
  font-weight: 700;
  color: #F56C6C;
}

.price-original {
  font-size: 13px;
  color: #C0C4CC;
  text-decoration: line-through;
}

/* ==================== 分页 ==================== */
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
