<template>
  <q-btn-dropdown
    flat
    round
    dense
    icon="notifications"
    class="toolbar-btn"
    size="md"
    dropdown-icon="none"
    :ripple="false"
    auto-close
  >
    <q-badge v-if="unreadCount > 0" color="red-6" floating rounded>
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </q-badge>
    <q-tooltip>{{ $t('notification.title') }}</q-tooltip>

    <template #default>
      <q-card class="notification-dropdown" style="width: 380px; max-width: 90vw">
        <!-- Header -->
        <q-card-section class="notification-header row items-center q-pb-none">
          <div class="text-h6">{{ $t('notification.title') }}</div>
          <q-space />
          <q-btn
            v-if="unreadCount > 0"
            flat
            dense
            size="sm"
            :label="$t('notification.markAllRead')"
            color="primary"
            @click="handleMarkAllAsRead"
          />
        </q-card-section>

        <q-separator />

        <!-- Tabs -->
        <q-tabs
          v-model="tab"
          dense
          class="text-grey-7"
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab name="all" :label="`${$t('notification.tabs.all')} (${notifications.length})`" />
          <q-tab name="unread" :label="`${$t('notification.tabs.unread')} (${unreadCount})`" />
        </q-tabs>

        <q-separator />

        <!-- Notification List -->
        <q-card-section class="notification-list q-pa-none">
          <q-scroll-area style="height: 400px; max-height: 60vh">
            <!-- Loading State -->
            <div v-if="loading" class="q-pa-md text-center">
              <q-spinner color="primary" size="md" />
              <div class="text-caption text-grey-6 q-mt-sm">{{ $t('notification.loading') }}</div>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="displayedNotifications.length === 0"
              class="q-pa-lg text-center text-grey-6"
            >
              <q-icon name="notifications_none" size="64px" color="grey-4" />
              <div class="text-subtitle1 q-mt-sm">{{ $t('notification.empty.title') }}</div>
              <div class="text-caption">
                {{
                  tab === 'unread' ? $t('notification.empty.unread') : $t('notification.empty.all')
                }}
              </div>
            </div>

            <!-- Notification Items -->
            <q-list v-else separator>
              <q-item
                v-for="notification in displayedNotifications"
                :key="notification.id"
                clickable
                :class="{ 'bg-blue-1': !notification.read }"
                @click="handleNotificationClick(notification)"
              >
                <q-item-section avatar>
                  <q-avatar :color="getNotificationColor(notification.type)" text-color="white">
                    <q-icon :name="getNotificationIcon(notification.type)" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ notification.title }}
                  </q-item-label>
                  <q-item-label caption lines="2">
                    {{ notification.message }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6 q-mt-xs">
                    <q-icon name="access_time" size="14px" />
                    {{ formatTime(notification.createdAt) }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="row items-center q-gutter-xs">
                    <!-- Unread indicator -->
                    <q-icon v-if="!notification.read" name="circle" color="primary" size="10px" />

                    <!-- Actions Menu -->
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      icon="more_vert"
                      @click.stop="showNotificationMenu(notification, $event)"
                    >
                      <q-menu auto-close>
                        <q-list dense style="min-width: 150px">
                          <q-item
                            v-if="!notification.read"
                            clickable
                            @click="handleMarkAsRead(notification.id)"
                          >
                            <q-item-section avatar>
                              <q-icon name="done" size="20px" />
                            </q-item-section>
                            <q-item-section>{{
                              $t('notification.actions.markRead')
                            }}</q-item-section>
                          </q-item>
                          <q-item v-else clickable @click="handleMarkAsUnread(notification.id)">
                            <q-item-section avatar>
                              <q-icon name="mark_email_unread" size="20px" />
                            </q-item-section>
                            <q-item-section>{{
                              $t('notification.actions.markUnread')
                            }}</q-item-section>
                          </q-item>
                          <q-separator />
                          <q-item clickable @click="handleDelete(notification.id)">
                            <q-item-section avatar>
                              <q-icon name="delete" color="negative" size="20px" />
                            </q-item-section>
                            <q-item-section>{{ $t('notification.actions.delete') }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card-section>

        <!-- Footer -->
        <q-separator />
        <q-card-actions v-if="notifications.length > 0" align="center">
          <q-btn
            flat
            dense
            color="negative"
            :label="$t('notification.actions.deleteAll')"
            icon="delete_sweep"
            @click="handleClearAll"
          />
        </q-card-actions>
      </q-card>
    </template>
  </q-btn-dropdown>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { formatDistanceToNow } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

const $q = useQuasar()
const { t, locale } = useI18n()
const notificationStore = useNotificationStore()

// State
const tab = ref('all')

// Computed
const notifications = computed(() => notificationStore.sortedNotifications)
const unreadCount = computed(() => notificationStore.unreadCount)
const loading = computed(() => notificationStore.loading)

const displayedNotifications = computed(() => {
  if (tab.value === 'unread') {
    return notificationStore.unreadNotifications
  }
  return notificationStore.sortedNotifications
})

// Methods
function getNotificationIcon(type) {
  const icons = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
    device: 'memory',
    rule: 'rule',
    schedule: 'schedule',
    system: 'settings',
  }
  return icons[type] || 'notifications'
}

function getNotificationColor(type) {
  const colors = {
    info: 'blue-6',
    success: 'green-6',
    warning: 'orange-6',
    error: 'red-6',
    device: 'purple-6',
    rule: 'teal-6',
    schedule: 'indigo-6',
    system: 'grey-6',
  }
  return colors[type] || 'blue-6'
}

function formatTime(timestamp) {
  try {
    const dateFnsLocale = locale.value === 'vi' ? vi : enUS
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: dateFnsLocale,
    })
  } catch (error) {
    return timestamp
  }
}

