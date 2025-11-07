<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Dashboard</div>

    <!-- Stats Cards -->
    <div class="row q-gutter-md q-mb-lg">
      <q-card class="col-12 col-sm-6 col-md-3">
        <q-card-section>
          <div class="text-h6 text-grey-7">Tổng thiết bị</div>
          <div class="text-h3 text-primary">{{ stats?.total_devices || 0 }}</div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6 col-md-3">
        <q-card-section>
          <div class="text-h6 text-grey-7">Thiết bị online</div>
          <div class="text-h3 text-positive">{{ stats?.online_devices || 0 }}</div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6 col-md-3">
        <q-card-section>
          <div class="text-h6 text-grey-7">Thiết bị offline</div>
          <div class="text-h3 text-negative">{{ stats?.offline_devices || 0 }}</div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6 col-md-3">
        <q-card-section>
          <div class="text-h6 text-grey-7">Cảnh báo</div>
          <div class="text-h3 text-warning">{{ stats?.active_alerts || 0 }}</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Charts Row -->
    <div class="row q-gutter-md">
      <q-card class="col-12 col-md-6">
        <q-card-section>
          <div class="text-h6">Thống kê thiết bị</div>
        </q-card-section>
        <q-card-section>
          <div class="text-body2">
            <div class="row q-mb-sm">
              <div class="col-6">Lịch trình: {{ stats?.total_schedules || 0 }}</div>
              <div class="col-6">Rules: {{ stats?.total_rules || 0 }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-md-6">
        <q-card-section>
          <div class="text-h6">Thiết bị gần đây</div>
        </q-card-section>
        <q-card-section>
          <q-list v-if="devices.length > 0">
            <q-item v-for="device in devices.slice(0, 5)" :key="device.id">
              <q-item-section avatar>
                <q-icon :name="device.online ? 'check_circle' : 'cancel'" 
                        :color="device.online ? 'positive' : 'negative'" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ device.name }}</q-item-label>
                <q-item-label caption>{{ device.device_id }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round dense icon="visibility" 
                       :to="{ name: 'device-detail', params: { deviceId: device.device_id } }" />
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-grey-6">Chưa có thiết bị</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Quick Actions -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Thao tác nhanh</div>
      </q-card-section>
      <q-card-section>
        <div class="row q-gutter-sm">
          <q-btn color="primary" label="Xem tất cả thiết bị" 
                 icon="devices" :to="{ name: 'devices' }" />
          <q-btn color="secondary" label="Quản lý lịch trình" 
                 icon="schedule" :to="{ name: 'schedules' }" />
          <q-btn color="accent" label="Quản lý Rules" 
                 icon="rule" :to="{ name: 'rules' }" />
          <q-btn color="positive" label="Xuất dữ liệu" 
                 icon="download" :to="{ name: 'export' }" />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
const { stats, devices } = appStore

onMounted(async () => {
  await appStore.fetchStats()
  await appStore.fetchDevices()
  appStore.initWebSocket()
})
</script>

