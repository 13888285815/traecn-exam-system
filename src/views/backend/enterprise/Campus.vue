<template>
  <div class="page-container">
    <div class="page-header">
      <h2>校区管理</h2>
      <p class="page-desc">管理企业下属校区信息，包括校区的增删改查和状态管理</p>
    </div>
    <div class="page-content">
      <div class="search-bar">
        <el-input v-model="searchKeyword" placeholder="搜索校区名称或地址..." clearable style="width: 260px" @input="handleSearch">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filterCity" placeholder="选择城市" clearable style="width: 150px" @change="handleSearch">
          <el-option v-for="c in cities" :key="c" :label="c" :value="c" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="选择状态" clearable style="width: 140px" @change="handleSearch">
          <el-option label="正常" value="active" />
          <el-option label="停用" value="inactive" />
        </el-select>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>新增校区
        </el-button>
      </div>

      <el-table :data="filteredList" stripe style="margin-top: 16px" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="校区名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="address" label="详细地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="principal" label="负责人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="studentCount" label="学员数" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 'active' ? 'warning' : 'success'" link @click="handleToggleStatus(row)">
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑校区' : '新增校区'" width="620px" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="校区名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入校区名称" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="所在城市" prop="city">
              <el-select v-model="form.city" placeholder="请选择城市" style="width: 100%">
                <el-option v-for="c in cities" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="principal">
              <el-input v-model="form.principal" placeholder="请输入负责人姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学员数量" prop="studentCount">
              <el-input-number v-model="form.studentCount" :min="0" :max="99999" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

interface Campus {
  id: number
  name: string
  city: string
  address: string
  principal: string
  phone: string
  studentCount: number
  remark: string
  status: 'active' | 'inactive'
  createdAt: string
}

const cities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉', '西安']

const loading = ref(false)
const searchKeyword = ref('')
const filterCity = ref('')
const filterStatus = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const list = ref<Campus[]>([])
const filteredList = computed(() => {
  return list.value.filter(item => {
    const matchKeyword = !searchKeyword.value || item.name.includes(searchKeyword.value) || item.address.includes(searchKeyword.value)
    const matchCity = !filterCity.value || item.city === filterCity.value
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchKeyword && matchCity && matchStatus
  })
})

const form = reactive({ name: '', city: '', address: '', principal: '', phone: '', studentCount: 0, remark: '' })

const formRules: FormRules = {
  name: [{ required: true, message: '请输入校区名称', trigger: 'blur' }],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  principal: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const handleSearch = () => {}
const handleCreate = () => { isEdit.value = false; dialogVisible.value = true }
const handleEdit = (row: Campus) => {
  isEdit.value = true; editingId.value = row.id
  Object.assign(form, { name: row.name, city: row.city, address: row.address, principal: row.principal, phone: row.phone, studentCount: row.studentCount, remark: row.remark })
  dialogVisible.value = true
}
const handleToggleStatus = (row: Campus) => {
  row.status = row.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(row.status === 'active' ? '已启用' : '已停用')
}
const handleDelete = (row: Campus) => {
  list.value = list.value.filter(i => i.id !== row.id)
  ElMessage.success('删除成功')
}
const resetForm = () => { formRef.value?.resetFields() }

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (!valid) return
    submitLoading.value = true
    setTimeout(() => {
      if (isEdit.value && editingId.value !== null) {
        const idx = list.value.findIndex(i => i.id === editingId.value)
        if (idx > -1) list.value[idx] = { ...list.value[idx], ...form }
        ElMessage.success('更新成功')
      } else {
        list.value.unshift({ id: Date.now(), ...form, createdAt: new Date().toLocaleString('zh-CN'), status: 'active' as const })
        ElMessage.success('新增成功')
      }
      submitLoading.value = false
      dialogVisible.value = false
    }, 600)
  })
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    list.value = [
      { id: 1, name: '北京中关村校区', city: '北京', address: '北京市海淀区中关村大街1号科技大厦3层', principal: '刘强', phone: '010-82345678', studentCount: 320, remark: '主校区，设施齐全', status: 'active', createdAt: '2025-06-01 08:00:00' },
      { id: 2, name: '上海浦东校区', city: '上海', address: '上海市浦东新区世纪大道1000号金融中心5层', principal: '陈明', phone: '021-58881234', studentCount: 280, remark: '', status: 'active', createdAt: '2025-08-15 09:00:00' },
      { id: 3, name: '深圳南山校区', city: '深圳', address: '深圳市南山区科技园南区高新南七道R2-B栋', principal: '吴芳', phone: '0755-26009876', studentCount: 150, remark: '位于科技园核心区', status: 'active', createdAt: '2025-09-01 10:00:00' },
      { id: 4, name: '成都锦江校区', city: '成都', address: '成都市锦江区红星路三段IFS国际金融中心', principal: '周杰', phone: '028-86771234', studentCount: 90, remark: '筹备中，部分教室未启用', status: 'inactive', createdAt: '2026-01-10 14:00:00' }
    ]
    loading.value = false
  }, 400)
})
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; color: #303133; }
.page-desc { color: #909399; margin: 0; font-size: 14px; }
.search-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
</style>
