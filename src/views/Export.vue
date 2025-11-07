<template>
  <q-page class="export-page">
    <div class="page-container q-pa-lg">
      <div class="page-header q-mb-xl">
        <div>
          <div class="text-h3 text-weight-bold text-grey-9 q-mb-xs">
            <q-icon name="file_download" size="36px" class="q-mr-sm" color="primary" />
            Xuất dữ liệu
          </div>
          <div class="text-body1 text-grey-6">Export và xem thống kê dữ liệu cảm biến</div>
        </div>
      </div>

      <div class="row q-gutter-md">
      <q-card class="col-12 col-md-6 modern-card" flat>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 text-weight-bold">Xuất CSV</div>
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div class="q-gutter-md">
            <q-select
              v-model="selectedDevice"
              :options="deviceOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Chọn thiết bị"
              outlined
              dense
              clearable
              hint="Để trống để xuất tất cả thiết bị"
            >
              <template v-slot:prepend>
                <q-icon name="devices" />
              </template>
            </q-select>

            <q-input
              v-model.number="days"
              type="number"
              label="Số ngày"
              outlined
              dense
              :rules="[val => val > 0 || 'Vui lòng nhập số ngày lớn hơn 0']"
              hint="Số ngày dữ liệu cần xuất"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" />
              </template>
            </q-input>

            <q-btn
              color="primary"
              icon="download"
              label="Xuất CSV"
              unelevated
              @click="exportCSV"
              :loading="exporting"
              size="md"
              class="full-width"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-md-6 modern-card" flat>
        <q-card-section class="bg-green text-white">
          <div class="text-h6 text-weight-bold">Thống kê</div>
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div class="q-gutter-md">
            <q-select
              v-model="selectedDeviceForStats"
              :options="deviceOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Chọn thiết bị"
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="devices" />
              </template>
            </q-select>

            <q-input
              v-model.number="daysForStats"
              type="number"
              label="Số ngày"
              outlined
              dense
              :rules="[val => val > 0 || 'Vui lòng nhập số ngày lớn hơn 0']"
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" />
              </template>
            </q-input>

            <q-btn
              color="green"
              icon="analytics"
              label="Xem thống kê"
              unelevated
              @click="viewStats"
              :loading="loadingStats"
              size="md"
              class="full-width"
            />
          </div>
        </q-card-section>
      </q-card>
      </div>

      <q-card v-if="stats" class="q-mt-md modern-card" flat>
      <q-card-section class="bg-grey-2">
        <div class="text-h6 text-weight-bold text-grey-9">Kết quả thống kê</div>
      </q-card-section>
      <q-card-section>
        <pre class="stats-output">{{ JSON.stringify(stats, null, 2) }}</pre>
      </q-card-section>
      </q-card>
    </div>
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

<style scoped>
.export-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.page-container {
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

.modern-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.stats-output {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 500px;
  overflow: auto;
}

@media (max-width: 1023px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 599px) {
  .page-container {
    padding: 1rem !important;
  }

  .text-h3 {
    font-size: 1.75rem;
  }
}
</style>

