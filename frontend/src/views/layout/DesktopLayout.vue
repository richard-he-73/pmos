<template>
  <t-layout class="desktop-layout">
    <Sidebar />
    <t-layout>
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

<style scoped>
.desktop-layout { height: 100vh; }
.main-content {
  padding: var(--pmos-spacing-lg);
  overflow-y: auto;
}
</style>
