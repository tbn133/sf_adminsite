<template>
  <q-page class="dashboard-page">
    <div class="dashboard-container q-pa-lg">
      <!-- Header -->
      <div class="page-header q-mb-xl">
        <div>
          <div class="text-h3 text-weight-bold text-grey-9 q-mb-xs">
            <q-icon name="dashboard" size="36px" class="q-mr-sm" color="primary" />
            Dashboard
          </div>
          <div class="text-body1 text-grey-6">Tổng quan hệ thống Smart Farming của bạn</div>
        </div>
        <q-space />
        <q-btn
          color="primary"
          icon="refresh"
          label="Làm mới"
          unelevated
          rounded
          @click="refresh"
          :loading="loading"
          class="refresh-btn"
          size="md"
        />
      </div>

      <!-- Stats Cards -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card stat-card-devices" flat>
            <q-card-section class="q-pa-lg">
              <div class="row items-start justify-between q-mb-md">
                <div class="stat-icon-wrapper bg-primary-light">
                  <q-icon name="devices" size="28px" color="primary" />
                </div>
                <q-chip dense color="primary" text-color="white" class="text-weight-bold">
                  +12%
                </q-chip>
              </div>
              <div class="text-overline text-grey-6 q-mb-xs">Tổng thiết bị</div>
              <div class="text-h3 text-weight-bold text-grey-9">{{ stats?.total_devices || 0 }}</div>
              <div class="text-caption text-grey-6 q-mt-sm">Đang hoạt động trong hệ thống</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card stat-card-online" flat>
            <q-card-section class="q-pa-lg">
              <div class="row items-start justify-between q-mb-md">
                <div class="stat-icon-wrapper bg-positive-light">
                  <q-icon name="check_circle" size="28px" color="positive" />
                </div>
                <q-badge color="positive" rounded class="pulse-badge">
                  <q-icon name="fiber_manual_record" size="8px" />
                </q-badge>
              </div>
              <div class="text-overline text-grey-6 q-mb-xs">Thiết bị online</div>
              <div class="text-h3 text-weight-bold text-positive">{{ stats?.online_devices || 0 }}</div>
              <div class="text-caption text-grey-6 q-mt-sm">Đang kết nối và hoạt động</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card stat-card-offline" flat>
            <q-card-section class="q-pa-lg">
              <div class="row items-start justify-between q-mb-md">
                <div class="stat-icon-wrapper bg-negative-light">
                  <q-icon name="cancel" size="28px" color="negative" />
                </div>
                <q-chip dense color="negative" text-color="white" class="text-weight-bold">
                  -5%
                </q-chip>
              </div>
              <div class="text-overline text-grey-6 q-mb-xs">Thiết bị offline</div>
              <div class="text-h3 text-weight-bold text-negative">{{ stats?.offline_devices || 0 }}</div>
              <div class="text-caption text-grey-6 q-mt-sm">Mất kết nối hoặc tắt</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="stat-card stat-card-warning" flat>
            <q-card-section class="q-pa-lg">
              <div class="row items-start justify-between q-mb-md">
                <div class="stat-icon-wrapper bg-warning-light">
                  <q-icon name="warning" size="28px" color="warning" />
                </div>
                <q-badge color="warning" rounded text-color="white">
                  Mới
                </q-badge>
              </div>
              <div class="text-overline text-grey-6 q-mb-xs">Cảnh báo</div>
              <div class="text-h3 text-weight-bold text-warning">{{ stats?.active_alerts || 0 }}</div>
              <div class="text-caption text-grey-6 q-mt-sm">Cần xử lý ngay</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <!-- System Stats -->
        <div class="col-12 col-md-4">
          <q-card class="info-card" flat>
            <q-card-section class="q-pb-md">
              <div class="row items-center justify-between">
                <div class="text-h6 text-weight-bold text-grey-9">Thống kê hệ thống</div>
                <q-icon name="bar_chart" size="24px" color="grey-6" />
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <div class="mini-stat-card bg-purple-1">
                    <div class="row items-center no-wrap">
                      <div class="mini-stat-icon bg-purple text-white">
                        <q-icon name="schedule" size="24px" />
                      </div>
                      <div class="q-ml-md">
                        <div class="text-h5 text-weight-bold text-purple-9">{{ stats?.total_schedules || 0 }}</div>
                        <div class="text-caption text-grey-7">Lịch trình đang chạy</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="mini-stat-card bg-teal-1">
                    <div class="row items-center no-wrap">
                      <div class="mini-stat-icon bg-teal text-white">
                        <q-icon name="settings" size="24px" />
                      </div>
                      <div class="q-ml-md">
                        <div class="text-h5 text-weight-bold text-teal-9">{{ stats?.total_rules || 0 }}</div>
                        <div class="text-caption text-grey-7">Quy tắc tự động</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Recent Devices -->
        <div class="col-12 col-md-8">
          <q-card class="info-card devices-card" flat>
            <q-card-section class="q-pb-md">
              <div class="row items-center justify-between">
                <div class="text-h6 text-weight-bold text-grey-9">Thiết bị gần đây</div>
                <q-btn
                  flat
                  dense
                  color="primary"
                  label="Xem tất cả"
                  :to="{ name: 'devices' }"
                  class="text-weight-medium"
                />
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <q-list v-if="devices && devices.length > 0" class="modern-list">
                <q-item
                  v-for="device in devices.slice(0, 5)"
                  :key="device.id"
                  clickable
                  v-ripple
                  :to="{ name: 'device-detail', params: { deviceId: device.device_id } }"
                  class="modern-list-item q-mb-sm"
                >
                  <q-item-section avatar>
                    <q-avatar
                      size="48px"
                      :color="device.online ? 'positive' : 'grey-4'"
                      text-color="white"
                    >
                      <q-icon name="devices" size="24px" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold text-grey-9">
                      {{ device.name || 'Unnamed Device' }}
                    </q-item-label>
                    <q-item-label caption class="text-grey-6">
                      <q-icon name="tag" size="14px" class="q-mr-xs" />
                      {{ device.device_id }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="column items-end">
                      <q-badge
                        :color="device.online ? 'positive' : 'grey-5'"
                        text-color="white"
                        rounded
                        class="q-px-md"
                      >
                        <q-icon
                          :name="device.online ? 'fiber_manual_record' : 'cancel'"
                          size="10px"
                          class="q-mr-xs"
                        />
                        {{ device.online ? 'Online' : 'Offline' }}
                      </q-badge>
                      <div class="text-caption text-grey-6 q-mt-xs">
                        Cập nhật 5 phút trước
                      </div>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="empty-state">
                <q-icon name="devices_other" size="64px" color="grey-5" class="q-mb-md" />
                <div class="text-h6 text-grey-6 q-mb-xs">Chưa có thiết bị</div>
                <div class="text-caption text-grey-5">Thêm thiết bị đầu tiên của bạn</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Quick Actions -->
      <q-card class="info-card quick-actions-card" flat>
        <q-card-section class="q-pb-md">
          <div class="row items-center">
            <q-icon name="bolt" size="28px" color="primary" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold text-grey-9">Thao tác nhanh</div>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-3">
              <q-btn
                color="primary"
                label="Xem thiết bị"
                icon="devices"
                :to="{ name: 'devices' }"
                unelevated
                rounded
                class="action-btn full-width"
                size="md"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-btn
                color="purple"
                label="Lịch trình"
                icon="schedule"
                :to="{ name: 'schedules' }"
                unelevated
                rounded
                class="action-btn full-width"
                size="md"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-btn
                color="teal"
                label="Quy tắc"
                icon="settings"
                :to="{ name: 'rules' }"
                unelevated
                rounded
                class="action-btn full-width"
                size="md"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-btn
                color="orange"
                label="Xuất dữ liệu"
                icon="file_download"
                :to="{ name: 'export' }"
                unelevated
                rounded
                class="action-btn full-width"
                size="md"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
const { stats, devices, loading } = storeToRefs(appStore)

async function refresh() {
  await Promise.all([
    appStore.fetchStats(),
    appStore.fetchDevices()
  ])
}

onMounted(async () => {
  await refresh()
  appStore.initWebSocket()
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.dashboard-container {
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.refresh-btn {
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Stat Cards */
.stat-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-primary-light {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.bg-positive-light {
  background: linear-gradient(135deg, rgba(33, 186, 69, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%);
}

.bg-negative-light {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%);
}

.bg-warning-light {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(245, 124, 0, 0.1) 100%);
}

.pulse-badge {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Info Cards */
.info-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Mini Stat Cards */
.mini-stat-card {
  padding: 1.25rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.mini-stat-card:hover {
  transform: translateX(4px);
}

.mini-stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Modern List */
.modern-list {
  padding: 0;
}

.modern-list-item {
  border-radius: 12px;
  background: #fafafa;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.modern-list-item:hover {
  background: #f5f5f5;
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateX(4px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

/* Quick Actions */
.quick-actions-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
}

.action-btn {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive */
@media (max-width: 1023px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .stat-card:hover {
    transform: translateY(-4px);
  }
}

@media (max-width: 599px) {
  .dashboard-container {
    padding: 1rem !important;
  }

  .text-h3 {
    font-size: 1.75rem;
  }
}
</style>

