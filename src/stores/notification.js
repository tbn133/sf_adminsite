import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminAPI } from '@/services/api'
import i18n from '@/i18n'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  })

  const unreadNotifications = computed(() => {
    return sortedNotifications.value.filter(n => !n.read)
  })

  const readNotifications = computed(() => {
    return sortedNotifications.value.filter(n => n.read)
  })

  // Actions
  async function fetchNotifications() {
    loading.value = true
    error.value = null
    try {
      const response = await adminAPI.getNotifications()
      notifications.value = response.data
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch notifications:', err)
      // If API fails, load mock data for development
      loadMockNotifications()
    } finally {
      loading.value = false
    }
  }

  function loadMockNotifications() {
    const { t } = i18n.global
    // Mock notifications for testing
    const mockNotifications = [
      {
        id: '1',
        type: 'device',
        title: t('notification.mockData.deviceNew.title'),
        message: t('notification.mockData.deviceNew.message'),
        read: false,
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
        data: { deviceId: 'FARM001' },
      },
      {
        id: '2',
        type: 'warning',
        title: t('notification.mockData.temperatureWarning.title'),
        message: t('notification.mockData.temperatureWarning.message'),
        read: false,
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
        data: { deviceId: 'FARM002', temperature: 37.5 },
      },
      {
        id: '3',
        type: 'success',
        title: t('notification.mockData.scheduleComplete.title'),
        message: t('notification.mockData.scheduleComplete.message'),
        read: true,
        createdAt: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
        data: { scheduleId: 'SCH001' },
      },
      {
        id: '4',
        type: 'rule',
        title: t('notification.mockData.ruleTriggered.title'),
        message: t('notification.mockData.ruleTriggered.message'),
        read: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
        data: { ruleId: 'RULE001' },
      },
      {
        id: '5',
        type: 'error',
        title: t('notification.mockData.connectionError.title'),
        message: t('notification.mockData.connectionError.message'),
        read: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60000).toISOString(), // 3 hours ago
        data: { deviceId: 'FARM003' },
      },
      {
        id: '6',
        type: 'info',
        title: t('notification.mockData.systemUpdate.title'),
        message: t('notification.mockData.systemUpdate.message'),
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(), // 1 day ago
        data: null,
      },
    ]
    notifications.value = mockNotifications
  }

  async function markAsRead(notificationId) {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
    try {
      await adminAPI.markNotificationAsRead(notificationId)
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      // API failed but we already updated locally (optimistic update)
    }
  }

  async function markAsUnread(notificationId) {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = false
    }
    try {
      await adminAPI.markNotificationAsUnread(notificationId)
    } catch (err) {
      console.error('Failed to mark notification as unread:', err)
      // API failed but we already updated locally (optimistic update)
    }
  }

  async function markAllAsRead() {
    notifications.value.forEach(n => {
      n.read = true
    })
    try {
      await adminAPI.markAllNotificationsAsRead()
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
      // API failed but we already updated locally (optimistic update)
    }
  }

  async function deleteNotification(notificationId) {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
    try {
      await adminAPI.deleteNotification(notificationId)
    } catch (err) {
      console.error('Failed to delete notification:', err)
      // API failed but we already updated locally (optimistic update)
    }
  }

  async function clearAll() {
    notifications.value = []
    try {
      await adminAPI.clearAllNotifications()
    } catch (err) {
      console.error('Failed to clear all notifications:', err)
      // API failed but we already updated locally (optimistic update)
    }
  }

  function addNotification(notification) {
    // Add new notification to the beginning of the list
    const newNotification = {
      id: notification.id || Date.now().toString(),
      type: notification.type || 'info', // info, success, warning, error, device, rule, schedule
      title: notification.title || 'Thông báo',
      message: notification.message,
      read: false,
      createdAt: notification.createdAt || new Date().toISOString(),
      data: notification.data || null,
    }
    notifications.value.unshift(newNotification)
  }

  function removeNotification(notificationId) {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  return {
    // State
    notifications,
    loading,
    error,

    // Computed
    unreadCount,
    sortedNotifications,
    unreadNotifications,
    readNotifications,

    // Actions
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    removeNotification,
  }
})
