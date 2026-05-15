<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的订单</h2>
      <p class="page-desc">查看您的购买记录和订单详情</p>
    </div>
    <div class="page-content">
      <el-card shadow="hover" class="filter-card">
        <el-row :gutter="16" align="middle">
          <el-col :xs="24" :sm="8">
            <el-input v-model="filter.keyword" placeholder="搜索订单号/商品名" clearable />
          </el-col>
          <el-col :xs="24" :sm="6">
            <el-select v-model="filter.status" placeholder="订单状态" clearable>
              <el-option label="待支付" value="pending" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
              <el-option label="已退款" value="refunded" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="6">
            <el-date-picker v-model="filter.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%" />
          </el-col>
          <el-col :xs="24" :sm="4">
            <el-button type="primary" @click="handleFilter">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-col>
        </el-row>
      </el-card>

      <el-card shadow="hover" style="margin-top: 16px">
        <el-table :data="filteredOrders" stripe>
          <el-table-column prop="orderNo" label="订单号" width="200" />
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="amount" label="金额" width="100">
            <template #default="{ row }">
              <span style="color: #F56C6C; font-weight: 600">¥{{ row.amount.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="下单时间" width="170" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="viewDetail(row)">详情</el-button>
              <el-button v-if="row.status === 'pending'" size="small" type="success" link @click="payOrder(row)">支付</el-button>
              <el-button v-if="row.status === 'pending'" size="small" type="danger" link @click="cancelOrder(row)">取消</el-button>
              <el-button v-if="row.status === 'completed'" size="small" type="warning" link @click="refundOrder(row)">退款</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrap">
          <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.size" :total="pagination.total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" />
        </div>
      </el-card>
    </div>

    <el-dialog v-model="showDetail" title="订单详情" width="500px">
      <el-descriptions :column="1" border v-if="currentOrder">
        <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ currentOrder.productName }}</el-descriptions-item>
        <el-descriptions-item label="金额">¥{{ currentOrder.amount.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(currentOrder.status)">{{ statusLabel(currentOrder.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ currentOrder.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ currentOrder.payMethod || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Order {
  id: number
  orderNo: string
  productName: string
  amount: number
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  createdAt: string
  payMethod: string
}

const filter = reactive({ keyword: '', status: '', dateRange: null as [Date, Date] | null })
const pagination = reactive({ page: 1, size: 10, total: 0 })
const showDetail = ref(false)
const currentOrder = ref<Order | null>(null)

const orders = ref<Order[]>([
  { id: 1, orderNo: 'ORD20260510001', productName: '计算机基础题库（2026版）', amount: 99.00, status: 'completed', createdAt: '2026-05-10 14:30:00', payMethod: '微信支付' },
  { id: 2, orderNo: 'ORD20260511002', productName: '数据结构精讲视频课', amount: 199.00, status: 'pending', createdAt: '2026-05-11 09:15:00', payMethod: '' },
  { id: 3, orderNo: 'ORD20260512003', productName: '英语四级冲刺包', amount: 49.90, status: 'completed', createdAt: '2026-05-12 16:20:00', payMethod: '支付宝' },
  { id: 4, orderNo: 'ORD20260513004', productName: '数学建模竞赛题集', amount: 68.00, status: 'cancelled', createdAt: '2026-05-13 10:45:00', payMethod: '' },
  { id: 5, orderNo: 'ORD20260514005', productName: 'Python进阶实战题库', amount: 128.00, status: 'refunded', createdAt: '2026-05-14 11:30:00', payMethod: '微信支付' },
  { id: 6, orderNo: 'ORD20260515006', productName: '操作系统考试模拟卷', amount: 29.90, status: 'pending', createdAt: '2026-05-15 08:00:00', payMethod: '' },
])

pagination.total = orders.value.length

const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    if (filter.keyword && !o.orderNo.includes(filter.keyword) && !o.productName.includes(filter.keyword)) return false
    if (filter.status && o.status !== filter.status) return false
    return true
  })
})

function statusType(s: string) { return { pending: 'warning', completed: 'success', cancelled: 'info', refunded: 'danger' }[s] || 'info' }
function statusLabel(s: string) { return { pending: '待支付', completed: '已完成', cancelled: '已取消', refunded: '已退款' }[s] || s }

function handleFilter() { pagination.page = 1 }
function resetFilter() { filter.keyword = ''; filter.status = ''; filter.dateRange = null }
function viewDetail(row: Order) { currentOrder.value = row; showDetail.value = true }
function payOrder(row: Order) { row.status = 'completed'; row.payMethod = '微信支付'; ElMessage.success('支付成功') }
function cancelOrder(row: Order) { ElMessageBox.confirm('确认取消该订单？', '提示', { type: 'warning' }).then(() => { row.status = 'cancelled'; ElMessage.success('订单已取消') }).catch(() => {}) }
function refundOrder(row: Order) { ElMessageBox.confirm('确认申请退款？', '提示', { type: 'warning' }).then(() => { row.status = 'refunded'; ElMessage.success('退款申请已提交') }).catch(() => {}) }
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
