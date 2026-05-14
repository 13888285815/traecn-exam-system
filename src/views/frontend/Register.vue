<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-header">
        <h1 class="register-title">在线考试系统</h1>
        <p class="register-subtitle">创建您的账号</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleRegister"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱地址"
            prefix-icon="Message"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号（选填）"
            prefix-icon="Phone"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <div class="code-row">
            <el-input
              v-model="form.code"
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

        <el-form-item prop="agreement">
          <el-checkbox v-model="form.agreement">
            我已阅读并同意
            <a href="javascript:;" class="agreement-link">《用户协议》</a>
            和
            <a href="javascript:;" class="agreement-link">《隐私政策》</a>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="register-button"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '注 册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <span>已有账号？</span>
        <router-link to="/login" class="link">去登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const form = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  code: '',
  agreement: false
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateAgreement = (_rule: any, value: boolean, callback: any) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议和隐私政策'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
  ]
}

function handleSendCode() {
  if (!form.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(form.email)) {
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

async function handleRegister() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (form.code !== '123456') {
    ElMessage.error('验证码错误，请输入 123456 进行演示注册')
    return
  }

  loading.value = true
  try {
    const result = await authStore.register({
      username: form.username,
      password: form.password,
      name: form.username,
      email: form.email,
      phone: form.phone || undefined
    })
    if (result.success) {
      ElMessage.success('注册成功，已自动登录')
      router.push('/')
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
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
}

.register-card {
  width: 460px;
  background: #fff;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.register-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.register-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: #999;
  font-size: 0.95rem;
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

.agreement-link {
  color: #667eea;
  text-decoration: none;
}

.agreement-link:hover {
  text-decoration: underline;
}

.register-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  font-size: 1.05rem;
  padding: 0.85rem 0;
  border-radius: 10px;
  font-weight: 600;
}

.register-button:hover {
  opacity: 0.9;
}

.register-footer {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #999;
}

.register-footer .link {
  color: #667eea;
  text-decoration: none;
  margin-left: 4px;
}

.register-footer .link:hover {
  text-decoration: underline;
}
</style>
