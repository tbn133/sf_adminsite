import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('access_token') || '')
  const refreshToken = ref(localStorage.getItem('refresh_token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.is_admin === true)

  async function login(email, password) {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password })
    const data = response.data

    accessToken.value = data.access_token
    refreshToken.value = data.refresh_token
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)

    await fetchUser()
  }

  async function fetchUser() {
    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken.value}` },
    })
    user.value = response.data
    localStorage.setItem('user', JSON.stringify(response.data))

    if (!response.data.is_admin) {
      logout()
      throw new Error('Tài khoản không có quyền admin')
    }
  }

  async function refresh() {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refresh_token: refreshToken.value,
      })
      accessToken.value = response.data.access_token
      localStorage.setItem('access_token', response.data.access_token)
      if (response.data.refresh_token) {
        refreshToken.value = response.data.refresh_token
        localStorage.setItem('refresh_token', response.data.refresh_token)
      }
      return true
    } catch {
      logout()
      return false
    }
  }

  function logout() {
    accessToken.value = ''
    refreshToken.value = ''
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    isAdmin,
    login,
    fetchUser,
    refresh,
    logout,
  }
})
