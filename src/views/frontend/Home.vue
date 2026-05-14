<template>
  <div class="home-page">
    <!-- ==================== 轮播横幅区域 ==================== -->
    <section class="banner-section">
      <el-carousel height="360px" :interval="4000" arrow="always">
        <el-carousel-item v-for="item in bannerItems" :key="item.title">
          <div class="banner-slide" :style="{ background: item.bg }">
            <div class="banner-content">
              <h1 class="banner-title">{{ item.title }}</h1>
              <p class="banner-desc">{{ item.desc }}</p>
              <el-button type="primary" size="large" round @click="$router.push(item.link)">
                {{ item.btnText }}
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- ==================== 功能特性区域 ==================== -->
    <section class="features-section">
      <h2 class="section-title">平台特性</h2>
      <p class="section-subtitle">全方位助力您的学习与考试</p>
      <el-row :gutter="24">
        <el-col :xs="12" :sm="12" :md="6" v-for="feature in features" :key="feature.title">
          <el-card shadow="hover" class="feature-card">
            <div class="feature-icon" :style="{ background: feature.bg }">
              <el-icon :size="32" :color="feature.color">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- ==================== 热门题库区域 ==================== -->
    <section class="banks-section">
      <div class="section-header">
        <h2 class="section-title">热门题库</h2>
        <el-button type="primary" link @click="$router.push('/question')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="bank in mockQuestionBanks" :key="bank.id">
          <el-card shadow="hover" class="bank-card" @click="$router.push(`/question/${bank.id}`)">
            <div class="bank-cover">
              <el-icon :size="48" color="#4A6CF7"><Collection /></el-icon>
            </div>
            <div class="bank-info">
              <h3 class="bank-name">{{ bank.name }}</h3>
              <p class="bank-desc">{{ bank.description }}</p>
              <div class="bank-meta">
                <span><el-icon><Document /></el-icon> {{ bank.questionCount }} 题</span>
                <span class="bank-rating">
                  <el-icon color="#E6A23C"><Star /></el-icon> {{ (4 + bank.id * 0.1).toFixed(1) }}
                </span>
              </div>
              <div class="bank-price">
                <span class="price-free">免费</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- ==================== 热门考试区域 ==================== -->
    <section class="exams-section">
      <div class="section-header">
        <h2 class="section-title">热门考试</h2>
        <el-button type="primary" link @click="$router.push('/exam')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="exam in publishedExams" :key="exam.id">
          <el-card shadow="hover" class="exam-card" @click="$router.push(`/exam/${exam.id}`)">
            <div class="exam-info">
              <h3 class="exam-title">{{ exam.title }}</h3>
              <p class="exam-desc">{{ exam.description }}</p>
              <div class="exam-meta">
                <el-tag type="info" size="small">{{ exam.bankName }}</el-tag>
                <span><el-icon><Clock /></el-icon> {{ exam.duration }}分钟</span>
                <span><el-icon><Trophy /></el-icon> {{ exam.totalScore }}分</span>
              </div>
              <el-button type="primary" size="small" class="exam-btn" @click.stop="$router.push(`/exam/${exam.id}`)">
                查看详情
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- ==================== 新功能试用区域 ==================== -->
    <section class="new-features-section">
      <h2 class="section-title">新功能试用</h2>
      <p class="section-subtitle">AI 赋能，让学习更高效</p>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" v-for="feat in newFeatures" :key="feat.title">
          <el-card shadow="hover" class="new-feature-card">
            <div class="new-feature-icon" :style="{ background: feat.bg }">
              <el-icon :size="36" color="#fff">
                <component :is="feat.icon" />
              </el-icon>
            </div>
            <div class="new-feature-content">
              <h3>{{ feat.title }}</h3>
              <p>{{ feat.desc }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- ==================== 免费试用区域 ==================== -->
    <section class="trial-section">
      <div class="trial-card">
        <h2>免费试用</h2>
        <p>留下您的联系方式，即可获得 7 天 VIP 免费体验资格</p>
        <el-form :model="trialForm" inline class="trial-form" @submit.prevent="handleTrial">
          <el-form-item>
            <el-input v-model="trialForm.contact" placeholder="请输入手机号或邮箱" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="default" @click="handleTrial">立即申请</el-button>
          </el-form-item>
        </el-form>
      </div>
    </section>

    <!-- ==================== 用户捐助区域 ==================== -->
    <section class="donate-section">
      <el-card shadow="never" class="donate-card">
        <h2>支持我们</h2>
        <p>本项目为开源项目，如果您觉得我们的平台对您有帮助，欢迎捐助支持我们的持续开发与维护。</p>
        <div class="donate-ways">
          <div class="donate-way">
            <el-icon :size="32" color="#4A6CF7"><Wallet /></el-icon>
            <span>微信捐助</span>
          </div>
          <div class="donate-way">
            <el-icon :size="32" color="#67C23A"><Wallet /></el-icon>
            <span>支付宝捐助</span>
          </div>
        </div>
        <p class="donate-note">每一份支持都是我们前进的动力，感谢您的慷慨！</p>
      </el-card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Collection, Document, Star, ArrowRight, Clock, Trophy,
  EditPen, TrendCharts, Notebook, MagicStick, Upload, Wallet
} from '@element-plus/icons-vue'
import { mockQuestionBanks, mockExamPapers } from '../../data/mockData'

