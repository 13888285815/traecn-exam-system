<template>
  <div class="backend-layout">
    <!-- ==================== 顶部页眉 ==================== -->
    <header class="backend-header">
      <div class="header-left">
        <el-icon
          class="collapse-btn"
          :size="20"
          @click="isSidebarCollapsed = !isSidebarCollapsed"
        >
          <Fold v-if="!isSidebarCollapsed" />
          <Expand v-else />
        </el-icon>
        <el-icon :size="24" color="#4A6CF7"><Document /></el-icon>
        <span class="header-title">云南意念科技 管理后台</span>
      </div>

      <div class="header-center">
        <el-button size="small" @click="$router.push('/admin/paper/create')">
          <el-icon><Plus /></el-icon>新增试卷
        </el-button>
        <el-button size="small" @click="$router.push('/admin/question/my')">
          <el-icon><Collection /></el-icon>题库管理
        </el-button>
        <el-button size="small" @click="$router.push('/admin/enterprise/exam')">
          <el-icon><EditPen /></el-icon>考试管理
        </el-button>
        <el-button size="small" @click="$router.push('/admin/enterprise/staff')">
          <el-icon><User /></el-icon>用户管理
        </el-button>
      </div>

      <div class="header-right">
        <el-badge :value="3" :max="99" class="notification-badge">
          <el-icon :size="20" class="notification-icon"><Bell /></el-icon>
        </el-badge>
        <el-dropdown trigger="click" @command="handleUserCommand">
          <span class="admin-user-info">
            <el-avatar :size="30" class="admin-avatar">
              {{ authStore.userName?.charAt(0) || 'A' }}
            </el-avatar>
            <span class="admin-user-name">{{ authStore.userName || '管理员' }}</span>
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="password">
                <el-icon><Lock /></el-icon>修改密码
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>退出系统
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- ==================== 主体区域 ==================== -->
    <div class="backend-body">
      <!-- 左侧侧边栏 -->
      <aside
        class="backend-sidebar"
        :class="{ 'is-collapsed': isSidebarCollapsed }"
      >
        <el-scrollbar>
          <el-menu
            :default-active="activeMenu"
            :collapse="isSidebarCollapsed"
            :collapse-transition="true"
            background-color="#304156"
            text-color="#bfcbd9"
            active-text-color="#4A6CF7"
            router
          >
            <!-- 题库管理 -->
            <el-sub-menu index="question">
              <template #title>
                <el-icon><Collection /></el-icon>
                <span>题库管理</span>
              </template>
              <el-menu-item index="/admin/question/my">我的题库</el-menu-item>
              <el-menu-item index="/admin/question/wrong">我的错题</el-menu-item>
              <el-menu-item index="/admin/question/favorite">我的收藏题</el-menu-item>
              <el-menu-item index="/admin/question/record">练习记录</el-menu-item>
              <el-menu-item index="/admin/question/ai-import">AI导题</el-menu-item>
              <el-menu-item index="/admin/question/smart-analysis">智能解析</el-menu-item>
            </el-sub-menu>

            <!-- 试卷管理 -->
            <el-sub-menu index="paper">
              <template #title>
                <el-icon><EditPen /></el-icon>
                <span>试卷管理</span>
              </template>
              <el-menu-item index="/admin/paper/create">新增试卷</el-menu-item>
              <el-menu-item index="/admin/paper/history">考试历史</el-menu-item>
              <el-menu-item index="/admin/paper/online">在线组卷</el-menu-item>
            </el-sub-menu>

            <!-- 我的群组 -->
            <el-sub-menu index="group">
              <template #title>
                <el-icon><UserFilled /></el-icon>
                <span>我的群组</span>
              </template>
              <el-menu-item index="/admin/group/created">我创建的群组</el-menu-item>
              <el-menu-item index="/admin/group/joined">我加入的群组</el-menu-item>
            </el-sub-menu>

            <!-- 企业管理 -->
            <el-sub-menu index="enterprise">
              <template #title>
                <el-icon><OfficeBuilding /></el-icon>
                <span>企业管理</span>
              </template>
              <el-menu-item index="/admin/enterprise/info">企业介绍</el-menu-item>
              <el-menu-item index="/admin/enterprise/cert">企业认证</el-menu-item>
              <el-menu-item index="/admin/enterprise/course">课程管理</el-menu-item>
              <el-menu-item index="/admin/enterprise/campus">校区管理</el-menu-item>
              <el-menu-item index="/admin/enterprise/teacher">老师管理</el-menu-item>
              <el-menu-item index="/admin/enterprise/album">相册管理</el-menu-item>
              <el-menu-item index="/admin/enterprise/page">自定义页面</el-menu-item>
              <el-menu-item index="/admin/enterprise/message">消息中心</el-menu-item>
              <el-menu-item index="/admin/enterprise/log">学员登录日志</el-menu-item>
              <el-menu-item index="/admin/enterprise/operate">操作日志</el-menu-item>
              <el-menu-item index="/admin/enterprise/account">企业账户</el-menu-item>
              <el-menu-item index="/admin/enterprise/resource">学习资源</el-menu-item>
              <el-menu-item index="/admin/enterprise/task">培训任务</el-menu-item>
              <el-menu-item index="/admin/enterprise/exam">考试管理</el-menu-item>
              <el-menu-item index="/admin/enterprise/staff">人员管理</el-menu-item>
              <el-menu-item index="/admin/enterprise/notice">公告</el-menu-item>
              <el-menu-item index="/admin/enterprise/survey">问卷</el-menu-item>
              <el-menu-item index="/admin/enterprise/news">新闻中心</el-menu-item>
            </el-sub-menu>

            <!-- 账户管理 -->
            <el-sub-menu index="account">
              <template #title>
                <el-icon><Avatar /></el-icon>
                <span>账户管理</span>
              </template>
              <el-menu-item index="/admin/account/info">账户信息</el-menu-item>
              <el-menu-item index="/admin/account/order">我的订单</el-menu-item>
              <el-menu-item index="/admin/account/invoice">我的发票</el-menu-item>
              <el-menu-item index="/admin/account/sell">题库出售</el-menu-item>
              <el-menu-item index="/admin/account/report">试题报错</el-menu-item>
              <el-menu-item index="/admin/account/message">消息中心</el-menu-item>
              <el-menu-item index="/admin/account/subscribe">订阅服务</el-menu-item>
              <el-menu-item index="/admin/account/reward">领取奖励</el-menu-item>
              <el-menu-item index="/admin/account/download">文档下载</el-menu-item>
              <el-menu-item index="/admin/account/recycle">回收站</el-menu-item>
            </el-sub-menu>

            <!-- 系统设置 -->
            <el-sub-menu index="settings">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>系统设置</span>
              </template>
              <el-menu-item index="/admin/settings/enterprise">企业设置</el-menu-item>
              <el-menu-item index="/admin/settings/member">会员设置</el-menu-item>
              <el-menu-item index="/admin/settings/group">群组设置</el-menu-item>
              <el-menu-item index="/admin/settings/permission">权限设置</el-menu-item>
              <el-menu-item index="/admin/settings/backup">备份和恢复</el-menu-item>
              <el-menu-item index="/admin/settings/cache">缓存清理</el-menu-item>
              <el-menu-item index="/admin/settings/miniapp">小程序设置</el-menu-item>
              <el-menu-item index="/admin/settings/mp">公众号设置</el-menu-item>
              <el-menu-item index="/admin/settings/api">接口设置</el-menu-item>
              <el-menu-item index="/admin/settings/token">Token设置</el-menu-item>
            </el-sub-menu>

            <!-- 控制中心 -->
            <el-sub-menu index="control">
              <template #title>
                <el-icon><Monitor /></el-icon>
                <span>控制中心</span>
              </template>
              <el-menu-item index="/admin/control/chart">图表控制台</el-menu-item>
              <el-menu-item index="/admin/control/warning">预警控制台</el-menu-item>
              <el-menu-item index="/admin/control/schedule">调度控制</el-menu-item>
              <el-menu-item index="/admin/control/security">安全漏洞修复</el-menu-item>
            </el-sub-menu>

            <!-- 帮助支持 -->
            <el-sub-menu index="help">
              <template #title>
                <el-icon><QuestionFilled /></el-icon>
                <span>帮助支持</span>
              </template>
              <el-menu-item index="/admin/help/tutorial">帮助教程</el-menu-item>
              <el-menu-item index="/admin/help/feedback">意见反馈</el-menu-item>
              <el-menu-item index="/admin/help/app">APP下载</el-menu-item>
              <el-menu-item index="/admin/help/version">版本控制</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </aside>

      <!-- 中间主内容区 -->
      <div class="backend-main" :class="{ 'panel-open': isRightPanelOpen }">
        <!-- 面包屑导航 -->
        <div class="breadcrumb-bar">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
          <el-icon
            class="panel-toggle-btn"
            :size="18"
            @click="isRightPanelOpen = !isRightPanelOpen"
          >
            <DArrowRight v-if="!isRightPanelOpen" />
            <DArrowLeft v-else />
          </el-icon>
        </div>

        <!-- 页面内容 -->
        <div class="page-content">
          <router-view />
        </div>
      </div>

      <!-- 右侧面板 -->
      <aside
        class="backend-right-panel"
        :class="{ 'is-visible': isRightPanelOpen }"
      >
        <el-scrollbar>
          <div class="panel-section">
            <div class="panel-header">
              <h3>工作台</h3>
              <el-icon class="panel-close" @click="isRightPanelOpen = false"><Close /></el-icon>
            </div>

            <!-- 重要提示 -->
            <div class="panel-card notice-card">
              <el-icon color="#E6A23C"><WarningFilled /></el-icon>
              <span>重要提示：请及时完成企业认证，享受更多功能权限。</span>
            </div>

            <!-- 订阅到期提醒 -->
            <div class="panel-card warning-card" v-if="showExpiryWarning">
              <el-icon color="#F56C6C"><Bell /></el-icon>
              <span>您的会员将于 {{ expiryDate }} 到期，请及时续费。</span>
            </div>

            <!-- 登录入口 -->
            <div class="panel-card entry-card">
              <div class="entry-item" @click="$router.push('/')">
                <el-icon><User /></el-icon>
                <span>会员登录入口</span>
              </div>
              <div class="entry-item" @click="$router.push('/admin')">
                <el-icon><Setting /></el-icon>
                <span>管理员登录入口</span>
              </div>
            </div>

            <!-- 增值服务 -->
            <div class="panel-card service-card">
              <div class="entry-item">
                <el-icon><Coin /></el-icon>
                <span>账号增值服务</span>
              </div>
              <div class="entry-item">
                <el-icon><Top /></el-icon>
                <span>升级会员服务</span>
              </div>
            </div>

            <!-- 数据概览 -->
            <div class="panel-section-title">数据概览</div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">5</div>
                <div class="stat-label">进行中考试</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">12</div>
                <div class="stat-label">待阅卷</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">38</div>
                <div class="stat-label">题库数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">16</div>
                <div class="stat-label">课程数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">8</div>
                <div class="stat-label">任务数</div>
              </div>
            </div>

            <!-- 常用功能 -->
            <div class="panel-section-title">常用功能</div>
            <div class="quick-links">
              <div class="quick-link-item" @click="$router.push('/admin/paper/create')">
                <el-icon><Plus /></el-icon>
                <span>新增试卷</span>
              </div>
              <div class="quick-link-item" @click="$router.push('/admin/question/my')">
                <el-icon><Collection /></el-icon>
                <span>题库管理</span>
              </div>
              <div class="quick-link-item" @click="$router.push('/admin/paper/online')">
                <el-icon><Document /></el-icon>
                <span>在线组卷</span>
              </div>
              <div class="quick-link-item" @click="$router.push('/admin/enterprise/staff')">
                <el-icon><User /></el-icon>
                <span>人员管理</span>
              </div>
            </div>

            <!-- 进行中的考试 -->
            <div class="panel-section-title">进行中的考试</div>
            <div class="panel-list">
              <div class="panel-list-item" v-for="item in mockExams" :key="item.id">
                <div class="list-item-info">
                  <span class="list-item-name">{{ item.name }}</span>
                  <span class="list-item-meta">{{ item.participants }}人参加</span>
                </div>
                <el-tag size="small" type="success">进行中</el-tag>
              </div>
            </div>

            <!-- 考试统计 -->
            <div class="panel-section-title">考试情况统计</div>
            <div class="panel-list">
              <div class="panel-list-item">
                <span>本月考试总数</span>
                <span class="list-item-value">24</span>
              </div>
              <div class="panel-list-item">
                <span>平均分</span>
                <span class="list-item-value">78.5</span>
              </div>
              <div class="panel-list-item">
                <span>及格率</span>
                <span class="list-item-value">85%</span>
              </div>
            </div>

            <!-- 进行中的题库练习 -->
            <div class="panel-section-title">进行中的题库练习</div>
            <div class="panel-list">
              <div class="panel-list-item" v-for="item in mockPractices" :key="item.id">
                <div class="list-item-info">
                  <span class="list-item-name">{{ item.name }}</span>
                  <span class="list-item-meta">进度 {{ item.progress }}%</span>
                </div>
                <el-progress :percentage="item.progress" :stroke-width="6" style="width: 80px" />
              </div>
            </div>

            <!-- 练习题库情况 -->
            <div class="panel-section-title">练习题库情况</div>
            <div class="panel-list">
              <div class="panel-list-item">
                <span>总练习题数</span>
                <span class="list-item-value">1,280</span>
              </div>
              <div class="panel-list-item">
                <span>正确率</span>
                <span class="list-item-value">72%</span>
              </div>
              <div class="panel-list-item">
                <span>错题数</span>
                <span class="list-item-value">358</span>
              </div>
            </div>

            <!-- 进行中的课程学习 -->
            <div class="panel-section-title">进行中的课程学习</div>
            <div class="panel-list">
              <div class="panel-list-item" v-for="item in mockCourses" :key="item.id">
                <div class="list-item-info">
                  <span class="list-item-name">{{ item.name }}</span>
                  <span class="list-item-meta">{{ item.completedLessons }}/{{ item.totalLessons }}课时</span>
                </div>
                <el-progress :percentage="Math.round(item.completedLessons / item.totalLessons * 100)" :stroke-width="6" style="width: 80px" />
              </div>
            </div>

            <!-- 学习情况 -->
            <div class="panel-section-title">学习情况</div>
            <div class="panel-list">
              <div class="panel-list-item">
                <span>今日学习时长</span>
                <span class="list-item-value">2.5h</span>
              </div>
              <div class="panel-list-item">
                <span>本周学习时长</span>
                <span class="list-item-value">12h</span>
              </div>
              <div class="panel-list-item">
                <span>累计学习天数</span>
                <span class="list-item-value">45天</span>
              </div>
            </div>

            <!-- 用户总览 -->
            <div class="panel-section-title">用户总览</div>
            <div class="panel-list">
              <div class="panel-list-item">
                <span>总用户数</span>
                <span class="list-item-value">1,256</span>
              </div>
              <div class="panel-list-item">
                <span>今日活跃</span>
                <span class="list-item-value">328</span>
              </div>
              <div class="panel-list-item">
                <span>今日新增</span>
                <span class="list-item-value">15</span>
              </div>
            </div>

            <!-- 联系客服 -->
            <div class="panel-section-title">联系客服</div>
            <div class="contact-buttons">
              <el-button size="small" @click="openContact('chat')">
                <el-icon><ChatDotRound /></el-icon>在线咨询
              </el-button>
              <el-button size="small" @click="openContact('phone')">
                <el-icon><Phone /></el-icon>官网咨询
              </el-button>
              <el-button size="small" @click="openContact('wechat')">
                <el-icon><Cellphone /></el-icon>微信咨询
              </el-button>
            </div>
          </div>
        </el-scrollbar>
      </aside>
    </div>

    <!-- ==================== 联系方式弹窗 ==================== -->
    <el-dialog
      v-model="contactDialogVisible"
      :title="contactDialogTitle"
      width="400px"
      align-center
    >
      <div class="contact-dialog-content">
        <div v-if="contactType === 'chat'" class="contact-info">
          <el-icon :size="48" color="#4A6CF7"><ChatDotRound /></el-icon>
          <p class="contact-desc">工作时间：周一至周五 9:00-18:00</p>
          <p class="contact-desc">在线客服将为您解答各类问题</p>
          <el-button type="primary" size="large" style="width: 100%; margin-top: 16px">
            开始咨询
          </el-button>
        </div>
        <div v-if="contactType === 'wechat'" class="contact-info">
          <div class="qr-placeholder">
            <el-icon :size="64" color="#4A6CF7"><Cellphone /></el-icon>
            <p>微信二维码</p>
          </div>
          <p class="contact-desc">扫描二维码添加微信客服</p>
        </div>
        <div v-if="contactType === 'phone'" class="contact-info">
          <el-icon :size="48" color="#4A6CF7"><Phone /></el-icon>
          <p class="contact-desc">官方网址</p>
          <p class="contact-phone">tools.yndxw.com</p>
          <p class="contact-desc">工作时间：周一至周五 9:00-18:00</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import {
  Document,
  Fold,
  Expand,
  Plus,
  Collection,
  EditPen,
  User,
  Bell,
  ArrowDown,
  Lock,
  SwitchButton,
  UserFilled,
  OfficeBuilding,
  Avatar,
  Setting,
  Monitor,
  QuestionFilled,
  DArrowRight,
  DArrowLeft,
  Close,
  WarningFilled,
  Coin,
  Top,
  ChatDotRound,
  Phone,
  Cellphone
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// ---- 侧边栏折叠 ----
const isSidebarCollapsed = ref(false)

// ---- 右侧面板 ----
const isRightPanelOpen = ref(true)

// ---- 当前激活菜单 ----
const activeMenu = computed(() => route.path)

// ---- 面包屑标题 ----
const currentTitle = computed(() => {
  return (route.meta?.title as string) || ''
})

// ---- 用户下拉 ----
function handleUserCommand(command: string) {
  switch (command) {
    case 'password':
      router.push('/user/password')
      break
    case 'logout':
      authStore.logout()
      router.push('/')
      break
  }
}

// ---- 会员到期提醒 ----
const showExpiryWarning = ref(true)
const expiryDate = ref('2026-06-30')

// ---- 模拟数据 ----
const mockExams = ref([
  { id: 1, name: '2026年计算机基础期末考试', participants: 156 },
  { id: 2, name: '数据结构随堂测验', participants: 42 },
  { id: 3, name: '英语四级模拟考试', participants: 89 }
])

const mockPractices = ref([
  { id: 1, name: '计算机网络题库', progress: 65 },
  { id: 2, name: '操作系统题库', progress: 30 },
  { id: 3, name: '数据库原理题库', progress: 88 }
])

const mockCourses = ref([
  { id: 1, name: 'Vue3 从入门到精通', completedLessons: 12, totalLessons: 20 },
  { id: 2, name: 'Python 数据分析', completedLessons: 5, totalLessons: 15 }
])

// ---- 联系弹窗 ----
const contactDialogVisible = ref(false)
const contactType = ref<'chat' | 'wechat' | 'phone'>('chat')

const contactDialogTitle = computed(() => {
  const titles: Record<string, string> = {
    chat: '客服在线咨询',
    wechat: '微信扫码咨询',
    phone: '官网咨询'
  }
  return titles[contactType.value] || '联系我们'
})

function openContact(type: 'chat' | 'wechat' | 'phone') {
  contactType.value = type
  contactDialogVisible.value = true
}
</script>

<style scoped>
/* ==================== 全局布局 ==================== */
.backend-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ==================== 顶部页眉 ==================== */
.backend-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.collapse-btn {
  cursor: pointer;
  color: #606266;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.collapse-btn:hover {
  background: #f0f2f5;
  color: #4A6CF7;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge {
  cursor: pointer;
}

.notification-icon {
  color: #606266;
  cursor: pointer;
  transition: color 0.2s;
}

.notification-icon:hover {
  color: #4A6CF7;
}

.admin-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #303133;
  font-size: 14px;
}

