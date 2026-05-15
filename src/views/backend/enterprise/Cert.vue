<template>
  <div class="page-container">
    <div class="page-header">
      <h2>企业认证</h2>
      <p class="page-desc">管理企业认证信息，提交认证申请和查看审核状态</p>
    </div>
    
    <div class="page-content">
      <!-- 认证状态卡片 -->
      <el-row :gutter="20" class="status-row">
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="status-card">
            <div class="status-header">
              <el-icon :size="48" :color="certStatusInfo.iconColor">
                <CircleCheckFilled v-if="certInfo.status === 'approved'" />
                <WarningFilled v-else-if="certInfo.status === 'rejected'" />
                <Clock v-else-if="certInfo.status === 'pending'" />
                <Document v-else />
              </el-icon>
            </div>
            <div class="status-body">
              <h3 :style="{ color: certStatusInfo.textColor }">{{ certStatusInfo.title }}</h3>
              <p class="status-desc">{{ certStatusInfo.description }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 认证信息表单 -->
      <el-card shadow="hover" class="cert-form-card">
        <template #header>
          <div class="card-header">
            <span>认证信息</span>
            <el-button 
              v-if="certInfo.status !== 'pending'" 
              type="primary" 
              @click="handleSubmitCert"
              :loading="submitLoading"
            >
              {{ certInfo.status === 'approved' ? '重新提交认证' : '提交认证' }}
            </el-button>
          </div>
        </template>

        <el-form
          ref="formRef"
          :model="certInfo"
          :rules="formRules"
          label-width="120px"
          label-position="right"
          :disabled="certInfo.status === 'pending'"
        >
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="企业名称" prop="enterpriseName">
                <el-input v-model="certInfo.enterpriseName" placeholder="请输入企业名称" />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :md="12">
              <el-form-item label="统一社会信用代码" prop="creditCode">
                <el-input v-model="certInfo.creditCode" placeholder="请输入18位统一社会信用代码" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-form-item label="法定代表人" prop="legalPerson">
                <el-input v-model="certInfo.legalPerson" placeholder="请输入法定代表人姓名" />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :md="12">
              <el-form-item label="注册资本" prop="registeredCapital">
                <el-input v-model="certInfo.registeredCapital" placeholder="请输入注册资本">
                  <template #append>万元</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="注册地址" prop="registeredAddress">
            <el-input v-model="certInfo.registeredAddress" placeholder="请输入注册地址" />
          </el-form-item>

          <el-form-item label="营业期限" prop="businessTerm">
            <el-date-picker
              v-model="certInfo.businessTerm"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item label="经营范围" prop="businessScope">
            <el-input
              v-model="certInfo.businessScope"
              type="textarea"
              :rows="3"
              placeholder="请输入经营范围"
            />
          </el-form-item>

          <!-- 认证材料上传 -->
          <el-form-item label="认证材料" prop="certDocuments">
            <div class="upload-section">
              <el-upload
                v-model:file-list="certInfo.certDocuments"
                :action="'#'"
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :before-upload="beforeUpload"
                accept=".jpg,.jpeg,.png,.pdf"
                multiple
                drag
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或 <em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    只能上传 jpg/png/pdf 文件，且不超过 10MB
                  </div>
                </template>
              </el-upload>
            </div>
          </el-form-item>

          <!-- 审核反馈 -->
          <el-form-item v-if="certInfo.status === 'rejected' && certInfo.rejectReason" label="拒绝原因">
            <el-alert
              :title="certInfo.rejectReason"
              type="error"
              :closable="false"
              show-icon
            />
          </el-form-item>

          <!-- 审核历史 -->
          <el-form-item v-if="certInfo.auditHistory.length > 0" label="审核历史">
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in certInfo.auditHistory"
                :key="index"
                :timestamp="item.time"
                :type="item.type"
              >
                <div class="timeline-content">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.content }}</p>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 认证指南 -->
      <el-card shadow="hover" class="guide-card">
        <template #header>
          <div class="card-header">
            <span>认证指南</span>
          </div>
        </template>
        
        <el-steps :active="currentStep" finish-status="success" style="margin: 20px 0;">
          <el-step title="填写信息" description="填写企业基本信息" />
          <el-step title="上传材料" description="上传认证所需材料" />
          <el-step title="等待审核" description="等待管理员审核" />
          <el-step title="认证完成" description="认证通过" />
        </el-steps>

        <div class="guide-tips">
          <el-alert
            title="认证材料清单"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>营业执照副本扫描件（加盖公章）</li>
                <li>法定代表人身份证正反面扫描件</li>
                <li>企业授权委托书（如非法人办理）</li>
                <li>其他相关资质证明文件</li>
              </ul>
            </template>
          </el-alert>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, FormInstance, FormRules, UploadFile } from 'element-plus'
import {
  CircleCheckFilled,
  WarningFilled,
  Clock,
  Document,
  UploadFilled
} from '@element-plus/icons-vue'

// TypeScript 类型定义
interface CertDocument {
  name: string
  url: string
  status: string
}

interface AuditRecord {
  time: string
  title: string
  content: string
  type: 'primary' | 'success' | 'warning' | 'danger'
}

interface CertInfo {
  id: number
  enterpriseName: string
  creditCode: string
  legalPerson: string
  registeredCapital: string
  registeredAddress: string
  businessTerm: string[]
  businessScope: string
  certDocuments: UploadFile[]
  status: 'none' | 'pending' | 'approved' | 'rejected'
  rejectReason: string
  submitTime: string
  auditTime: string
  auditHistory: AuditRecord[]
}

// 响应式数据
const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const currentStep = ref(0)