// ---- 轮播数据 ----
const bannerItems = [
  {
    title: '海量题库，智能刷题',
    desc: '涵盖计算机、数学、英语、物理等多个学科，数十万道精选试题，支持多种练习模式',
    btnText: '开始刷题',
    link: '/question',
    bg: 'linear-gradient(135deg, #4A6CF7 0%, #6B8AFF 100%)'
  },
  {
    title: '在线考试，实时评分',
    desc: '支持单选、多选、判断、填空、问答等多种题型，自动评分，实时查看结果',
    btnText: '参加考试',
    link: '/exam',
    bg: 'linear-gradient(135deg, #67C23A 0%, #85CE61 100%)'
  },
  {
    title: '企业培训，高效管理',
    desc: '为企业提供一站式培训考试解决方案，支持员工管理、培训任务、数据分析',
    btnText: '了解更多',
    link: '/shop',
    bg: 'linear-gradient(135deg, #E6A23C 0%, #F0C78A 100%)'
  }
]

// ---- 功能特性 ----
const features = [
  {
    title: '丰富题库',
    desc: '涵盖多个学科领域，持续更新，满足各类考试需求。',
    icon: Collection,
    color: '#4A6CF7',
    bg: '#EEF2FF'
  },
  {
    title: '实时评分',
    desc: '客观题自动评分，主观题智能辅助，即时获取考试结果。',
    icon: TrendCharts,
    color: '#67C23A',
    bg: '#F0F9EB'
  },
  {
    title: '错题记录',
    desc: '自动收录错题，支持分类复习，精准攻克薄弱环节。',
    icon: Notebook,
    color: '#E6A23C',
    bg: '#FDF6EC'
  },
  {
    title: 'AI智能解析',
    desc: 'AI驱动的题目解析，深入剖析知识点，助力理解与记忆。',
    icon: MagicStick,
    color: '#F56C6C',
    bg: '#FEF0F0'
  }
]

// ---- 新功能 ----
const newFeatures = [
  {
    title: 'AI 智能导题',
    desc: '通过 AI 自动识别文档内容，一键导入题目，大幅减少手动录入工作量。',
    icon: Upload,
    bg: 'linear-gradient(135deg, #4A6CF7, #6B8AFF)'
  },
  {
    title: 'AI 智能解析',
    desc: '每道题目配备 AI 生成的详细解析，帮助理解解题思路与相关知识点。',
    icon: MagicStick,
    bg: 'linear-gradient(135deg, #67C23A, #85CE61)'
  }
]

// ---- 已发布考试 ----
const publishedExams = computed(() =>
  mockExamPapers.filter(e => e.status === 'published')
)

// ---- 免费试用表单 ----
const trialForm = ref({ contact: '' })

function handleTrial() {
  if (!trialForm.value.contact.trim()) {
    ElMessage.warning('请输入手机号或邮箱')
    return
  }
  ElMessage.success('申请已提交，我们将尽快与您联系！')
  trialForm.value.contact = ''
}
</script>

<style scoped>
.home-page {
  max-width: 100%;
}

/* ==================== 轮播 ==================== */
.banner-section {
  margin: -24px -24px 32px;
  border-radius: 12px;
  overflow: hidden;
}

.banner-slide {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.banner-content {
  text-align: center;
  max-width: 600px;
  padding: 0 24px;
}

.banner-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.banner-desc {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 28px;
  line-height: 1.6;
}

/* ==================== 通用 Section ==================== */
.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
}

.section-subtitle {
  font-size: 14px;
  color: #909399;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-header .section-title {
  margin-bottom: 0;
}

/* ==================== 功能特性 ==================== */
.features-section {
  margin-bottom: 48px;
}

.feature-card {
  text-align: center;
  padding: 8px;
  margin-bottom: 16px;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.feature-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.feature-card p {
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
}

/* ==================== 热门题库 ==================== */
.banks-section {
  margin-bottom: 48px;
}

.bank-card {
  cursor: pointer;
  margin-bottom: 16px;
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

.bank-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.bank-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bank-rating {
  color: #E6A23C !important;
}

.price-free {
  font-size: 16px;
  font-weight: 700;
  color: #67C23A;
}

/* ==================== 热门考试 ==================== */
.exams-section {
  margin-bottom: 48px;
}

.exam-card {
  cursor: pointer;
  margin-bottom: 16px;
  transition: transform 0.3s;
}

.exam-card:hover {
  transform: translateY(-4px);
}

.exam-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.exam-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.exam-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.exam-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.exam-btn {
  width: 100%;
}

/* ==================== 新功能 ==================== */
.new-features-section {
  margin-bottom: 48px;
}

.new-feature-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 16px;
  padding: 20px;
}

.new-feature-icon {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.new-feature-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.new-feature-content p {
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
}

/* ==================== 免费试用 ==================== */
.trial-section {
  margin-bottom: 48px;
}

.trial-card {
  background: linear-gradient(135deg, #4A6CF7 0%, #6B8AFF 100%);
  border-radius: 12px;
  padding: 48px 32px;
  text-align: center;
  color: #fff;
}

.trial-card h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
}

.trial-card p {
  font-size: 15px;
  opacity: 0.9;
  margin-bottom: 24px;
}

.trial-form {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.trial-form .el-input {
  width: 300px;
}

/* ==================== 捐助 ==================== */
.donate-section {
  margin-bottom: 32px;
}

.donate-card {
  text-align: center;
  background: #FAFAFA;
  border: 1px dashed #DCDFE6;
}

.donate-card h2 {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.donate-card > p {
  font-size: 14px;
  color: #909399;
  margin-bottom: 24px;
  line-height: 1.6;
}

.donate-ways {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-bottom: 24px;
}

.donate-way {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.donate-note {
  font-size: 13px;
  color: #C0C4CC;
}
</style>
