<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的错题</h2>
      <p class="page-desc">查看您在练习和考试中做错的题目，支持分类筛选和重新练习</p>
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
      <el-button type="primary" @click="handlePracticeAll" :disabled="!filteredWrong.length">
        <el-icon><RefreshRight /></el-icon>全部重新练习
      </el-button>
    </div>

    <!-- 错题统计 -->
    <div class="stats-bar">
      <el-tag type="danger" size="large">共 {{ filteredWrong.length }} 道错题</el-tag>
      <el-tag type="warning" size="large">单选题 {{ filteredWrong.filter(w => w.type === 'single').length }} 道</el-tag>
      <el-tag type="info" size="large">多选题 {{ filteredWrong.filter(w => w.type === 'multiple').length }} 道</el-tag>
    </div>

    <!-- 错题列表 -->
    <div class="wrong-list">
      <div v-for="item in filteredWrong" :key="item.id" class="wrong-item">
        <div class="wrong-item-header">
          <el-tag :type="typeTagType(item.type)" size="small">{{ typeText(item.type) }}</el-tag>
          <el-tag size="small" type="info">{{ item.category }}</el-tag>
          <span class="wrong-time">{{ item.wrongTime }}</span>
        </div>
        <div class="wrong-content">
          <p class="question-text">{{ item.content }}</p>
          <div class="answer-compare">
            <div class="answer-item your-answer">
              <span class="answer-label">你的答案：</span>
              <span class="answer-value wrong">{{ item.yourAnswer }}</span>
            </div>
            <div class="answer-item correct-answer">
              <span class="answer-label">正确答案：</span>
              <span class="answer-value correct">{{ item.correctAnswer }}</span>
            </div>
          </div>
          <div class="wrong-item-actions">
            <el-button size="small" type="primary" @click="handlePractice(item)">
              <el-icon><RefreshRight /></el-icon>重新练习
            </el-button>
            <el-button size="small" type="warning" @click="handleRemove(item)">
              <el-icon><Delete /></el-icon>移出错题本
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!filteredWrong.length" description="暂无错题，继续保持！" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshRight, Delete } from '@element-plus/icons-vue'

const filterCategory = ref('')
const filterType = ref('')

const categories = [
  { label: '计算机基础', value: '计算机基础' },
  { label: '数据结构', value: '数据结构' },
  { label: '操作系统', value: '操作系统' },
  { label: '计算机网络', value: '计算机网络' },
  { label: '数据库原理', value: '数据库原理' }
]

const mockWrongQuestions = ref([
  { id: 1, content: 'TCP协议工作在OSI模型的哪一层？', type: 'single', category: '计算机网络', yourAnswer: 'B. 数据链路层', correctAnswer: 'C. 传输层', wrongTime: '2026-05-10 14:30' },
  { id: 2, content: '以下哪些是面向对象编程的特征？（多选）', type: 'multiple', category: '计算机基础', yourAnswer: 'A, B', correctAnswer: 'A, B, C, D', wrongTime: '2026-05-10 14:25' },
  { id: 3, content: '进程和线程的主要区别是什么？', type: 'essay', category: '操作系统', yourAnswer: '进程是资源分配的基本单位，线程是CPU调度的基本单位', correctAnswer: '进程是资源分配的基本单位，线程是CPU调度的基本单位，同一进程的线程共享进程资源，但线程有自己的栈和寄存器', wrongTime: '2026-05-09 16:00' },
  { id: 4, content: '二叉搜索树的中序遍历结果是？', type: 'single', category: '数据结构', yourAnswer: 'A. 降序序列', correctAnswer: 'B. 升序序列', wrongTime: '2026-05-09 11:20' },
  { id: 5, content: 'SQL中用于删除表中数据但保留表结构的语句是？', type: 'fill', category: '数据库原理', yourAnswer: 'DROP TABLE', correctAnswer: 'DELETE FROM / TRUNCATE TABLE', wrongTime: '2026-05-08 09:45' },
  { id: 6, content: 'HTTP协议默认使用的端口号是80。', type: 'judge', category: '计算机网络', yourAnswer: '错误', correctAnswer: '正确', wrongTime: '2026-05-08 08:30' }
])

const filteredWrong = computed(() => {
  let list = mockWrongQuestions.value
  if (filterCategory.value) {
    list = list.filter(item => item.category === filterCategory.value)
  }
  if (filterType.value) {
    list = list.filter(item => item.type === filterType.value)
  }
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
  ElMessage.success(`开始重新练习：${item.content.substring(0, 20)}...`)
}

function handlePracticeAll() {
  ElMessage.success(`开始重新练习全部 ${filteredWrong.value.length} 道错题`)
}

function handleRemove(item: any) {
  ElMessageBox.confirm('确定将该题目移出错题本吗？', '确认移出', { type: 'warning' })
    .then(() => {
      const idx = mockWrongQuestions.value.findIndex(q => q.id === item.id)
      if (idx > -1) mockWrongQuestions.value.splice(idx, 1)
      ElMessage.success('已移出错题本')
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
.wrong-list { display: flex; flex-direction: column; gap: 12px; }
.wrong-item {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;
}
.wrong-item:hover { box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }
.wrong-item-header { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
.wrong-time { margin-left: auto; color: #c0c4cc; font-size: 12px; }
.question-text { font-size: 15px; color: #303133; margin: 0 0 12px; line-height: 1.6; }
.answer-compare { display: flex; gap: 24px; margin-bottom: 12px; flex-wrap: wrap; }
.answer-item { display: flex; align-items: center; gap: 8px; }
.answer-label { color: #909399; font-size: 13px; }
.answer-value { font-size: 14px; font-weight: 500; }
.answer-value.wrong { color: #F56C6C; text-decoration: line-through; }
.answer-value.correct { color: #67C23A; }
.wrong-item-actions { display: flex; gap: 8px; }
</style>
