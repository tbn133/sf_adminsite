<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
      <div class="text-h4 q-ml-sm">{{ deviceId }}</div>
      <q-space />
      <q-btn color="primary" icon="refresh" label="Làm mới" @click="refresh" />
    </div>

    <q-tabs v-model="tab" class="q-mb-md">
      <q-tab name="overview" label="Tổng quan" />
      <q-tab name="logs" label="Logs" />
      <q-tab name="control" label="Điều khiển" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <!-- Overview Tab -->
      <q-tab-panel name="overview">
        <div class="row q-gutter-md">
          <q-card class="col-12 col-md-6">
            <q-card-section>
              <div class="text-h6">Thông tin thiết bị</div>
            </q-card-section>
            <q-card-section v-if="device">
              <div class="q-gutter-sm">
                <div><strong>Device ID:</strong> {{ device.device_id }}</div>
                <div><strong>Tên:</strong> {{ device.name }}</div>
                <div><strong>Trạng thái:</strong> 
                  <q-chip :color="device.online ? 'positive' : 'negative'" dense>
                    {{ device.online ? 'Online' : 'Offline' }}
                  </q-chip>
                </div>
                <div><strong>Lần cuối:</strong> {{ formatDate(device.last_seen) }}</div>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-6">
            <q-card-section>
              <div class="text-h6">Dữ liệu cảm biến mới nhất</div>
            </q-card-section>
            <q-card-section v-if="latestSensorData">
              <div class="q-gutter-sm">
                <div><strong>Nhiệt độ:</strong> {{ latestSensorData.temperature || 'N/A' }}°C</div>
                <div><strong>Độ ẩm:</strong> {{ latestSensorData.humidity || 'N/A' }}%</div>
                <div><strong>Độ ẩm đất:</strong> {{ latestSensorData.soil_moisture || 'N/A' }}%</div>
                <div><strong>Ánh sáng:</strong> {{ latestSensorData.light_intensity || 'N/A' }} lux</div>
                <div><strong>CO2:</strong> {{ latestSensorData.co2_level || 'N/A' }} ppm</div>
                <div class="text-caption text-grey-6">
                  Cập nhật: {{ formatDate(latestSensorData.timestamp) }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- Logs Tab -->
      <q-tab-panel name="logs">
        <q-table
          :rows="logs.sensor_logs"
          :columns="logColumns"
          row-key="id"
          :loading="loadingLogs"
          :pagination="{ rowsPerPage: 20 }"
        />
      </q-tab-panel>

      <!-- Control Tab -->
      <q-tab-panel name="control">
        <q-card>
          <q-card-section>
            <div class="text-h6">Điều khiển thiết bị</div>
          </q-card-section>
          <q-card-section>
            <div class="q-gutter-md">
              <q-toggle
                v-model="controlCommand.pump"
                label="Pump"
                color="primary"
              />
              <q-toggle
                v-model="controlCommand.fan"
                label="Fan"
                color="secondary"
              />
              <q-toggle
                v-model="controlCommand.light"
                label="Light"
                color="accent"
              />
            </div>
          </q-card-section>
          <q-card-actions>
            <q-btn color="primary" label="Gửi lệnh" @click="sendControl" />
            <q-btn flat label="Reset" @click="resetDevice" />
          </q-card-actions>
        </q-card>

        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6">Lịch sử điều khiển</div>
          </q-card-section>
          <q-card-section>
            <q-table
              :rows="controlHistory"
              :columns="controlHistoryColumns"
              row-key="id"
              :loading="loadingControlHistory"
            />
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { adminAPI, sensorsAPI, controlAPI } from '../services/api'
import { useQuasar } from 'quasar'
import { format } from 'date-fns'

const route = useRoute()
const $q = useQuasar()

const deviceId = computed(() => route.params.deviceId)
const tab = ref('overview')
const device = ref(null)
const latestSensorData = ref(null)
const logs = ref({ sensor_logs: [], control_logs: [] })
const controlHistory = ref([])
const loadingLogs = ref(false)
const loadingControlHistory = ref(false)
const controlCommand = ref({
  pump: false,
  fan: false,
  light: false
})

const logColumns = [
  { name: 'timestamp', label: 'Thời gian', field: 'timestamp', format: (val) => val ? format(new Date(val), 'dd/MM/yyyy HH:mm:ss') : 'N/A' },
  { name: 'temperature', label: 'Nhiệt độ', field: 'temperature' },
  { name: 'humidity', label: 'Độ ẩm', field: 'humidity' },
  { name: 'soil_moisture', label: 'Độ ẩm đất', field: 'soil_moisture' },
  { name: 'light_intensity', label: 'Ánh sáng', field: 'light_intensity' }
]

const controlHistoryColumns = [
  { name: 'timestamp', label: 'Thời gian', field: 'timestamp', format: (val) => val ? format(new Date(val), 'dd/MM/yyyy HH:mm:ss') : 'N/A' },
  { name: 'pump', label: 'Pump', field: 'pump', format: (val) => val ? 'ON' : 'OFF' },
  { name: 'fan', label: 'Fan', field: 'fan', format: (val) => val ? 'ON' : 'OFF' },
  { name: 'light', label: 'Light', field: 'light', format: (val) => val ? 'ON' : 'OFF' },
  { name: 'source', label: 'Nguồn', field: 'source' }
]

function formatDate(date) {
  if (!date) return 'N/A'
  return format(new Date(date), 'dd/MM/yyyy HH:mm:ss')
}

async function refresh() {
  await Promise.all([
    fetchDeviceInfo(),
    fetchLatestSensor(),
    fetchLogs(),
    fetchControlHistory()
  ])
}

async function fetchDeviceInfo() {
  try {
    const response = await adminAPI.getDevices()
    device.value = response.data.find(d => d.device_id === deviceId.value)
  } catch (error) {
    console.error('Error fetching device:', error)
  }
}

async function fetchLatestSensor() {
  try {
    const response = await sensorsAPI.getLatest(deviceId.value)
    latestSensorData.value = response.data
  } catch (error) {
    console.error('Error fetching sensor data:', error)
  }
}

async function fetchLogs() {
  try {
    loadingLogs.value = true
    const response = await adminAPI.getDeviceLogs(deviceId.value, 7)
    logs.value = response.data
  } catch (error) {
    console.error('Error fetching logs:', error)
  } finally {
    loadingLogs.value = false
  }
}

async function fetchControlHistory() {
  try {
    loadingControlHistory.value = true
    const response = await controlAPI.getHistory(deviceId.value)
    controlHistory.value = response.data
  } catch (error) {
    console.error('Error fetching control history:', error)
  } finally {
    loadingControlHistory.value = false
  }
}

async function sendControl() {
  try {
    await adminAPI.controlDevice(deviceId.value, controlCommand.value)
    $q.notify({
      type: 'positive',
      message: 'Lệnh điều khiển đã được gửi thành công'
    })
    await fetchControlHistory()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Lỗi: ' + error.message
    })
  }
}

async function resetDevice() {
  try {
    await adminAPI.resetDevice(deviceId.value)
    $q.notify({
      type: 'positive',
      message: 'Lệnh reset đã được gửi'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Lỗi: ' + error.message
    })
  }
}

onMounted(() => {
  refresh()
})
</script>

