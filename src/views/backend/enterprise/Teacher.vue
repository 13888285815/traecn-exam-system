<template>
  <div class="page-container">
    <div class="page-header">
      <h2>老师管理</h2>
      <p class="page-desc">管理企业教师信息，包括教师资质和课程分配</p>
    </div>
    <div class="page-content">
      <el-alert title="该功能正在开发中，敬请期待" type="info" :closable="false" show-icon />
      <el-table :data="[]" stripe style="margin-top: 20px">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="status" label="状态" />
        <el-table-column prop="createdAt" label="创建时间" />
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
