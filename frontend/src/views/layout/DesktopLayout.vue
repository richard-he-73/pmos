<template>
  <div class="desktop-layout">
    <Sidebar />
    <div class="right-panel">
      <Topbar />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
</script>

<style>
.desktop-layout {
  height: 100vh;
  display: flex;
  flex-direction: row;
}
.right-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
