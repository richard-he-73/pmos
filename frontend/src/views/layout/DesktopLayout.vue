<template>
  <t-layout class="desktop-layout">
    <Sidebar />
    <t-layout class="right-panel">
      <Topbar />
      <t-content class="main-content">
        <router-view />
      </t-content>
    </t-layout>
  </t-layout>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
</script>

<style>
.desktop-layout {
  height: 100vh !important;
  flex-direction: row !important;
}
.desktop-layout .right-panel {
  flex: 1 !important;
  min-width: 0 !important;
  flex-direction: column !important;
}
.desktop-layout .main-content {
  flex: 1 !important;
  padding: 24px;
  overflow-y: auto;
}
</style>
