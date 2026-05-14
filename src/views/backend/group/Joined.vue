<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我加入的群组</h2>
      <p class="page-desc">查看您加入的所有群组及其最新动态</p>
    </div>
    <div class="page-content">
      <el-alert title="该功能正在开发中，敬请期待" type="info" :closable="false" show-icon />
      <el-table :data="[]" stripe style="margin-top: 20px">
        <el-table-column prop="name" label="群组名称" />
        <el-table-column prop="owner" label="群主" width="120" />
        <el-table-column prop="memberCount" label="成员数量" width="120" />
        <el-table-column prop="joinedAt" label="加入时间" />
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button size="small" type="primary">进入</el-button>
            <el-button size="small" type="danger">退出</el-button>
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
