<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Xuất dữ liệu</div>

    <q-card>
      <q-card-section>
        <div class="text-h6">Xuất CSV</div>
      </q-card-section>
      <q-card-section>
        <q-select
          v-model="selectedDevice"
          :options="deviceOptions"
          label="Chọn thiết bị (để trống = tất cả)"
          outlined
          class="q-mb-md"
          clearable
        />
        <q-input
          v-model.number="days"
          type="number"
          label="Số ngày"
          outlined
          class="q-mb-md"
        />
        <q-btn
          color="primary"
          icon="download"
          label="Xuất CSV"
          @click="exportCSV"
          :loading="exporting"
        />
      </q-card-section>
    </q-card>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Thống kê</div>
      </q-card-section>
      <q-card-section>
        <q-select
          v-model="selectedDeviceForStats"
          :options="deviceOptions"
          label="Chọn thiết bị"
          outlined
          class="q-mb-md"
          clearable
        />
        <q-input
          v-model.number="daysForStats"
          type="number"
          label="Số ngày"
          outlined
          class="q-mb-md"
        />
        <q-btn
          color="secondary"
          icon="analytics"
          label="Xem thống kê"
          @click="viewStats"
          :loading="loadingStats"
        />
      </q-card-section>
    </q-card>

    <q-card v-if="stats" class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Kết quả thống kê</div>
      </q-card-section>
      <q-card-section>
        <pre>{{ JSON.stringify(stats, null, 2) }}</pre>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { exportAPI } from '../services/api'
import { useQuasar } from 'quasar'

const appStore = useAppStore()
const $q = useQuasar()

const { devices } = appStore
const selectedDevice = ref(null)
const selectedDeviceForStats = ref(null)
const days = ref(7)
const daysForStats = ref(7)
const exporting = ref(false)
const loadingStats = ref(false)
const stats = ref(null)

const deviceOptions = computed(() => 
  devices.map(d => ({ label: d.name, value: d.device_id }))
)

async function exportCSV() {
  try {
    exporting.value = true
    const response = await exportAPI.exportCSV(
      selectedDevice.value?.value || null,
      days.value
    )
    
    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sensor_data_${selectedDevice.value?.value || 'all'}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    
    $q.notify({ type: 'positive', message: 'Đã xuất CSV thành công' })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Lỗi: ' + error.message })
  } finally {
    exporting.value = false
  }
}

async function viewStats() {
  try {
    loadingStats.value = true
    const response = await exportAPI.exportStats(
      selectedDeviceForStats.value?.value || null,
      daysForStats.value
    )
    stats.value = response.data
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Lỗi: ' + error.message })
  } finally {
    loadingStats.value = false
  }
}

onMounted(() => {
  appStore.fetchDevices()
})
</script>

