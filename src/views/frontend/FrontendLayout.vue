<template>
  <div class="frontend-layout">
    <!-- ==================== 页眉区域 ==================== -->
    <header class="header">
      <div class="header-inner">
        <!-- 左侧 Logo + 站名 -->
        <div class="header-left">
          <router-link to="/" class="logo-link">
            <el-icon :size="28" color="#4A6CF7"><Document /></el-icon>
            <span class="site-name">云南意念科技</span>
          </router-link>
        </div>

        <!-- 中间 搜索区域 -->
        <div class="header-center">
          <el-select
            v-model="searchCategory"
            placeholder="学科分类"
            clearable
            style="width: 140px"
            size="default"
          >
            <el-option
              v-for="cat in categories"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
            />
          </el-select>
          <el-input
            v-model="searchKeyword"
            placeholder="请输入关键词搜索试题、试卷..."
            clearable
            size="default"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <el-button type="primary" size="default" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button size="default" @click="openAdminBackend">
            <el-icon><Setting /></el-icon>
            后台管理
          </el-button>
        </div>

        <!-- 右侧 用户区域 -->
        <div class="header-right">
          <template v-if="authStore.isLoggedIn">
            <el-dropdown trigger="click" @command="handleUserCommand">
              <span class="user-dropdown-link">
                <el-avatar :size="32" class="user-avatar">
                  {{ authStore.userName?.charAt(0) || 'U' }}
                </el-avatar>
                <span class="user-name">{{ authStore.userName }}</span>
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="password">
                    <el-icon><Lock /></el-icon>修改密码
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" plain @click="$router.push('/login')">登录</el-button>
            <el-button type="primary" @click="$router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </header>

    <!-- ==================== 菜单导航区域 ==================== -->
    <nav class="main-nav">
      <div class="nav-inner">
        <el-menu
          mode="horizontal"
          :default-active="activeNav"
          :ellipsis="false"
          class="nav-menu"
          @select="handleNavSelect"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>首页
          </el-menu-item>
          <el-menu-item index="/question">
            <el-icon><Collection /></el-icon>专业题库
          </el-menu-item>
          <el-menu-item index="/question/upload">
            <el-icon><Upload /></el-icon>上传题库
          </el-menu-item>
          <el-menu-item index="/exam">
            <el-icon><EditPen /></el-icon>在线考试
          </el-menu-item>
          <el-menu-item index="/course">
            <el-icon><Document /></el-icon>文档下载
          </el-menu-item>
          <el-menu-item index="/question/search">
            <el-icon><Search /></el-icon>搜索试题
          </el-menu-item>
          <el-menu-item index="/shop">
            <el-icon><ShoppingCart /></el-icon>商城交易
          </el-menu-item>
          <el-menu-item index="/member">
            <el-icon><CreditCard /></el-icon>开通会员
          </el-menu-item>
          <el-sub-menu index="app-download">
            <template #title>
              <el-icon><Download /></el-icon>APP下载
            </template>
            <el-menu-item index="/app/personal">个人版</el-menu-item>
            <el-menu-item index="/app/enterprise">企业版</el-menu-item>
            <el-menu-item index="/app/desktop">电脑版</el-menu-item>
            <el-menu-item index="/app/mobile">手机版</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
    </nav>

    <!-- ==================== 主内容区域 ==================== -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- ==================== 页脚区域 ==================== -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-columns">
          <!-- 快速导航 -->
          <div class="footer-column">
            <h4>快速导航</h4>
            <ul>
              <li><router-link to="/question/upload">上传题库</router-link></li>
              <li><router-link to="/exam">在线考试</router-link></li>
              <li><router-link to="/paper/online">在线组卷</router-link></li>
              <li><router-link to="/question/search">搜题服务</router-link></li>
              <li><router-link to="/user/records">成绩查询</router-link></li>
              <li><router-link to="/shop">价格套餐</router-link></li>
            </ul>
          </div>

          <!-- 客户服务 -->
          <div class="footer-column">
            <h4>客户服务</h4>
            <ul>
              <li><a href="javascript:;">入驻合作</a></li>
              <li><a href="javascript:;">用户协议</a></li>
              <li><a href="javascript:;">隐私政策</a></li>
            </ul>
          </div>

          <!-- 关于我们 -->
          <div class="footer-column">
            <h4>关于我们</h4>
            <ul>
              <li><a href="javascript:;">教程</a></li>
              <li><a href="javascript:;">版本</a></li>
              <li><a href="javascript:;">二维码</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>Copyright &copy; {{ currentYear }} 云南意念科技有限公司 版权所有</p>
          <p>ICP备案号：滇ICP备16007314号-1 | <a href="https://tools.yndxw.com" target="_blank" style="color:inherit;text-decoration:underline">tools.yndxw.com</a></p>
        </div>
      </div>
    </footer>

    <!-- ==================== 右侧悬浮区域 ==================== -->
    <div class="floating-sidebar">
      <el-tooltip content="客服在线咨询" placement="left">
        <div class="floating-btn" @click="openContact('chat')">
          <el-icon :size="22"><ChatDotRound /></el-icon>
        </div>
      </el-tooltip>
      <el-tooltip content="微信扫码咨询" placement="left">
        <div class="floating-btn" @click="openContact('wechat')">
          <el-icon :size="22"><Cellphone /></el-icon>
        </div>
      </el-tooltip>
      <el-tooltip content="官网咨询" placement="left">
        <div class="floating-btn" @click="openContact('phone')">
          <el-icon :size="22"><Phone /></el-icon>
        </div>
      </el-tooltip>
    </div>

    <!-- ==================== 联系方式弹窗 ==================== -->
    <el-dialog
      v-model="contactDialogVisible"
      :title="contactDialogTitle"
      width="400px"
      align-center
    >
      <div class="contact-dialog-content">
        <!-- 客服在线咨询 -->
        <div v-if="contactType === 'chat'" class="contact-info">
          <el-icon :size="48" color="#4A6CF7"><ChatDotRound /></el-icon>
          <p class="contact-desc">工作时间：周一至周五 9:00-18:00</p>
          <p class="contact-desc">在线客服将为您解答各类问题</p>
          <el-button type="primary" size="large" style="width: 100%; margin-top: 16px">
            开始咨询
          </el-button>
        </div>

        <!-- 微信扫码咨询 -->
        <div v-if="contactType === 'wechat'" class="contact-info">
          <div class="qr-placeholder">
            <el-icon :size="64" color="#4A6CF7"><Cellphone /></el-icon>
            <p>微信二维码</p>
          </div>
          <p class="contact-desc">扫描二维码添加微信客服</p>
        </div>

        <!-- 官网咨询 -->
        <div v-if="contactType === 'phone'" class="contact-info">
          <el-icon :size="48" color="#4A6CF7"><Phone /></el-icon>
          <p class="contact-desc">官方网址</p>
          <p class="contact-phone" style="font-size:18px">tools.yndxw.com</p>
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
  Search,
  ArrowDown,
  User,
  Lock,
  SwitchButton,
  HomeFilled,
  Collection,
  Upload,
  EditPen,
  ShoppingCart,
  CreditCard,
  Download,
  ChatDotRound,
  Cellphone,
  Phone,
  Setting
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// ---- 搜索 ----
const searchKeyword = ref('')
const searchCategory = ref('')
const categories = ref([
  { label: '全部学科', value: '' },
  { label: '计算机', value: 'computer' },
  { label: '数学', value: 'math' },
  { label: '英语', value: 'english' },
  { label: '物理', value: 'physics' },
  { label: '化学', value: 'chemistry' },
  { label: '法律', value: 'law' },
  { label: '医学', value: 'medical' },
  { label: '经济', value: 'economics' }
])

