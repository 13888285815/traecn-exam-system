<template>
  <div class="placeholder-page">
    <el-empty description="暂无订单数据">
      <el-button type="primary" @click="$router.push('/shop')">去商城逛逛</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.placeholder-page {
  padding: 40px 0;
}
</style>