// 认证信息数据
const certInfo = reactive<CertInfo>({
  id: 0,
  enterpriseName: '',
  creditCode: '',
  legalPerson: '',
  registeredCapital: '',
  registeredAddress: '',
  businessTerm: [],
  businessScope: '',
  certDocuments: [],
  status: 'none',
  rejectReason: '',
  submitTime: '',
  auditTime: '',
  auditHistory: []
})

// 表单验证规则
const formRules = reactive<FormRules>({
  enterpriseName: [
    { required: true, message: '请输入企业名称', trigger: 'blur' }
  ],
  creditCode: [
    { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
    { 
      pattern: /^[0-9A-HJ-NP-RTUW-Y]{2}\d{6}[0-9A-HJ-NP-RTUW-Y]{10}$/, 
      message: '请输入正确的18位统一社会信用代码', 
      trigger: 'blur' 
    }
  ],
  legalPerson: [
    { required: true, message: '请输入法定代表人姓名', trigger: 'blur' }
  ],
  registeredCapital: [
    { required: true, message: '请输入注册资本', trigger: 'blur' }
  ],
  registeredAddress: [
    { required: true, message: '请输入注册地址', trigger: 'blur' }
  ],
  businessScope: [
    { required: true, message: '请输入经营范围', trigger: 'blur' }
  ]
})

// 计算属性：认证状态信息
const certStatusInfo = computed(() => {
  const statusMap = {
    none: {
      title: '未认证',
      description: '请填写企业信息并提交认证材料',
      iconColor: '#909399',
      textColor: '#909399'
    },
    pending: {
      title: '审核中',
      description: '认证申请已提交，正在等待管理员审核',
      iconColor: '#E6A23C',
      textColor: '#E6A23C'
    },
    approved: {
      title: '已认证',
      description: '企业认证已通过，享受全部功能',
      iconColor: '#67C23A',
      textColor: '#67C23A'
    },
    rejected: {
      title: '认证失败',
      description: '认证申请未通过，请根据拒绝原因修改后重新提交',
      iconColor: '#F56C6C',
      textColor: '#F56C6C'
    }
  }
  return statusMap[certInfo.status]
})

// 方法
const handleSubmitCert = () => {
  if (!formRef.value) return
  
  formRef.value.validate((valid) => {
    if (valid) {
      if (certInfo.certDocuments.length === 0) {
        ElMessage.warning('请上传认证材料')
        return
      }

      submitLoading.value = true
      
      setTimeout(() => {
        certInfo.status = 'pending'
        certInfo.submitTime = new Date().toLocaleString('zh-CN')
        
        certInfo.auditHistory.unshift({
          time: certInfo.submitTime,
          title: '提交认证申请',
          content: '企业认证申请已提交，等待审核',
          type: 'primary'
        })

        currentStep.value = 2
        submitLoading.value = false
        ElMessage.success('认证申请已提交，请等待审核')
        
        // 模拟审核过程
        simulateAudit()
      }, 1000)
    }
  })
}

const simulateAudit = () => {
  // 模拟3秒后审核通过
  setTimeout(() => {
    certInfo.status = 'approved'
    certInfo.auditTime = new Date().toLocaleString('zh-CN')
    currentStep.value = 3
    
    certInfo.auditHistory.push({
      time: certInfo.auditTime,
      title: '认证通过',
      content: '恭喜！您的企业认证申请已通过审核',
      type: 'success'
    })

    ElMessage.success('恭喜！企业认证已通过')
  }, 3000)
}

const handleFileChange = (uploadFile: UploadFile) => {
  const isLt10M = uploadFile.size! / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB!')
    return false
  }
  ElMessage.success(`文件 ${uploadFile.name} 已添加`)
}

const handleFileRemove = (uploadFile: UploadFile) => {
  ElMessage.info(`文件 ${uploadFile.name} 已移除`)
}

const beforeUpload = (file: File) => {
  const acceptTypes = ['image/jpeg', 'image/png', 'application/pdf']
  const isAccepted = acceptTypes.includes(file.type)
  if (!isAccepted) {
    ElMessage.error('只能上传 JPG/PNG/PDF 格式的文件!')
  }
  return isAccepted
}

// 初始化 Mock 数据
const initMockData = () => {
  // 模拟已认证通过的数据
  Object.assign(certInfo, {
    id: 1,
    enterpriseName: '北京科技有限公司',
    creditCode: '91110000MA01234567',
    legalPerson: '张三',
    registeredCapital: '1000',
    registeredAddress: '北京市海淀区中关村大街1号',
    businessTerm: ['2020-01-01', '2040-12-31'],
    businessScope: '技术开发、技术咨询、技术服务；软件开发；计算机系统集成',
    status: 'approved',
    submitTime: '2026-01-10 10:00:00',
    auditTime: '2026-01-12 14:30:00',
    auditHistory: [
      {
        time: '2026-01-12 14:30:00',
        title: '认证通过',
        content: '企业认证申请已通过审核',
        type: 'success'
      },
      {
        time: '2026-01-10 10:00:00',
        title: '提交认证申请',
        content: '企业认证申请已提交，等待审核',
        type: 'primary'
      }
    ]
  })
  currentStep.value = 3
}

onMounted(() => {
  // 模拟加载数据
  setTimeout(() => {
    initMockData()
  }, 500)
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #303133;
}

.page-desc {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.status-row {
  margin-bottom: 20px;
}

.status-card {
  border-radius: 8px;
  text-align: center;
  padding: 20px;
}

.status-header {
  margin-bottom: 16px;
}

.status-body h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.status-desc {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.cert-form-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.upload-section {
  width: 100%;
}

.guide-card {
  margin-top: 20px;
}

.guide-tips {
  margin-top: 20px;
}

.timeline-content h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #303133;
}

.timeline-content p {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-timeline-item__content) {
  padding-bottom: 15px;
}
</style>