function handleSearch() {
  const query: Record<string, string> = {}
  if (searchKeyword.value) query.keyword = searchKeyword.value
  if (searchCategory.value) query.category = searchCategory.value
  router.push({ path: '/question', query })
}

function openAdminBackend() {
  window.open('/admin.html', '_blank')
}

// ---- 导航 ----
const activeNav = computed(() => {
  const path = route.path
  if (path === '/') return '/'
  if (path.startsWith('/question')) return '/question'
  if (path.startsWith('/exam')) return '/exam'
  if (path.startsWith('/course')) return '/course'
  if (path.startsWith('/shop')) return '/shop'
  if (path.startsWith('/member')) return '/member'
  return ''
})

function handleNavSelect(index: string) {
  router.push(index)
}

// ---- 用户下拉菜单 ----
function handleUserCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/user')
      break
    case 'password':
      router.push('/user/password')
      break
    case 'logout':
      authStore.logout()
      router.push('/')
      break
  }
}

// ---- 右侧悬浮 ----
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

// ---- 页脚年份 ----
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
/* ==================== 全局布局 ==================== */
.frontend-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

/* ==================== 页眉 ==================== */
.header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.site-name {
  font-size: 20px;
  font-weight: 700;
  color: #4A6CF7;
  white-space: nowrap;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 560px;
  margin: 0 32px;
}

.search-input {
  flex: 1;
}

.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #333;
  font-size: 14px;
}

.user-dropdown-link:hover {
  color: #4A6CF7;
}

.user-avatar {
  background-color: #4A6CF7;
  color: #fff;
  font-size: 14px;
}

.user-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==================== 导航 ==================== */
.main-nav {
  background: #fff;
  border-bottom: 2px solid #4A6CF7;
}

.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.nav-menu {
  border-bottom: none !important;
}

.nav-menu .el-menu-item,
.nav-menu :deep(.el-sub-menu__title) {
  font-size: 14px;
  height: 48px;
  line-height: 48px;
}

.nav-menu .el-menu-item.is-active {
  color: #4A6CF7;
  border-bottom-color: #4A6CF7;
  font-weight: 600;
}

.nav-menu .el-menu-item:hover,
.nav-menu :deep(.el-sub-menu__title:hover) {
  color: #4A6CF7;
  background-color: #f0f4ff;
}

/* ==================== 主内容 ==================== */
.main-content {
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  min-height: 400px;
}

/* ==================== 页脚 ==================== */
.footer {
  background-color: #f5f5f5;
  border-top: 1px solid #e8e8e8;
  margin-top: auto;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 24px 20px;
}

.footer-columns {
  display: flex;
  justify-content: space-between;
  gap: 48px;
  padding-bottom: 32px;
  border-bottom: 1px solid #ddd;
}

.footer-column h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.footer-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-column ul li {
  margin-bottom: 10px;
}

.footer-column ul li a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-column ul li a:hover {
  color: #4A6CF7;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
}

.footer-bottom p {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}

/* ==================== 右侧悬浮 ==================== */
.floating-sidebar {
  position: fixed;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.floating-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #4A6CF7;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(74, 108, 247, 0.4);
  transition: all 0.3s;
}

.floating-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 20px rgba(74, 108, 247, 0.6);
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
