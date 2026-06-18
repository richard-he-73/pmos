<template>
  <div class="login-page" :style="{ background: themeBg }">
    <t-card class="login-card" :bordered="false">
      <div class="login-header">
        <h1>PMOS</h1>
        <p>Project Management Operating System</p>
      </div>
      <t-form :data="formData" :rules="rules" ref="formRef" @submit="handleLogin">
        <t-form-item name="username" label="用户名">
          <t-input v-model="formData.username" placeholder="请输入用户名" size="large">
            <template #prefix-icon><t-icon name="user" /></template>
          </t-input>
        </t-form-item>
        <t-form-item name="password" label="密码">
          <t-input v-model="formData.password" type="password" placeholder="请输入密码" size="large">
            <template #prefix-icon><t-icon name="lock" /></template>
          </t-input>
        </t-form-item>
        <t-form-item>
          <t-button theme="primary" type="submit" block size="large" :loading="loading">
            {{ loading ? '登录中...' : '登 录' }}
          </t-button>
        </t-form-item>
      </t-form>
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const loading = ref(false)
const errorMsg = ref('')

const themeBg = ref(
  themeStore.currentTheme === 'dark'
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
)

const formData = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin({ validateResult }: { validateResult: boolean }) {
  if (!validateResult) return
  loading.value = true
  errorMsg.value = ''
  try {
    await authStore.loginAction(formData)
    router.push('/dashboard')
  } catch (err: any) {
    errorMsg.value = err.response?.data?.detail || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.login-card {
  width: 400px;
  max-width: 90vw;
  padding: var(--pmos-spacing-xl);
}
.login-header {
  text-align: center;
  margin-bottom: var(--pmos-spacing-lg);
}
.login-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.login-header p {
  margin: var(--pmos-spacing-sm) 0 0;
  color: var(--pmos-text-secondary);
  font-size: var(--pmos-font-size-sm);
}
.error-msg {
  color: var(--pmos-error);
  text-align: center;
  font-size: var(--pmos-font-size-sm);
}
</style>
