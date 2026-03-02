<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <q-icon name="eco" size="48px" color="white" />
        <h4 class="text-white q-mt-sm q-mb-none">Smart Farming</h4>
        <p class="text-white-7">Admin Dashboard</p>
      </div>

      <q-form @submit="handleLogin" class="q-pa-lg">
        <q-input
          v-model="email"
          label="Email"
          type="email"
          outlined
          dense
          class="q-mb-md"
          :rules="[val => !!val || 'Vui lòng nhập email']"
        >
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input
          v-model="password"
          label="Mật khẩu"
          :type="showPassword ? 'text' : 'password'"
          outlined
          dense
          class="q-mb-lg"
          :rules="[val => !!val || 'Vui lòng nhập mật khẩu']"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-banner v-if="errorMsg" dense class="bg-negative text-white q-mb-md" rounded>
          {{ errorMsg }}
        </q-banner>

        <q-btn
          type="submit"
          color="primary"
          label="Đăng nhập"
          class="full-width"
          size="lg"
          :loading="loading"
          unelevated
        />
      </q-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  try {
    await authStore.login(email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (err) {
    const detail = err.response?.data?.detail || err.message
    errorMsg.value = typeof detail === 'string' ? detail : 'Đăng nhập thất bại'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32px;
  text-align: center;
}

.text-white-7 {
  color: rgba(255, 255, 255, 0.7);
}
</style>
