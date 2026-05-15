<template>
  <div class="page-container">
    <div class="page-header">
      <h2>企业设置</h2>
      <p class="page-desc">管理企业配置和权限</p>
    </div>
    <div class="page-content">
      <el-form :model="enterpriseForm" label-width="120px" style="max-width: 600px">
        <el-form-item label="企业名称" required>
          <el-input v-model="enterpriseForm.name" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="企业域名">
          <el-input v-model="enterpriseForm.domain" placeholder="请输入企业域名">
            <template #append>.exam-system.com</template>
          </el-input>
        </el-form-item>
        <el-form-item label="企业 Logo">
          <el-upload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
          >
            <img v-if="enterpriseForm.logo" :src="enterpriseForm.logo" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="允许注册">
          <el-switch v-model="enterpriseForm.allowRegister" />
        </el-form-item>
        <el-form-item label="默认角色">
          <el-select v-model="enterpriseForm.defaultRole" placeholder="请选择默认角色">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
            <el-option label="阅卷员" value="grader" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限设置">
          <el-checkbox-group v-model="enterpriseForm.permissions">
            <el-checkbox label="exam.create">创建考试</el-checkbox>
            <el-checkbox label="exam.grade">批改试卷</el-checkbox>
            <el-checkbox label="question.manage">管理题库</el-checkbox>
            <el-checkbox label="user.manage">管理用户</el-checkbox>
            <el-checkbox label="system.config">系统配置</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存配置</el-button>
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

const enterpriseForm = reactive({
  name: '示例企业',
  domain: 'example',
  logo: '',
  allowRegister: true,
  defaultRole: 'user',
  permissions: ['exam.create', 'question.manage']
})

function handleSave() {
  if (!enterpriseForm.name) {
    ElMessage.warning('请输入企业名称')
    return
  }
  ElMessage.success('配置保存成功')
}

function handleReset() {
  enterpriseForm.name = '示例企业'
  enterpriseForm.domain = 'example'
  enterpriseForm.logo = ''
  enterpriseForm.allowRegister = true
  enterpriseForm.defaultRole = 'user'
  enterpriseForm.permissions = ['exam.create', 'question.manage']
  ElMessage.info('已重置为默认配置')
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.avatar-uploader { border: 1px dashed #d9d9d9; border-radius: 6px; cursor: pointer; position: relative; overflow: hidden; width: 128px; height: 128px; display: flex; align-items: center; justify-content: center; }
.avatar-uploader:hover { border-color: #409EFF; }
.avatar-uploader-icon { font-size: 28px; color: #8c939d; }
.avatar { width: 128px; height: 128px; display: block; object-fit: cover; }
</style>
