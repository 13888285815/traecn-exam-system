<template>
  <div class="page-container">
    <div class="page-header">
      <h2>会员设置</h2>
      <p class="page-desc">配置会员等级、权益和价格</p>
    </div>
    <div class="page-content">
      <el-alert title="该功能正在开发中，敬请期待" type="info" :closable="false" show-icon />
      <el-table :data="[]" stripe style="margin-top: 20px">
        <el-table-column prop="name" label="配置项" />
        <el-table-column prop="value" label="配置值" />
        <el-table-column prop="updatedAt" label="更新时间" />
        <el-table-column label="操作" width="200">
          <template #default>
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { margin: 0 0 8px; font-size: 20px; }
.page-desc { color: #999; margin: 0; }
</style>
