<template>
  <div class="page-container">
    <div class="page-header">
      <h2>小程序配置</h2>
      <p class="page-desc">配置微信小程序 AppID、AppSecret 及功能开关</p>
    </div>
    <div class="page-content">
      <el-form :model="form" label-width="130px" style="max-width: 640px" :rules="formRules" ref="formRef">
        <el-divider content-position="left">基础配置</el-divider>
        <el-form-item label="AppID" prop="appId">
          <el-input v-model="form.appId" placeholder="请输入小程序 AppID" maxlength="50" />
        </el-form-item>
        <el-form-item label="AppSecret" prop="appSecret">
          <el-input
            v-model="form.appSecret"
            :type="showSecret ? 'text' : 'password'"
            placeholder="请输入小程序 AppSecret"
            maxlength="100"
          >
            <template #append>
              <el-button @click="showSecret = !showSecret">
                <el-icon>{{ showSecret ? 'Hide' : 'View' }}</el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="小程序名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入小程序名称" maxlength="30" />
        </el-form-item>
        <el-form-item label="小程序 Logo">
          <el-upload
            class="logo-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
          >
            <img v-if="form.logo" :src="form.logo" class="logo-img" />
            <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-divider content-position="left">功能开关</el-divider>
        <el-form-item label="启用登录">
          <el-switch v-model="form.enableLogin" />
          <span class="form-hint">允许小程序用户通过微信授权登录</span>
        </el-form-item>
        <el-form-item label="启用支付">
          <el-switch v-model="form.enablePay" />
          <span class="form-hint">开启微信支付功能</span>
        </el-form-item>
        <el-form-item label="启用消息推送">
          <el-switch v-model="form.enableMessage" />
          <span class="form-hint">通过小程序给用户发送消息通知</span>
        </el-form-item>

        <el-divider content-position="left">业务配置</el-divider>
        <el-form-item label="首页公告">
          <el-input v-model="form.homeNotice" type="textarea" :rows="3" placeholder="小程序首页公告内容" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="客服电话">
          <el-input v-model="form.servicePhone" placeholder="请输入客服电话" maxlength="20" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave">保存配置</el-button>
          <el-button @click="handleTest">测试连接</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()
const showSecret = ref(false)

const form = reactive({
  appId: 'wx1234567890abcdef',
  appSecret: 'mock_secret_1234567890abcdef',
  name: '考试系统小程序',
  logo: '',
  enableLogin: true,
  enablePay: false,
  enableMessage: true,
  homeNotice: '欢迎使用考试系统小程序，如有问题请联系客服。',
  servicePhone: '400-123-4567',
})

const formRules: FormRules = {
  appId: [
    { required: true, message: '请输入 AppID', trigger: 'blur' },
  ],
  appSecret: [
    { required: true, message: '请输入 AppSecret', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入小程序名称', trigger: 'blur' },
  ],
}

function handleSave() {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('小程序配置已保存')
    }
  })
}

function handleTest() {
  ElMessage.info('正在测试小程序连接...')
  setTimeout(() => {
    ElMessage.success('连接测试成功')
  }, 1500)
}

function handleReset() {
  form.appId = ''
  form.appSecret = ''
  form.name = ''
  form.logo = ''
  form.enableLogin = true
  form.enablePay = false
  form.enableMessage = true
  form.homeNotice = ''
  form.servicePhone = ''
  formRef.value?.clearValidate()
  ElMessage.info('已重置为默认值')
}
</script>

<style scoped>
.page-container { padding: 24px; background: #f5f7fa; min-height: 100%; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 6px; font-size: 20px; font-weight: 600; color: #1a1a1a; }
.page-desc { color: #909399; margin: 0; font-size: 13px; }
.form-hint { margin-left: 8px; color: #909399; font-size: 12px; }
.logo-uploader {
  border: 1px dashed #d9d9d9; border-radius: 6px; cursor: pointer;
  width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;
}
.logo-uploader:hover { border-color: #409EFF; }
.logo-uploader-icon { font-size: 28px; color: #8c939d; }
.logo-img { width: 120px; height: 120px; object-fit: cover; border-radius: 6px; }
</style>
