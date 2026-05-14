<template>
  <div class="shop-page">
    <!-- ==================== 会员套餐 ==================== -->
    <section class="membership-section">
      <h2 class="section-title">会员套餐</h2>
      <p class="section-subtitle">选择适合您的套餐，解锁更多功能</p>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="8" v-for="plan in membershipPlans" :key="plan.name">
          <el-card
            shadow="hover"
            class="plan-card"
            :class="{ 'plan-popular': plan.popular }"
          >
            <div v-if="plan.popular" class="popular-badge">最受欢迎</div>
            <div class="plan-header">
              <h3>{{ plan.name }}</h3>
              <div class="plan-price">
                <span class="price-amount">&yen;{{ plan.price }}</span>
                <span class="price-period">/ {{ plan.period }}</span>
              </div>
            </div>
            <el-divider />
            <div class="plan-features">
              <div v-for="feature in plan.features" :key="feature" class="plan-feature">
                <el-icon color="#67C23A"><CircleCheck /></el-icon>
                <span>{{ feature }}</span>
              </div>
            </div>
            <el-button
              :type="plan.popular ? 'primary' : 'default'"
              size="large"
              class="plan-btn"
              @click="handlePurchase(plan.name)"
            >
              {{ plan.btnText }}
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- ==================== 热门题库推荐 ==================== -->
    <section class="recommend-section">
      <div class="section-header">
        <h2 class="section-title">热门题库推荐</h2>
        <el-button type="primary" link @click="$router.push('/question')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="bank in mockQuestionBanks.slice(0, 3)" :key="bank.id">
          <el-card shadow="hover" class="recommend-card" @click="$router.push(`/question/${bank.id}`)">
            <div class="recommend-icon">
              <el-icon :size="36" color="#4A6CF7"><Collection /></el-icon>
            </div>
            <h3>{{ bank.name }}</h3>
            <p>{{ bank.description }}</p>
            <div class="recommend-meta">
              <span>{{ bank.questionCount }} 题</span>
              <el-tag size="small" type="success">免费</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <!-- ==================== 热门课程推荐 ==================== -->
    <section class="recommend-section">
      <div class="section-header">
        <h2 class="section-title">热门课程推荐</h2>
        <el-button type="primary" link @click="$router.push('/course')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="course in mockCourses" :key="course.id">
          <el-card shadow="hover" class="recommend-card" @click="$router.push(`/course/${course.id}`)">
            <div class="recommend-icon">
              <el-icon :size="36" color="#67C23A"><VideoPlay /></el-icon>
            </div>
            <h3>{{ course.title }}</h3>
            <p>{{ course.description }}</p>
            <div class="recommend-meta">
              <span class="price-small">&yen;{{ course.price }}</span>
              <span class="price-original-small">&yen;{{ course.originalPrice }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { CircleCheck, ArrowRight, Collection, VideoPlay } from '@element-plus/icons-vue'
import { mockQuestionBanks, mockCourses } from '../../data/mockData'

// ---- 会员套餐 ----
const membershipPlans = [
  {
    name: '免费版',
    price: 0,
    period: '永久',
    popular: false,
    btnText: '免费使用',
    features: [
      '基础题库浏览',
      '每日 10 次练习',
      '基础考试功能',
      '社区问答'
    ]
  },
  {
    name: 'VIP版',
    price: 29,
    period: '月',
    popular: true,
    btnText: '立即开通',
    features: [
      '全部题库无限练习',
      'AI 智能解析',
      '错题本高级功能',
      '模拟考试不限次',
      '优先客服支持',
      '学习数据分析'
    ]
  },
  {
    name: 'SVIP版',
    price: 199,
    period: '年',
    popular: false,
    btnText: '立即开通',
    features: [
      'VIP 全部功能',
      '专属学习计划',
      '企业级题库访问',
      '一对一辅导',
      '离线下载',
      '多设备同步',
      '专属客服通道'
    ]
  }
]

// ---- 操作 ----
function handlePurchase(planName: string) {
  if (planName === '免费版') {
    ElMessage.info('您当前已使用免费版')
  } else {
    ElMessage.success(`正在跳转到 ${planName} 支付页面...`)
  }
}
</script>

<style scoped>
.shop-page {
  max-width: 100%;
}

/* ==================== 通用 ==================== */
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

/* ==================== 会员套餐 ==================== */
.membership-section {
  margin-bottom: 48px;
}

.plan-card {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  transition: transform 0.3s;
  overflow: visible;
}

.plan-card:hover {
  transform: translateY(-4px);
}

.plan-popular {
  border: 2px solid #4A6CF7;
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #4A6CF7, #6B8AFF);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 16px;
  border-radius: 12px;
  white-space: nowrap;
}

.plan-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 12px;
}

.plan-price {
  margin-bottom: 8px;
}

.price-amount {
  font-size: 36px;
  font-weight: 700;
  color: #4A6CF7;
}

.price-period {
  font-size: 14px;
  color: #909399;
}

.plan-features {
  text-align: left;
  margin-bottom: 24px;
}

.plan-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: #606266;
}

.plan-btn {
  width: 100%;
}

/* ==================== 推荐 ==================== */
.recommend-section {
  margin-bottom: 48px;
}

.recommend-card {
  cursor: pointer;
  margin-bottom: 16px;
  transition: transform 0.3s;
}

.recommend-card:hover {
  transform: translateY(-4px);
}

.recommend-icon {
  width: 56px;
  height: 56px;
  background: #F5F7FA;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.recommend-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.recommend-card p {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommend-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #606266;
}

.price-small {
  font-size: 18px;
  font-weight: 700;
  color: #F56C6C;
}

.price-original-small {
  font-size: 13px;
  color: #C0C4CC;
  text-decoration: line-through;
}
</style>
