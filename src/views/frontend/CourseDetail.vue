<template>
  <div class="course-detail-page" v-if="course">
    <!-- ==================== 课程信息头部 ==================== -->
    <el-card shadow="never" class="course-header">
      <div class="header-content">
        <div class="course-cover">
          <el-icon :size="64" color="#4A6CF7"><VideoPlay /></el-icon>
        </div>
        <div class="course-info">
          <h1 class="course-title">{{ course.title }}</h1>
          <p class="course-desc">{{ course.description }}</p>
          <div class="course-meta">
            <span><el-icon><User /></el-icon> 讲师：{{ course.teacherName }}</span>
            <span><el-icon><Collection /></el-icon> {{ course.chapterCount }} 章节</span>
            <span><el-icon><Clock /></el-icon> {{ formatDuration(course.duration) }}</span>
            <span><el-icon><UserFilled /></el-icon> {{ course.studentCount }} 人学习</span>
          </div>
          <div class="course-price-row">
            <span class="price-current">&yen;{{ course.price }}</span>
            <span class="price-original">&yen;{{ course.originalPrice }}</span>
            <el-tag type="danger" size="small" v-if="course.price < course.originalPrice">
              {{ discount }} 折
            </el-tag>
          </div>
          <div class="course-actions">
            <el-button type="primary" size="large" @click="startLearning">
              <el-icon><VideoPlay /></el-icon> 开始学习
            </el-button>
            <el-button size="large" @click="handleFavorite">
              <el-icon><Star /></el-icon> 收藏课程
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- ==================== 章节目录 ==================== -->
    <el-card shadow="never" class="chapter-card">
      <template #header>
        <div class="card-header">
          <h2>章节目录</h2>
          <el-tag>共 {{ chapters.length }} 章</el-tag>
        </div>
      </template>
      <el-collapse v-model="activeChapters">
        <el-collapse-item
          v-for="(chapter, ci) in chapters"
          :key="ci"
          :title="`第 ${ci + 1} 章：${chapter.title}`"
          :name="ci"
        >
          <div class="lesson-list">
            <div v-for="(lesson, li) in chapter.lessons" :key="li" class="lesson-item">
              <el-icon color="#4A6CF7"><VideoCameraFilled /></el-icon>
              <span class="lesson-title">{{ lesson.title }}</span>
              <el-tag size="small" type="info">{{ lessonTypeMap[lesson.type] }}</el-tag>
              <span class="lesson-duration">{{ formatDuration(lesson.duration) }}</span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>

  <div v-else class="loading-wrap">
    <el-empty description="课程不存在" />
    <el-button type="primary" @click="$router.push('/course')">返回课程列表</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { VideoPlay, User, Collection, Clock, UserFilled, Star, VideoCameraFilled } from '@element-plus/icons-vue'
import { mockCourses } from '../../data/mockData'

const route = useRoute()
const router = useRouter()

// ---- 课程信息 ----
const course = computed(() => {
  const id = Number(route.params.id)
  return mockCourses.find(c => c.id === id)
})

// ---- 模拟章节数据 ----
const chapters = computed(() => {
  if (!course.value) return []
  const count = course.value.chapterCount
  const result = []
  for (let i = 1; i <= Math.min(count, 12); i++) {
    result.push({
      title: `第 ${i} 章内容`,
      lessons: [
        { title: `${i}.1 课程导入`, type: 'video' as const, duration: 600 + i * 60 },
        { title: `${i}.2 核心知识点讲解`, type: 'video' as const, duration: 1200 + i * 120 },
        { title: `${i}.3 课后练习`, type: 'text' as const, duration: 300 }
      ]
    })
  }
  return result
})

const activeChapters = ref<number[]>([0])

// ---- 类型映射 ----
const lessonTypeMap: Record<string, string> = {
  video: '视频',
  text: '图文',
  doc: '文档'
}

// ---- 折扣 ----
const discount = computed(() => {
  if (!course.value) return 10
  return Math.round((course.value.price / course.value.originalPrice) * 10)
})

// ---- 格式化时长 ----
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h} 小时 ${m} 分钟`
  return `${m} 分钟`
}

// ---- 操作 ----
function startLearning() {
  ElMessage.success('开始学习！')
}

function handleFavorite() {
  ElMessage.success('已收藏课程')
}
</script>

<style scoped>
.course-detail-page {
  max-width: 100%;
}

/* ==================== 头部 ==================== */
.course-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  gap: 32px;
}

.course-cover {
  width: 280px;
  height: 200px;
  background: linear-gradient(135deg, #EEF2FF, #E8ECFF);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.course-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 12px;
}

.course-desc {
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
  margin-bottom: 16px;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 16px;
}

.course-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
}

.price-current {
  font-size: 28px;
  font-weight: 700;
  color: #F56C6C;
}

.price-original {
  font-size: 16px;
  color: #C0C4CC;
  text-decoration: line-through;
}

.course-actions {
  display: flex;
  gap: 12px;
}

/* ==================== 章节目录 ==================== */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.lesson-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.lesson-item:hover {
  background: #F5F7FA;
}

.lesson-title {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.lesson-duration {
  font-size: 13px;
  color: #C0C4CC;
}

.loading-wrap {
  text-align: center;
  padding: 80px 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
  }

  .course-cover {
    width: 100%;
    height: 180px;
  }
}
</style>
