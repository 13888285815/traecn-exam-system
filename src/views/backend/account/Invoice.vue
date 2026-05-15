<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的发票</h2>
      <p class="page-desc">查看发票记录和申请新发票</p>
    </div>
    <div class="page-content">
      <el-card shadow="hover" class="filter-card">
        <el-row :gutter="16" align="middle">
          <el-col :xs="24" :sm="8">
            <el-input v-model="filter.keyword" placeholder="搜索发票号/订单号" clearable />
          </el-col>
          <el-col :xs="24" :sm="6">
            <el-select v-model="filter.status" placeholder="发票状态" clearable>
              <el-option label="待开具" value="pending" />
              <el-option label="已开具" value="issued" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="10" style="text-align: right">
            <el-button type="primary" @click="showApplyDialog = true">申请发票</el-button>
          </el-col>
        </el-row>
      </el-card>

      <el-card shadow="hover" style="margin-top: 16px">
        <el-table :data="filteredInvoices" stripe>
          <el-table-column prop="invoiceNo" label="发票号" width="180" />
          <el-table-column prop="orderNo" label="订单号" width="180" />
          <el-table-column prop="title" label="发票抬头" />
          <el-table-column prop="amount" label="金额" width="100">
            <template #default="{ row }">¥{{ row.amount.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="80">
            <template #default="{ row }">{{ row.type === 'personal' ? '个人' : '企业' }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="{ pending: 'warning', issued: 'success', rejected: 'danger' }[row.status]" size="small">
                {{ { pending: '待开具', issued: '已开具', rejected: '已拒绝' }[row.status] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="申请时间" width="170" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="viewInvoice(row)">查看</el-button>
              <el-button v-if="row.status === 'issued'" size="small" type="success" link>下载</el-button>
              <el-button v-if="row.status === 'pending'" size="small" type="danger" link @click="cancelInvoice(row)">取消</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrap">
          <el-pagination v-model:current-page="pagination.page" :page-size="pagination.size" :total="pagination.total" layout="total, prev, pager, next" />
        </div>
      </el-card>
    </div>

    <el-dialog v-model="showApplyDialog" title="申请发票" width="500px">
      <el-form :model="applyForm" label-width="100px">
        <el-form-item label="关联订单">
          <el-select v-model="applyForm.orderId" placeholder="选择订单">
            <el-option v-for="o in payableOrders" :key="o.id" :label="`${o.orderNo} - ${o.productName}`" :value="o.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="发票类型">
          <el-radio-group v-model="applyForm.type">
            <el-radio label="personal">个人</el-radio>
            <el-radio label="company">企业</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发票抬头">
          <el-input v-model="applyForm.title" />
        </el-form-item>
        <el-form-item v-if="applyForm.type === 'company'" label="税号">
          <el-input v-model="applyForm.taxNo" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showApplyDialog = false">取消</el-button>
        <el-button type="primary" @click="applyInvoice">提交申请</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetail" title="发票详情" width="500px">
      <el-descriptions :column="1" border v-if="currentInvoice">
        <el-descriptions-item label="发票号">{{ currentInvoice.invoiceNo }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ currentInvoice.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="发票抬头">{{ currentInvoice.title }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ currentInvoice.amount.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentInvoice.type === 'personal' ? '个人' : '企业' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ { pending: '待开具', issued: '已开具', rejected: '已拒绝' }[currentInvoice.status] }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

interface Invoice {
  id: number; invoiceNo: string; orderNo: string; title: string; amount: number
  type: 'personal' | 'company'; status: 'pending' | 'issued' | 'rejected'; createdAt: string
}

const filter = reactive({ keyword: '', status: '' })
const pagination = reactive({ page: 1, size: 10, total: 0 })
const showApplyDialog = ref(false)
const showDetail = ref(false)
const currentInvoice = ref<Invoice | null>(null)

const invoices = ref<Invoice[]>([
  { id: 1, invoiceNo: 'INV20260510001', orderNo: 'ORD20260510001', title: '张三', amount: 99.00, type: 'personal', status: 'issued', createdAt: '2026-05-10 15:00:00' },
  { id: 2, invoiceNo: 'INV20260511002', orderNo: 'ORD20260511002', title: '腾讯科技有限公司', amount: 199.00, type: 'company', status: 'pending', createdAt: '2026-05-11 10:00:00' },
  { id: 3, invoiceNo: 'INV20260512003', orderNo: 'ORD20260512003', title: '李四', amount: 49.90, type: 'personal', status: 'issued', createdAt: '2026-05-12 17:00:00' },
  { id: 4, invoiceNo: 'INV20260513004', orderNo: 'ORD20260513004', title: '王五', amount: 68.00, type: 'personal', status: 'rejected', createdAt: '2026-05-13 11:00:00' },
])

const payableOrders = ref([
  { id: 10, orderNo: 'ORD20260514005', productName: 'Python进阶实战题库' },
  { id: 11, orderNo: 'ORD20260515006', productName: '操作系统考试模拟卷' },
])

const applyForm = reactive({ orderId: null as number | null, type: 'personal' as 'personal' | 'company', title: '', taxNo: '' })
pagination.total = invoices.value.length

const filteredInvoices = computed(() => invoices.value.filter(i => {
  if (filter.keyword && !i.invoiceNo.includes(filter.keyword) && !i.orderNo.includes(filter.keyword)) return false
  if (filter.status && i.status !== filter.status) return false
  return true
}))

function viewInvoice(row: Invoice) { currentInvoice.value = row; showDetail.value = true }
function cancelInvoice(row: Invoice) { invoices.value = invoices.value.filter(i => i.id !== row.id); ElMessage.success('已取消') }
function applyInvoice() {
  if (!applyForm.orderId || !applyForm.title) { ElMessage.warning('请填写完整'); return }
  const newInvoice: Invoice = {
    id: Date.now(), invoiceNo: `INV${Date.now()}`, orderNo: `ORD${applyForm.orderId}`,
    title: applyForm.title, amount: 99.00, type: applyForm.type, status: 'pending', createdAt: new Date().toLocaleString('zh-CN')
  }
  invoices.value.unshift(newInvoice)
  pagination.total = invoices.value.length
  showApplyDialog.value = false
  applyForm.orderId = null; applyForm.title = ''; applyForm.taxNo = ''
  ElMessage.success('发票申请已提交')
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