.admin-user-info:hover {
  color: #4A6CF7;
}

.admin-avatar {
  background-color: #4A6CF7;
  color: #fff;
  font-size: 13px;
}

.admin-user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==================== 主体区域 ==================== */
.backend-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ==================== 左侧侧边栏 ==================== */
.backend-sidebar {
  width: 220px;
  background-color: #304156;
  flex-shrink: 0;
  transition: width 0.3s;
  overflow: hidden;
}

.backend-sidebar.is-collapsed {
  width: 64px;
}

.backend-sidebar .el-scrollbar {
  height: 100%;
}

.backend-sidebar .el-menu {
  border-right: none;
}

.backend-sidebar :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
}

.backend-sidebar :deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
}

.backend-sidebar :deep(.el-menu-item.is-active) {
  background-color: #263445 !important;
}

.backend-sidebar :deep(.el-sub-menu .el-menu-item) {
  padding-left: 52px !important;
  min-width: auto;
}

.backend-sidebar.is-collapsed :deep(.el-sub-menu .el-menu-item) {
  padding-left: 20px !important;
}

/* ==================== 中间主内容区 ==================== */
.backend-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  overflow: hidden;
  min-width: 0;
}

.breadcrumb-bar {
  height: 44px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
}

.panel-toggle-btn {
  cursor: pointer;
  color: #606266;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.panel-toggle-btn:hover {
  background: #f0f2f5;
  color: #4A6CF7;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* ==================== 右侧面板 ==================== */
.backend-right-panel {
  width: 0;
  background: #fff;
  border-left: 1px solid #e8e8e8;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.3s;
}

.backend-right-panel.is-visible {
  width: 300px;
}

.backend-right-panel .el-scrollbar {
  height: 100%;
}

.panel-section {
  padding: 16px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.panel-close {
  cursor: pointer;
  color: #909399;
  padding: 2px;
  border-radius: 4px;
}

.panel-close:hover {
  color: #606266;
  background: #f0f2f5;
}

.panel-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin: 16px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f2f5;
}

/* 面板卡片 */
.panel-card {
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1.5;
}

.notice-card {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.warning-card {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.entry-card,
.service-card {
  background: #f0f4ff;
  color: #4A6CF7;
  border: 1px solid #d9e2ff;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
}

.entry-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
  font-size: 13px;
}

.entry-item:hover {
  background: rgba(74, 108, 247, 0.1);
}

/* 数据概览 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat-item {
  background: #f8f9fb;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #4A6CF7;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 常用功能 */
.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.quick-link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  background: #f8f9fb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #606266;
  transition: all 0.2s;
}

.quick-link-item:hover {
  background: #eef2ff;
  color: #4A6CF7;
}

.quick-link-item .el-icon {
  font-size: 20px;
}

/* 面板列表 */
.panel-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.panel-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: #f8f9fb;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
}

.list-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.list-item-name {
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item-meta {
  font-size: 12px;
  color: #909399;
}

.list-item-value {
  font-weight: 600;
  color: #4A6CF7;
  font-size: 14px;
  flex-shrink: 0;
}

/* 联系按钮 */
.contact-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.contact-buttons .el-button {
  flex: 1;
  min-width: 80px;
}

/* ==================== 联系弹窗 ==================== */
.contact-dialog-content {
  text-align: center;
  padding: 16px 0;
}

.contact-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.contact-desc {
  font-size: 14px;
  color: #666;
  margin: 4px 0;
}

.contact-phone {
  font-size: 24px;
  font-weight: 700;
  color: #4A6CF7;
  margin: 8px 0;
}

.qr-placeholder {
  width: 160px;
  height: 160px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 8px auto;
  background: #f9f9f9;
}

.qr-placeholder p {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}
</style>
