<template>
  <div class="page-container">
    <div class="page-header">
      <h2>消息中心</h2>
      <p class="page-desc">查看系统消息和通知</p>
      <el-button type="primary" :disabled="unreadCount === 0" @click="markAllRead">
        全部已读
      </el-button>
    </div>

    <div class="page-content">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-radio-group v-model="filterType" @change="handleFilter">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="system">系统通知</el-radio-button>
          <el-radio-button value="order">订单消息</el-radio-button>
          <el-radio-button value="promotion">促销通知</el-radio-button>
        </el-radio-group>
        <el-button type="danger" plain :disabled="selectedIds.length === 0" @click="batchDelete">
          批量删除
        </el-button>
      </div>

      <!-- 消息列表 -->
      <el-table
        :data="filteredMessages"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column prop="type" label="类型" width="110">
          <template #default="{ row }">
            <el-tag :type="tagType(row.type)" size="small">
              {{ typeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="消息标题" min-width="200">
          <template #default="{ row }">
            <span :class="{ 'unread-title': !row.read }">
              {{ row.title }}
              <el-badge v-if="!row.read" is-dot class="unread-dot" />
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容摘要" min-width="250">
          <template #default="{ row }">
            <span class="content-preview">{{ row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="readMessage(row)">查看</el-button>
            <el-button v-if="!row.read" size="small" link @click="markRead(row)">标为已读</el-button>
            <el-button size="small" type="danger" link @click="deleteMessage(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="filteredMessages.length === 0" description="暂无消息" />

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </div>

    <!-- 消息详情对话框 -->
    <el-dialog v-model="showDetail" title="消息详情" width="500px">
      <div v-if="currentMessage" class="message-detail">
        <div class="detail-header">
          <h3>{{ currentMessage.title }}</h3>
          <el-tag :type="tagType(currentMessage.type)" size="small">
            {{ typeLabel(currentMessage.type) }}
          </el-tag>
        </div>
        <p class="detail-content">{{ currentMessage.content }}</p>
        <p class="detail-time">{{ currentMessage.createdAt }}</p>
      </div>
      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
        <el-button type="danger" @click="deleteMessage(currentMessage!); showDetail = false">删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage as Msg, ElMessageBox } from 'element-plus'

interface Message {
  id: number
  type: 'system' | 'order' | 'promotion'
  title: string
  content: string
  read: boolean
  createdAt: string
}

const filterType = ref('')
const showDetail = ref(false)
const currentMessage = ref<Message | null>(null)
const selectedIds = ref<number[]>([])

const pagination = reactive({ page: 1, size: 10, total: 0 })

const messages = ref<Message[]>([
  { id: 1, type: 'system', title: '系统维护通知', content: '系统将于2026年5月20日凌晨2:00-4:00进行维护升级，届时将暂停服务，请提前做好准备。', read: false, createdAt: '2026-05-15 10:00:00' },
  { id: 2, type: 'order', title: '订单支付成功', content: '您的订单 ORD20260510001 已支付成功，感谢您的购买！', read: false, createdAt: '2026-05-14 15:30:00' },
  { id: 3, type: 'promotion', title: '暑期特惠活动', content: '暑期特惠来袭！全场题库8折优惠，活动时间：5月20日-6月30日，快来选购吧！', read: true, createdAt: '2026-05-13 09:00:00' },
  { id: 4, type: 'system', title: '新功能上线', content: '题库导入功能已全新升级，支持批量导入和自动解析，快去体验吧！', read: true, createdAt: '2026-05-12 14:00:00' },
  { id: 5, type: 'order', title: '退款处理通知', content: '您的订单 ORD20260514005 退款申请已通过，预计1-3个工作日到账。', read: false, createdAt: '2026-05-15 08:30:00' },
  { id: 6, type: 'promotion', title: '邀请有礼', content: '邀请好友注册可获得积分奖励，好友首次购买双方均可获得优惠券！', read: true, createdAt: '2026-05-11 11:00:00' },
  { id: 7, type: 'system', title: '账户安全提醒', content: '检测到您的账户在新设备上登录，如非本人操作请及时修改密码。', read: false, createdAt: '2026-05-15 07:00:00' },
])

pagination.total = messages.value.length

const unreadCount = computed(() => messages.value.filter(m => !m.read).length)

const filteredMessages = computed(() => {
  let result = messages.value
  if (filterType.value) {
    result = result.filter(m => m.type === filterType.value)
  }
  return result
})

function tagType(type: string) {
  return { system: 'info', order: 'warning', promotion: 'danger' }[type] || 'info'
}
function typeLabel(type: string) {
  return { system: '系统通知', order: '订单消息', promotion: '促销通知' }[type] || type
}
function handleFilter() { pagination.page = 1 }

function handleSelectionChange(val: Message[]) {
  selectedIds.value = val.map(m => m.id)
}

function readMessage(msg: Message) {
  msg.read = true
  currentMessage.value = msg
  showDetail.value = true
}

function markRead(msg: Message) {
  msg.read = true
  Msg.success('已标为已读')
}

async function markAllRead() {
  await ElMessageBox.confirm('确认将所有消息标为已读？', '提示', { type: 'info' })
  messages.value.forEach(m => m.read = true)
  Msg.success('已全部标为已读')
}

async function deleteMessage(msg: Message | null) {
  if (!msg) return
  await ElMessageBox.confirm('确认删除该消息？', '提示', { type: 'warning' })
  const idx = messages.value.findIndex(m => m.id === msg.id)
  if (idx !== -1) {
    messages.value.splice(idx, 1)
    pagination.total = messages.value.length
    Msg.success('删除成功')
  }
}

async function batchDelete() {
  if (selectedIds.value.length === 0) return
  await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条消息？`, '提示', { type: 'warning' })
  messages.value = messages.value.filter(m => !selectedIds.value.includes(m.id))
  selectedIds.value = []
  pagination.total = messages.value.length
  Msg.success('批量删除成功')
}
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
.filter-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.unread-title { font-weight: 600; }
.unread-dot { margin-left: 6px; }
.content-preview { color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; max-width: 300px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
.message-detail { padding: 10px 0; }
.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.detail-header h3 { margin: 0; }
.detail-content { color: #303133; line-height: 1.8; }
.detail-time { color: #999; font-size: 12px; margin-top: 16px; }
</style>
