<template>
  <div class="dashboard-page">
    <t-card :bordered="false" class="welcome-card">
      <t-row justify="center" align="middle">
        <t-col>
          <h1>欢迎使用 PMOS</h1>
          <p>Project Management Operating System</p>
        </t-col>
      </t-row>
    </t-card>
  </div>
</template>

<style scoped>
.dashboard-page { padding: var(--pmos-spacing-md); }
.welcome-card { text-align: center; padding: var(--pmos-spacing-xl); }
h1 { margin: 0; font-size: var(--pmos-font-size-xl); }
p { color: var(--pmos-text-secondary); }
</style>
