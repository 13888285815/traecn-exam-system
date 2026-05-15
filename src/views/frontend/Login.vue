<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">在线考试系统</h1>
        <p class="login-subtitle">欢迎回来，请登录您的账号</p>
      </div>

      <el-tabs v-model="activeTab" class="login-tabs" stretch>
        <!-- 密码登录 -->
        <el-tab-pane label="密码登录" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-position="top"
            @submit.prevent="handlePasswordLogin"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="passwordForm.username"
                placeholder="请输入用户名"
                prefix-icon="User"
                size="large"
                clearable
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                size="large"
                show-password
                @keyup.enter="handlePasswordLogin"
              />
            </el-form-item>
            <el-form-item>
              <div class="login-options">
                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                <router-link to="/password" class="forgot-link">忘记密码？</router-link>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="login-button"
                @click="handlePasswordLogin"
              >
                {{ loading ? '登录中...' : '登 录' }}
              </el-button>
            </el-form-item>
          </el-form>
          <div class="login-footer">
            <span>没有账号？</span>
            <router-link to="/register" class="link">去注册</router-link>
          </div>
        </el-tab-pane>

        <!-- 邮箱验证码登录 -->
        <el-tab-pane label="邮箱验证码登录" name="email">
          <el-form
            ref="emailFormRef"
            :model="emailForm"
            :rules="emailRules"
            label-position="top"
            @submit.prevent="handleEmailLogin"
          >
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="emailForm.email"
                placeholder="请输入邮箱地址"
                prefix-icon="Message"
                size="large"
                clearable
              />
            </el-form-item>
            <el-form-item label="验证码" prop="code">
              <div class="code-row">
                <el-input
                  v-model="emailForm.code"
                  placeholder="请输入验证码"
                  prefix-icon="Key"
                  size="large"
                  clearable
                />
                <el-button
                  size="large"
                  :disabled="countdown > 0"
                  class="code-button"
                  @click="handleSendCode"
                >
                  {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="login-button"
                @click="handleEmailLogin"
              >
                {{ loading ? '登录中...' : '登 录' }}
              </el-button>
            </el-form-item>
          </el-form>
          <div class="login-footer">
            <span>没有账号？</span>
            <router-link to="/register" class="link">去注册</router-link>
          </div>
        </el-tab-pane>

        <!-- 微信扫码登录 -->
        <el-tab-pane label="微信扫码登录" name="wechat">
          <div class="qrcode-area">
            <div class="qrcode-placeholder">
              <el-icon :size="48" color="#999"><Iphone /></el-icon>
              <p class="qrcode-text">微信扫码登录</p>
            </div>
            <p class="qrcode-tip">请使用微信扫描二维码登录</p>
          </div>
          <div class="login-footer" style="margin-top: 1.5rem;">
            <span>没有账号？</span>
            <router-link to="/register" class="link">去注册</router-link>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Iphone } from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('password')
const loading = ref(false)
const rememberMe = ref(false)
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// ---- 密码登录 ----
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  username: '',
  password: ''
})

const passwordRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符之间', trigger: 'blur' }
  ]
}

async function handlePasswordLogin() {
  if (!passwordFormRef.value) return
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const result = await authStore.login(passwordForm.username, passwordForm.password)
    if (result.success) {
      ElMessage.success(result.message)
      const role = authStore.userRole
      if (role === 'admin' || role === 'enterprise') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    loading.value = false
  }
}

// ---- 邮箱验证码登录 ----
const emailFormRef = ref<FormInstance>()
const emailForm = reactive({
  email: '',
  code: ''
})

const emailRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

function handleSendCode() {
  if (!emailForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(emailForm.email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }
  ElMessage.success('验证码已发送至您的邮箱')
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownTimer) clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

async function handleEmailLogin() {
  if (!emailFormRef.value) return
  const valid = await emailFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // 模拟验证：任意邮箱 + 验证码 123456 即可登录
    if (emailForm.code !== '123456') {
      ElMessage.error('验证码错误，请输入 123456 进行模拟登录')
      return
    }
    // 模拟邮箱登录：使用 admin 账号
    const result = await authStore.login('admin', 'admin123')
    if (result.success) {
      ElMessage.success('登录成功')
      const role = authStore.userRole
      if (role === 'admin' || role === 'enterprise') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else {
      ElMessage.error(result.message)
    }
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
}

.login-card {
  width: 460px;
  background: #fff;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #999;
  font-size: 0.95rem;
}

.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 1.5rem;
}

.login-tabs :deep(.el-tabs__item) {
  font-size: 0.95rem;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
}

.forgot-link:hover {
  text-decoration: underline;
}

.code-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.code-row .el-input {
  flex: 1;
}

.code-button {
  flex-shrink: 0;
  min-width: 120px;
}

.login-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  font-size: 1.05rem;
  padding: 0.85rem 0;
  border-radius: 10px;
  font-weight: 600;
}

.login-button:hover {
  opacity: 0.9;
}

.login-footer {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #999;
}

.login-footer .link {
  color: #667eea;
  text-decoration: none;
  margin-left: 4px;
}

.login-footer .link:hover {
  text-decoration: underline;
}

.qrcode-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0 1rem;
}

.qrcode-placeholder {
  width: 180px;
  height: 180px;
  background: #f5f5f5;
  border: 2px dashed #ddd;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.qrcode-text {
  color: #999;
  font-size: 0.9rem;
}

.qrcode-tip {
  color: #bbb;
  font-size: 0.85rem;
  margin-top: 1rem;
}
</style>
