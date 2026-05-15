<template>
  <div class="page-container">
    <div class="page-header">
      <h2>账户信息</h2>
      <p class="page-desc">查看和编辑您的账户基本信息</p>
    </div>
    <div class="page-content">
      <el-row :gutter="16">
        <el-col :xs="24" :lg="8">
          <el-card shadow="hover" class="avatar-card">
            <div class="avatar-section">
              <el-avatar :size="100" :src="userInfo.avatar">
                {{ userInfo.nickname?.charAt(0) }}
              </el-avatar>
              <el-upload
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :http-request="handleAvatarUpload"
                accept="image/*"
              >
                <el-button type="primary" size="small" class="avatar-btn">更换头像</el-button>
              </el-upload>
              <h3 class="user-nickname">{{ userInfo.nickname }}</h3>
              <el-tag :type="userInfo.vip ? 'danger' : 'info'" size="small">
                {{ userInfo.vip ? 'SVIP会员' : '普通用户' }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="16">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>基本信息</span>
                <el-button v-if="!editing" type="primary" link @click="editing = true">编辑</el-button>
                <div v-else>
                  <el-button type="primary" size="small" @click="saveInfo">保存</el-button>
                  <el-button size="small" @click="cancelEdit">取消</el-button>
                </div>
              </div>
            </template>
            <el-form :model="userInfo" label-width="100px" :disabled="!editing">
              <el-form-item label="昵称">
                <el-input v-model="userInfo.nickname" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="userInfo.email" />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="userInfo.phone" />
              </el-form-item>
              <el-form-item label="性别">
                <el-radio-group v-model="userInfo.gender">
                  <el-radio label="male">男</el-radio>
                  <el-radio label="female">女</el-radio>
                  <el-radio label="other">保密</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="生日">
                <el-date-picker v-model="userInfo.birthday" type="date" placeholder="选择日期" />
              </el-form-item>
              <el-form-item label="个人简介">
                <el-input v-model="userInfo.bio" type="textarea" :rows="3" />
              </el-form-item>
            </el-form>
          </el-card>

          <el-card shadow="hover" style="margin-top: 16px">
            <template #header>
              <div class="card-header">
                <span>安全设置</span>
              </div>
            </template>
            <div class="security-list">
              <div class="security-item">
                <div>
                  <div class="security-title">登录密码</div>
                  <div class="security-desc">上次修改：2026-04-01</div>
                </div>
                <el-button type="primary" link @click="showPasswordDialog = true">修改</el-button>
              </div>
              <div class="security-item">
                <div>
                  <div class="security-title">绑定手机</div>
                  <div class="security-desc">{{ userInfo.phone ? maskPhone(userInfo.phone) : '未绑定' }}</div>
                </div>
                <el-button type="primary" link>{{ userInfo.phone ? '更换' : '绑定' }}</el-button>
              </div>
              <div class="security-item">
                <div>
                  <div class="security-title">绑定邮箱</div>
                  <div class="security-desc">{{ userInfo.email || '未绑定' }}</div>
                </div>
                <el-button type="primary" link>{{ userInfo.email ? '更换' : '绑定' }}</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="当前密码">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadRequestOptions } from 'element-plus'

interface UserInfo {
  nickname: string
  email: string
  phone: string
  gender: string
  birthday: string
  bio: string
  avatar: string
  vip: boolean
}

const editing = ref(false)
const showPasswordDialog = ref(false)

const defaultUserInfo: UserInfo = {
  nickname: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  gender: 'male',
  birthday: '1995-06-15',
  bio: '热爱编程，专注后端开发',
  avatar: '',
  vip: true
}

const userInfo = reactive<UserInfo>({ ...defaultUserInfo })
const backupInfo = ref<UserInfo>({ ...defaultUserInfo })

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

function saveInfo() {
  Object.assign(backupInfo.value, userInfo)
  editing.value = false
  ElMessage.success('信息已保存')
}

function cancelEdit() {
  Object.assign(userInfo, backupInfo.value)
  editing.value = false
}

function beforeAvatarUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) ElMessage.error('只能上传图片文件')
  if (!isLt2M) ElMessage.error('图片大小不能超过2MB')
  return isImage && isLt2M
}

function handleAvatarUpload(options: UploadRequestOptions) {
  const url = URL.createObjectURL(options.file)
  userInfo.avatar = url
  backupInfo.value.avatar = url
  ElMessage.success('头像已更新')
}

function changePassword() {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    ElMessage.warning('请填写完整')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次密码不一致')
    return
  }
  showPasswordDialog.value = false
  ElMessage.success('密码修改成功')
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

function maskPhone(phone: string) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.avatar-card { text-align: center; }
.avatar-section { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px 0; }
.avatar-btn { margin-top: 4px; }
.user-nickname { margin: 8px 0 4px; font-size: 18px; }
.security-list { display: flex; flex-direction: column; }
.security-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #f0f2f5; }
.security-item:last-child { border-bottom: none; }
.security-title { font-size: 14px; font-weight: 600; color: #303133; }
.security-desc { font-size: 12px; color: #909399; margin-top: 4px; }
</style>
