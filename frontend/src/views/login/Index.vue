<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
    <div class="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">PMOS</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Project Management Operating System</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">用户名</label>
          <input v-model="form.username" type="text" placeholder="请输入用户名"
            class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码"
            class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            @keyup.enter="handleLogin" />
        </div>

        <p v-if="errorMsg" class="text-red-500 text-sm text-center">{{ errorMsg }}</p>

        <button @click="handleLogin" :disabled="loading"
          class="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition disabled:opacity-50">
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const errorMsg = ref('')

const form = reactive({ username: '', password: '' })

async function handleLogin() {
  if (!form.username || !form.password) { errorMsg.value = '请输入用户名和密码'; return }
  loading.value = true
  errorMsg.value = ''
  try {
    await authStore.loginAction(form)
    router.push('/dashboard')
  } catch {
    errorMsg.value = '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>
