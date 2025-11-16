import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminAPI } from '../services/api'
import wsService from '../services/websocket'
import { useNotificationStore } from './notification'
import i18n from '../i18n'

export const useAppStore = defineStore('app', () => {
  const stats = ref(null)
  const devices = ref([])
  const schedules = ref([])
  const rules = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const onlineDevices = computed(() => devices.value.filter(d => d.online))
  const offlineDevices = computed(() => devices.value.filter(d => !d.online))

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
    const notificationStore = useNotificationStore()
    const { t } = i18n.global

    wsService.connect()

    // Sensor data updates
    wsService.on('sensor_data', data => {
      // Update device sensor data in real-time
      const device = devices.value.find(d => d.device_id === data.device_id)
      if (device) {
        // Trigger reactivity update
        devices.value = [...devices.value]
      }
    })

    // Real-time notifications
    wsService.on('notification', data => {
      // Add new notification to the store
      notificationStore.addNotification({
        id: data.id,
        type: data.type || 'info',
        title: data.title || t('notification.title'),
        message: data.message,
        createdAt: data.createdAt || new Date().toISOString(),
        data: data.data,
      })
    })

    // Device status changes
    wsService.on('device_status', data => {
      const device = devices.value.find(d => d.device_id === data.device_id)
      if (device) {
        const statusText = data.online
          ? t('notification.templates.deviceOnline')
          : t('notification.templates.deviceOffline')
        notificationStore.addNotification({
          type: data.online ? 'success' : 'warning',
          title: t('notification.types.device'),
          message: t('notification.templates.deviceStatus', {
            deviceId: data.device_id,
            status: statusText,
          }),
          data: {
            deviceId: data.device_id,
            online: data.online,
          },
        })
        device.online = data.online
        devices.value = [...devices.value]
      }
    })

    // Rule triggered
    wsService.on('rule_triggered', data => {
      notificationStore.addNotification({
        type: 'info',
        title: t('notification.mockData.ruleTriggered.title'),
        message: t('notification.templates.ruleTriggered', {
          ruleName: data.rule_name,
          deviceId: data.device_id,
        }),
        data: {
          ruleId: data.rule_id,
          deviceId: data.device_id,
        },
      })
    })

    // Schedule executed
    wsService.on('schedule_executed', data => {
      notificationStore.addNotification({
        type: 'success',
        title: t('notification.mockData.scheduleComplete.title'),
        message: t('notification.templates.scheduleExecuted', {
          scheduleName: data.schedule_name,
        }),
        data: {
          scheduleId: data.schedule_id,
          deviceId: data.device_id,
        },
      })
    })

    // Alerts and warnings
    wsService.on('alert', data => {
      notificationStore.addNotification({
        type: data.severity === 'high' ? 'error' : 'warning',
        title: t('notification.types.warning'),
        message: data.message,
        data: data.data,
      })
    })

    // System notifications
    wsService.on('system_notification', data => {
      notificationStore.addNotification({
        type: 'system',
        title: data.title || t('notification.types.system'),
        message: data.message,
        data: data.data,
      })
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
    initWebSocket,
  }
})
