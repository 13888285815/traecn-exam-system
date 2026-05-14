<template>
  <div class="user-center">
    <!-- 左侧个人信息卡片 -->
    <div class="user-sidebar">
      <el-card class="profile-card" shadow="hover">
        <div class="avatar-area">
          <el-avatar :size="80" :src="authStore.user?.avatar || ''">
            <el-icon :size="36"><User /></el-icon>
          </el-avatar>
        </div>
        <div class="user-info">
          <h3 class="user-name">{{ authStore.user?.name || authStore.userName || '未知用户' }}</h3>
          <el-tag size="small" :type="roleTagType">{{ roleLabel }}</el-tag>
          <div class="member-info">
            <el-tag size="small" effect="plain" :type="memberTagType">
              {{ memberLabel }}
            </el-tag>
            <span v-if="memberExpireText" class="member-expire">{{ memberExpireText }}</span>
          </div>
          <div class="register-time">
            <el-icon><Calendar /></el-icon>
            <span>注册时间：{{ authStore.user?.createdAt || '--' }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 右侧内容区 -->
    <div class="user-content">
      <el-card shadow="hover">
        <el-menu
          :default-active="activeMenu"
          class="user-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="profile">
            <span>📋 个人信息</span>
          </el-menu-item>
          <el-menu-item index="orders">
            <span>📦 我的订单</span>
          </el-menu-item>
          <el-menu-item index="banks">
            <span>📚 我的题库</span>
          </el-menu-item>
          <el-menu-item index="wrong">
            <span>❌ 我的错题</span>
          </el-menu-item>
          <el-menu-item index="favorite">
            <span>⭐ 我的收藏</span>
          </el-menu-item>
          <el-menu-item index="records">
            <span>📊 练习记录</span>
          </el-menu-item>
          <el-menu-item index="password">
            <span>🔑 修改密码</span>
          </el-menu-item>
        </el-menu>

        <div class="content-area">
          <!-- 个人信息编辑 -->
          <div v-if="activeMenu === 'profile'" class="profile-form">
            <h3 class="section-title">个人信息</h3>
            <el-form
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="100px"
              label-position="right"
            >
              <el-form-item label="用户名" prop="name">
                <el-input v-model="profileForm.name" placeholder="请输入用户名" size="large" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" placeholder="请输入邮箱" size="large" />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="profileForm.phone" placeholder="请输入手机号" size="large" />
              </el-form-item>
              <el-form-item label="头像">
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="false"
                  :auto-upload="false"
                  :on-change="handleAvatarChange"
                  accept="image/*"
                >
                  <el-avatar :size="64" :src="profileForm.avatar || ''">
                    <el-icon :size="28"><Plus /></el-icon>
                  </el-avatar>
                </el-upload>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="large" @click="handleSaveProfile">
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 子路由占位（用于其他菜单项的嵌套路由） -->
          <router-view v-if="activeMenu !== 'profile'" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { User, Calendar, Plus } from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeMenu = ref('profile')
const profileFormRef = ref<FormInstance>()

const roleMap: Record<string, string> = {
  admin: '管理员',
  enterprise: '企业管理员',
  teacher: '教师',
  student: '学生'
}

const roleTagTypeMap: Record<string, string> = {
  admin: 'danger',
  enterprise: 'warning',
  teacher: 'success',
  student: ''
}

const memberMap: Record<string, string> = {
  free: '免费',
  vip: 'VIP',
  svip: 'SVIP'
}

const memberTagTypeMap: Record<string, string> = {
  free: 'info',
  vip: 'warning',
  svip: 'danger'
}

const roleLabel = computed(() => roleMap[authStore.userRole] || '普通用户')
const roleTagType = computed(() => (roleTagTypeMap[authStore.userRole] || 'info') as any)
const memberLabel = computed(() => {
  const mt = (authStore.user as any)?.memberType || 'free'
  return memberMap[mt] || '免费'
})
const memberTagType = computed(() => {
  const mt = (authStore.user as any)?.memberType || 'free'
  return (memberTagTypeMap[mt] || 'info') as any
})
const memberExpireText = computed(() => {
  const expire = (authStore.user as any)?.memberExpireAt
  return expire ? `到期时间：${expire}` : ''
})

const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  avatar: ''
})

const profileRules: FormRules = {
  name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

function loadProfile() {
  if (authStore.user) {
    profileForm.name = authStore.user.name || ''
    profileForm.email = authStore.user.email || ''
    profileForm.phone = authStore.user.phone || ''
    profileForm.avatar = authStore.user.avatar || ''
  }
}

function handleAvatarChange(file: UploadFile) {
  const reader = new FileReader()
  reader.onload = (e) => {
    profileForm.avatar = e.target?.result as string
  }
  if (file.raw) {
    reader.readAsDataURL(file.raw)
  }
}

async function handleSaveProfile() {
  if (!profileFormRef.value) return
  const valid = await profileFormRef.value.validate().catch(() => false)
  if (!valid) return

  authStore.updateProfile({
    name: profileForm.name,
    email: profileForm.email,
    phone: profileForm.phone
  })
  ElMessage.success('个人信息已更新')
}

function handleMenuSelect(index: string) {
  activeMenu.value = index
  if (index === 'password') {
    router.push('/user/password')
  } else if (index === 'profile') {
    router.push('/user')
  } else {
    router.push(`/user/${index}`)
  }
}

onMounted(() => {
  loadProfile()
  // 根据当前路由设置 activeMenu
  const path = route.path
  if (path === '/user/profile') {
    activeMenu.value = 'profile'
  } else if (path.startsWith('/user/')) {
    activeMenu.value = path.replace('/user/', '')
  }
})
</script>

<style scoped>
.user-center {
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.user-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.profile-card {
  text-align: center;
}

.avatar-area {
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-expire {
  font-size: 0.75rem;
  color: #999;
}

.register-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #bbb;
  margin-top: 4px;
}

.user-content {
  flex: 1;
  min-width: 0;
}

.user-menu {
  border-bottom: 1px solid #eee;
}

.user-menu .el-menu-item {
  font-size: 0.95rem;
  padding: 0 20px;
  height: 50px;
  line-height: 50px;
}

.content-area {
  padding: 24px 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
}

.avatar-uploader {
  cursor: pointer;
}

@media (max-width: 768px) {
  .user-center {
    flex-direction: column;
    padding: 16px;
  }

  .user-sidebar {
    width: 100%;
  }
}
</style>
