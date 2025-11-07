import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminAPI } from '../services/api'
import wsService from '../services/websocket'

export const useAppStore = defineStore('app', () => {
  const stats = ref(null)
  const devices = ref([])
  const schedules = ref([])
  const rules = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const onlineDevices = computed(() => 
    devices.value.filter(d => d.online)
  )
  const offlineDevices = computed(() => 
    devices.value.filter(d => !d.online)
  )

  // Actions
  async function fetchStats() {
    try {
      loading.value = true
      const response = await adminAPI.getStats()
      stats.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching stats:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchDevices() {
    try {
      loading.value = true
      const response = await adminAPI.getDevices()
      devices.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching devices:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchSchedules() {
    try {
      loading.value = true
      const response = await adminAPI.getSchedules()
      schedules.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching schedules:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchRules() {
    try {
      loading.value = true
      const response = await adminAPI.getRules()
      rules.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching rules:', err)
    } finally {
      loading.value = false
    }
  }

  function initWebSocket() {
    wsService.connect()
    wsService.on('sensor_data', (data) => {
      // Update device sensor data in real-time
      const device = devices.value.find(d => d.device_id === data.device_id)
      if (device) {
        // Trigger reactivity update
        devices.value = [...devices.value]
      }
    })
  }

  return {
    stats,
    devices,
    schedules,
    rules,
    loading,
    error,
    onlineDevices,
    offlineDevices,
    fetchStats,
    fetchDevices,
    fetchSchedules,
    fetchRules,
    initWebSocket
  }
})