function handleNotificationClick(notification) {
  if (!notification.read) {
    handleMarkAsRead(notification.id)
  }
  // Navigate or perform action based on notification.data
  if (notification.data?.route) {
    // Handle navigation
    console.log('Navigate to:', notification.data.route)
  }
}

async function handleMarkAsRead(notificationId) {
  try {
    await notificationStore.markAsRead(notificationId)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('notification.messages.markReadError'),
      position: 'top',
    })
  }
}

async function handleMarkAsUnread(notificationId) {
  try {
    await notificationStore.markAsUnread(notificationId)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('notification.messages.markUnreadError'),
      position: 'top',
    })
  }
}

async function handleMarkAllAsRead() {
  try {
    await notificationStore.markAllAsRead()
    $q.notify({
      type: 'positive',
      message: t('notification.messages.markAllReadSuccess'),
      position: 'top',
      timeout: 1500,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('notification.messages.markAllReadError'),
      position: 'top',
    })
  }
}

async function handleDelete(notificationId) {
  try {
    await notificationStore.deleteNotification(notificationId)
    $q.notify({
      type: 'positive',
      message: t('notification.messages.deleteSuccess'),
      position: 'top',
      timeout: 1500,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('notification.messages.deleteError'),
      position: 'top',
    })
  }
}

async function handleClearAll() {
  $q.dialog({
    title: t('common.confirm'),
    message: t('notification.messages.confirmClearAll'),
    cancel: {
      flat: true,
      label: t('common.cancel'),
    },
    ok: {
      flat: true,
      label: t('notification.actions.delete'),
      color: 'negative',
    },
  }).onOk(async () => {
    try {
      await notificationStore.clearAll()
      $q.notify({
        type: 'positive',
        message: t('notification.messages.clearAllSuccess'),
        position: 'top',
        timeout: 1500,
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: t('notification.messages.clearAllError'),
        position: 'top',
      })
    }
  })
}

function showNotificationMenu(notification, event) {
  // Menu is handled by q-menu component
}

// Lifecycle
onMounted(() => {
  // Fetch notifications when component mounts
  notificationStore.fetchNotifications()
})
</script>

<style scoped>
.notification-dropdown {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification-header {
  padding: 16px;
}

.notification-list {
  background: white;
}

.q-item {
  transition: background-color 0.2s;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.bg-blue-1 {
  background-color: #e3f2fd;
}

.bg-blue-1:hover {
  background-color: #bbdefb;
}
</style>
