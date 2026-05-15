<template>
  <div class="page-container">
    <div class="page-header">
      <h2>企业介绍</h2>
      <p class="page-desc">编辑企业基本信息、简介和展示内容</p>
    </div>
    
    <div class="page-content">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索企业名称..."
          clearable
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增企业
        </el-button>
      </div>

      <!-- 企业列表表格 -->
      <el-table :data="filteredList" stripe style="margin-top: 20px" v-loading="loading">
        <el-table-column prop="name" label="企业名称" min-width="150" />
        <el-table-column prop="contact" label="联系人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredList.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新增企业' : '编辑企业'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入企业名称" />
        </el-form-item>
        
        <el-form-item label="企业简介" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入企业简介"
          />
        </el-form-item>
        
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="formData.contact" placeholder="请输入联系人姓名" />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入企业地址" />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'

// TypeScript 类型定义
interface EnterpriseInfo {
  id: number
  name: string
  description: string
  contact: string
  phone: string
  email: string
  address: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<EnterpriseInfo>({
  id: 0,
  name: '',
  description: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  status: 'active',
  createdAt: '',
  updatedAt: ''
})

// 表单验证规则
const formRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入企业名称', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入企业地址', trigger: 'blur' }
  ]
})

// Mock 数据
const enterpriseList = ref<EnterpriseInfo[]>([
  {
    id: 1,
    name: '北京科技有限公司',
    description: '专注于企业培训解决方案的高新技术企业',
    contact: '张总',
    phone: '13800138000',
    email: 'contact@bjtech.com',
    address: '北京市海淀区中关村大街1号',
    status: 'active',
    createdAt: '2026-01-15 10:00:00',
    updatedAt: '2026-05-10 14:30:00'
  },
  {
    id: 2,
    name: '上海教育培训中心',
    description: '提供专业的IT技能培训服务',
    contact: '李经理',
    phone: '13900139000',
    email: 'info@sh-edu.com',
    address: '上海市浦东新区张江高科技园区',
    status: 'active',
    createdAt: '2026-02-20 09:00:00',
    updatedAt: '2026-05-12 16:45:00'
  },
  {
    id: 3,
    name: '广州在线教育平台',
    description: '在线学习平台，提供海量课程资源',
    contact: '王主任',
    phone: '13700137000',
    email: 'admin@gz-online.com',
    address: '广州市天河区珠江新城',
    status: 'inactive',
    createdAt: '2026-03-10 11:00:00',
    updatedAt: '2026-05-08 10:20:00'
  },
  {
    id: 4,
    name: '深圳软件开发公司',
    description: '企业级软件开发与技术咨询服务',
    contact: '赵总监',
    phone: '13500135000',
    email: 'hello@sz-soft.com',
    address: '深圳市南山区科技园',
    status: 'active',
    createdAt: '2026-04-05 08:00:00',
    updatedAt: '2026-05-14 09:15:00'
  }
])

// 计算属性：过滤后的列表
const filteredList = computed(() => {
  let result = enterpriseList.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(keyword) ||
      item.contact.toLowerCase().includes(keyword) ||
      item.phone.includes(keyword)
    )
  }
  
  return result
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleCreate = () => {
  dialogType.value = 'create'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: EnterpriseInfo) => {
  dialogType.value = 'edit'
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleDelete = (row: EnterpriseInfo) => {
  ElMessageBox.confirm(
    `确定要删除企业"${row.name}"吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = enterpriseList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      enterpriseList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

const handleSubmit = () => {
  if (!formRef.value) return
  
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      
      setTimeout(() => {
        if (dialogType.value === 'create') {
          // 新增
          const newEnterprise: EnterpriseInfo = {
            ...formData,
            id: Date.now(),
            createdAt: new Date().toLocaleString('zh-CN'),
            updatedAt: new Date().toLocaleString('zh-CN')
          }
          enterpriseList.value.unshift(newEnterprise)
          ElMessage.success('新增成功')
        } else {
          // 编辑
          const index = enterpriseList.value.findIndex(item => item.id === formData.id)
          if (index > -1) {
            enterpriseList.value[index] = {
              ...enterpriseList.value[index],
              ...formData,
              updatedAt: new Date().toLocaleString('zh-CN')
            }
            ElMessage.success('编辑成功')
          }
        }
        
        submitLoading.value = false
        dialogVisible.value = false
      }, 500)
    }
  })
}

const resetForm = () => {
  Object.assign(formData, {
    id: 0,
    name: '',
    description: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    status: 'active',
    createdAt: '',
    updatedAt: ''
  })
  formRef.value?.resetFields()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
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

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}
</style>
