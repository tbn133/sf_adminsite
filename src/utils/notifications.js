import { useNotificationStore } from '@/stores/notification'
import { useQuasar } from 'quasar'
import i18n from '@/i18n'

/**
 * Notification Types
 */
export const NotificationType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  DEVICE: 'device',
  RULE: 'rule',
  SCHEDULE: 'schedule',
  SYSTEM: 'system',
}

/**
 * Notification Icons
 */
export const NotificationIcons = {
  [NotificationType.INFO]: 'info',
  [NotificationType.SUCCESS]: 'check_circle',
  [NotificationType.WARNING]: 'warning',
  [NotificationType.ERROR]: 'error',
  [NotificationType.DEVICE]: 'memory',
  [NotificationType.RULE]: 'rule',
  [NotificationType.SCHEDULE]: 'schedule',
  [NotificationType.SYSTEM]: 'settings',
}

/**
 * Notification Colors
 */
export const NotificationColors = {
  [NotificationType.INFO]: 'blue-6',
  [NotificationType.SUCCESS]: 'green-6',
  [NotificationType.WARNING]: 'orange-6',
  [NotificationType.ERROR]: 'red-6',
  [NotificationType.DEVICE]: 'purple-6',
  [NotificationType.RULE]: 'teal-6',
  [NotificationType.SCHEDULE]: 'indigo-6',
  [NotificationType.SYSTEM]: 'grey-6',
}

/**
 * Helper function to show a notification
 * This will both add to the notification center and show a toast
 */
export function notify(options) {
  const $q = useQuasar()
  const notificationStore = useNotificationStore()

  const {
    type = NotificationType.INFO,
    title,
    message,
    showToast = true,
    toastPosition = 'top',
    toastTimeout = 2000,
    data = null,
  } = options

  // Add to notification center
  notificationStore.addNotification({
    type,
    title: title || getDefaultTitle(type),
    message,
    data,
  })

  // Show toast notification if requested
  if (showToast) {
    $q.notify({
      type: getToastType(type),
      message: title ? `${title}: ${message}` : message,
      position: toastPosition,
      timeout: toastTimeout,
    })
  }
}

/**
 * Get default title based on notification type
 */
function getDefaultTitle(type) {
  const { t } = i18n.global
  const titles = {
    [NotificationType.INFO]: t('notification.types.info'),
    [NotificationType.SUCCESS]: t('notification.types.success'),
    [NotificationType.WARNING]: t('notification.types.warning'),
    [NotificationType.ERROR]: t('notification.types.error'),
    [NotificationType.DEVICE]: t('notification.types.device'),
    [NotificationType.RULE]: t('notification.types.rule'),
    [NotificationType.SCHEDULE]: t('notification.types.schedule'),
    [NotificationType.SYSTEM]: t('notification.types.system'),
  }
  return titles[type] || t('notification.title')
}

/**
 * Get toast type for Quasar notify
 */
function getToastType(type) {
  const toastTypes = {
    [NotificationType.INFO]: 'info',
    [NotificationType.SUCCESS]: 'positive',
    [NotificationType.WARNING]: 'warning',
    [NotificationType.ERROR]: 'negative',
    [NotificationType.DEVICE]: 'info',
    [NotificationType.RULE]: 'info',
    [NotificationType.SCHEDULE]: 'info',
    [NotificationType.SYSTEM]: 'info',
  }
  return toastTypes[type] || 'info'
}

/**
 * Shorthand functions for common notification types
 */
export function notifySuccess(message, title, options = {}) {
  const { t } = i18n.global
  notify({
    type: NotificationType.SUCCESS,
    title: title || t('notification.types.success'),
    message,
    ...options,
  })
}

export function notifyError(message, title, options = {}) {
  const { t } = i18n.global
  notify({
    type: NotificationType.ERROR,
    title: title || t('notification.types.error'),
    message,
    ...options,
  })
}

export function notifyWarning(message, title, options = {}) {
  const { t } = i18n.global
  notify({
    type: NotificationType.WARNING,
    title: title || t('notification.types.warning'),
    message,
    ...options,
  })
}

export function notifyInfo(message, title, options = {}) {
  const { t } = i18n.global
  notify({
    type: NotificationType.INFO,
    title: title || t('notification.types.info'),
    message,
    ...options,
  })
}

export function notifyDevice(message, deviceId, options = {}) {
  const { t } = i18n.global
  notify({
    type: NotificationType.DEVICE,
    title: t('notification.types.device'),
    message,
    data: { deviceId },
    ...options,
  })
}

export function notifyRule(message, ruleId, options = {}) {
  const { t } = i18n.global
  notify({
    type: NotificationType.RULE,
    title: t('notification.types.rule'),
    message,
    data: { ruleId },
    ...options,
  })
}

export function notifySchedule(message, scheduleId, options = {}) {
  const { t } = i18n.global
  notify({
    type: NotificationType.SCHEDULE,
    title: t('notification.types.schedule'),
    message,
    data: { scheduleId },
    ...options,
  })
}

/**
 * Get notification icon by type
 */
export function getNotificationIcon(type) {
  return NotificationIcons[type] || 'notifications'
}

/**
 * Get notification color by type
 */
export function getNotificationColor(type) {
  return NotificationColors[type] || 'blue-6'
}
